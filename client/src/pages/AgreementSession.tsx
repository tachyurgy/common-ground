import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import VoiceRecorder from '../components/VoiceRecorder';
import TranscriptionView from '../components/TranscriptionView';
import FollowUpCard from '../components/FollowUpCard';
import ShareButton from '../components/ShareButton';
import { Skeleton, SkeletonText } from '../components/Skeleton';
import { useToastContext } from '../App';
import {
  getAgreement,
  uploadAudio,
  getAudioStatus,
  submitResponse,
  skipFollowUp,
} from '../services/api';
import type { Agreement, FollowUp, AudioRecordingStatus } from '../types';

export default function AgreementSession() {
  const { id } = useParams<{ id: string }>();
  const agreementId = Number(id);
  const toast = useToastContext();

  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [activeFollowUp, setActiveFollowUp] = useState<FollowUp | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadAgreement = useCallback(async () => {
    try {
      const result = await getAgreement(agreementId);
      setAgreement(result.agreement);
      setFollowUps(result.agreement.follow_ups);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load agreement');
    }
  }, [agreementId]);

  useEffect(() => {
    loadAgreement();
    const stored = localStorage.getItem(`agreement_${agreementId}_prompt`);
    if (stored) {
      setCurrentPrompt(stored);
      localStorage.removeItem(`agreement_${agreementId}_prompt`);
    }
  }, [agreementId, loadAgreement]);

  const pollTranscription = useCallback(
    async (recordingId: number): Promise<AudioRecordingStatus> => {
      const maxAttempts = 60;
      for (let i = 0; i < maxAttempts; i++) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const status = await getAudioStatus(agreementId, recordingId);
        if (status.status === 'completed' || status.status === 'failed') {
          return status;
        }
      }
      throw new Error('Transcription timed out');
    },
    [agreementId]
  );

  const handleRecordingComplete = async (blob: Blob) => {
    setIsProcessing(true);
    setError(null);
    toast.info('Uploading and transcribing your recording...');

    try {
      const uploadResult = await uploadAudio(agreementId, blob);
      const status = await pollTranscription(uploadResult.recording_id);

      if (status.status === 'failed') {
        throw new Error('Transcription failed. Please try again.');
      }

      setTranscription(status.transcription);
      toast.success('Transcription complete');

      const question = activeFollowUp
        ? activeFollowUp.question
        : currentPrompt || 'Initial response';

      await submitResponse(agreementId, {
        question,
        transcription: status.transcription || '',
        audio_s3_key: status.s3_key,
        phase: activeFollowUp ? 'initial' : 'initial',
      });

      toast.info('Generating contract update...');
      setActiveFollowUp(null);
      setCurrentPrompt('');

      // Poll for contract generation (give it a few seconds)
      await new Promise((resolve) => setTimeout(resolve, 5000));
      await loadAgreement();
      toast.success('Contract updated');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Processing failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSkipFollowUp = async (followUpId: number) => {
    try {
      await skipFollowUp(agreementId, followUpId);
      setFollowUps((prev) => prev.filter((f) => f.id !== followUpId));
      if (activeFollowUp?.id === followUpId) {
        setActiveFollowUp(null);
      }
    } catch (err) {
      toast.error('Failed to skip question');
    }
  };

  const handleAnswerFollowUp = (followUpId: number) => {
    const fu = followUps.find((f) => f.id === followUpId);
    if (fu) {
      setActiveFollowUp(fu);
      setCurrentPrompt(fu.question);
      setTranscription(null);
    }
  };

  if (!agreement) {
    return (
      <div className="page">
        <Skeleton width="50%" height="32px" />
        <div style={{ marginTop: 12 }}><Skeleton width="70%" height="16px" /></div>
        <div style={{ marginTop: 24 }}><SkeletonText lines={4} /></div>
      </div>
    );
  }

  return (
    <div className="page session">
      <div className="session-header">
        <h1>{agreement.title}</h1>
        <ShareButton agreementId={agreementId} />
      </div>
      {agreement.description && (
        <p className="session-description">{agreement.description}</p>
      )}

      <div className="session-status">
        <span className={`status-badge status-${agreement.status}`}>
          {agreement.status}
        </span>
        <span>{agreement.responses_count} responses</span>
        <span>{agreement.versions_count} contract versions</span>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <section className="session-recorder">
        <VoiceRecorder
          onRecordingComplete={handleRecordingComplete}
          prompt={currentPrompt || 'Tell us about the situation and what you need from this agreement.'}
          disabled={isProcessing}
        />

        {isProcessing && (
          <TranscriptionView
            transcription={null}
            isLoading={true}
          />
        )}

        {transcription && !isProcessing && (
          <TranscriptionView transcription={transcription} />
        )}
      </section>

      {followUps.length > 0 && (
        <section className="session-follow-ups">
          <h2>Follow-Up Topics</h2>
          <p>These topics could strengthen your agreement. Answer any that feel relevant.</p>
          <div className="follow-up-list">
            {followUps.map((fu) => (
              <FollowUpCard
                key={fu.id}
                followUp={fu}
                onAnswer={handleAnswerFollowUp}
                onSkip={handleSkipFollowUp}
                isActive={activeFollowUp?.id === fu.id}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

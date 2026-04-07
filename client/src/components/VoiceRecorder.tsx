import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import Waveform from './Waveform';

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  prompt?: string;
  disabled?: boolean;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function VoiceRecorder({
  onRecordingComplete,
  prompt,
  disabled = false,
}: VoiceRecorderProps) {
  const {
    isRecording,
    isPaused,
    duration,
    audioBlob,
    audioUrl,
    analyserNode,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
    error,
  } = useVoiceRecorder();

  const handleSubmit = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob);
      resetRecording();
    }
  };

  return (
    <div className="voice-recorder">
      {prompt && <p className="voice-prompt">{prompt}</p>}

      {error && <p className="voice-error">{error}</p>}

      <div className="recorder-controls">
        {!isRecording && !audioBlob && (
          <button
            className="btn btn-record"
            onClick={startRecording}
            disabled={disabled}
          >
            <span className="record-dot" />
            Start Recording
          </button>
        )}

        {isRecording && (
          <>
            <Waveform analyserNode={analyserNode} isPaused={isPaused} />
            <div className="recording-indicator">
              <div className="pulse-container">
                <span className={`pulse ${isPaused ? 'paused' : ''}`} />
                <span className="pulse-ring" />
              </div>
              <span className="duration">{formatDuration(duration)}</span>
            </div>
            <div className="recording-actions">
              {isPaused ? (
                <button className="btn btn-secondary" onClick={resumeRecording}>
                  Resume
                </button>
              ) : (
                <button className="btn btn-secondary" onClick={pauseRecording}>
                  Pause
                </button>
              )}
              <button className="btn btn-stop" onClick={stopRecording}>
                Stop
              </button>
            </div>
          </>
        )}

        {audioBlob && !isRecording && (
          <div className="playback-controls">
            <audio src={audioUrl || undefined} controls />
            <div className="playback-actions">
              <button className="btn btn-primary" onClick={handleSubmit}>
                Submit Recording
              </button>
              <button className="btn btn-secondary" onClick={resetRecording}>
                Re-record
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

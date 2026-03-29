require 'rails_helper'

RSpec.describe TranscribeAudioJob, type: :job do
  let(:agreement) { create(:agreement) }
  let(:recording) { create(:audio_recording, agreement: agreement, s3_key: 'test/audio.webm') }
  let(:s3_service) { instance_double(S3Service) }
  let(:groq_service) { instance_double(GroqTranscriptionService) }

  before do
    allow(S3Service).to receive(:new).and_return(s3_service)
    allow(GroqTranscriptionService).to receive(:new).and_return(groq_service)
  end

  describe '#perform' do
    let(:audio_data) { 'binary-audio-data' }
    let(:transcription_result) do
      { text: 'Hello world', segments: [], language: 'en', duration: 12.5 }
    end

    before do
      allow(s3_service).to receive(:download).and_return(audio_data)
      allow(groq_service).to receive(:transcribe).and_return(transcription_result)
    end

    it 'downloads the audio from S3' do
      described_class.perform_now(recording.id)

      expect(s3_service).to have_received(:download).with('test/audio.webm')
    end

    it 'sends the audio to Groq for transcription' do
      described_class.perform_now(recording.id)

      expect(groq_service).to have_received(:transcribe).with(audio_data)
    end

    it 'updates the recording status to transcribing during processing' do
      allow(s3_service).to receive(:download) do
        expect(recording.reload.status).to eq('transcribing')
        audio_data
      end

      described_class.perform_now(recording.id)
    end

    it 'updates the recording with the transcription result' do
      described_class.perform_now(recording.id)

      recording.reload
      expect(recording.status).to eq('completed')
      expect(recording.transcription).to eq('Hello world')
      expect(recording.duration).to eq(12.5)
    end

    context 'when S3 download fails' do
      before do
        allow(s3_service).to receive(:download).and_raise(StandardError, 'S3 connection failed')
      end

      it 'marks the recording as failed' do
        # retry_on will catch and retry; after final attempt the recording should be failed
        described_class.perform_now(recording.id) rescue nil

        expect(recording.reload.status).to eq('failed')
      end
    end

    context 'when Groq transcription fails' do
      before do
        allow(s3_service).to receive(:download).and_return(audio_data)
        allow(groq_service).to receive(:transcribe)
          .and_raise(GroqTranscriptionService::TranscriptionError, 'API error')
      end

      it 'marks the recording as failed' do
        described_class.perform_now(recording.id) rescue nil

        expect(recording.reload.status).to eq('failed')
      end
    end
  end

  describe 'job configuration' do
    it 'is enqueued in the default queue' do
      expect(described_class.new.queue_name).to eq('default')
    end
  end
end

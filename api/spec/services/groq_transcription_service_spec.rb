require 'rails_helper'

RSpec.describe GroqTranscriptionService do
  let(:service) { described_class.new }
  let(:audio_data) { 'fake-binary-audio-data' }

  describe '#transcribe' do
    let(:success_body) do
      {
        text: 'Hello, this is a test transcription.',
        segments: [{ start: 0, end: 2.5, text: 'Hello' }],
        language: 'en',
        duration: 5.3
      }.to_json
    end

    before do
      stub_request(:post, 'https://api.groq.com/openai/v1/audio/transcriptions')
        .to_return(status: 200, body: success_body, headers: { 'Content-Type' => 'application/json' })
    end

    it 'returns transcription text, segments, language, and duration' do
      result = service.transcribe(audio_data)

      expect(result[:text]).to eq('Hello, this is a test transcription.')
      expect(result[:segments]).to be_an(Array)
      expect(result[:language]).to eq('en')
      expect(result[:duration]).to eq(5.3)
    end

    it 'sends an Authorization Bearer header' do
      service.transcribe(audio_data)

      expect(WebMock).to have_requested(:post, 'https://api.groq.com/openai/v1/audio/transcriptions')
        .with { |req| req.headers['Authorization']&.start_with?('Bearer ') }
    end

    it 'sends multipart form data with model and format fields' do
      service.transcribe(audio_data)

      expect(WebMock).to have_requested(:post, 'https://api.groq.com/openai/v1/audio/transcriptions')
        .with { |req|
          req.headers['Content-Type'].include?('multipart/form-data') &&
          req.body.include?('whisper-large-v3-turbo') &&
          req.body.include?('verbose_json')
        }
    end

    it 'includes the audio data in the request body' do
      service.transcribe(audio_data)

      expect(WebMock).to have_requested(:post, 'https://api.groq.com/openai/v1/audio/transcriptions')
        .with { |req| req.body.include?(audio_data) }
    end

    it 'uses the provided filename' do
      service.transcribe(audio_data, filename: 'custom.webm')

      expect(WebMock).to have_requested(:post, 'https://api.groq.com/openai/v1/audio/transcriptions')
        .with { |req| req.body.include?('custom.webm') }
    end

    context 'when the API returns an error' do
      before do
        stub_request(:post, 'https://api.groq.com/openai/v1/audio/transcriptions')
          .to_return(status: 500, body: '{"error":"Internal server error"}')
      end

      it 'raises a TranscriptionError with the status code and body' do
        expect {
          service.transcribe(audio_data)
        }.to raise_error(GroqTranscriptionService::TranscriptionError, /500/)
      end
    end

    context 'when the API returns 401' do
      before do
        stub_request(:post, 'https://api.groq.com/openai/v1/audio/transcriptions')
          .to_return(status: 401, body: '{"error":"Invalid API key"}')
      end

      it 'raises a TranscriptionError' do
        expect {
          service.transcribe(audio_data)
        }.to raise_error(GroqTranscriptionService::TranscriptionError, /401/)
      end
    end

    context 'when the API returns 429 rate limit' do
      before do
        stub_request(:post, 'https://api.groq.com/openai/v1/audio/transcriptions')
          .to_return(status: 429, body: '{"error":"Rate limit exceeded"}')
      end

      it 'raises a TranscriptionError' do
        expect {
          service.transcribe(audio_data)
        }.to raise_error(GroqTranscriptionService::TranscriptionError, /429/)
      end
    end
  end
end

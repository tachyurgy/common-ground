require 'rails_helper'

RSpec.describe 'Api::Audio', type: :request do
  let(:agreement) { create(:agreement) }
  let(:s3_service) { instance_double(S3Service) }

  before do
    allow(S3Service).to receive(:new).and_return(s3_service)
  end

  describe 'POST /api/agreements/:agreement_id/audio/presign' do
    before do
      allow(s3_service).to receive(:presigned_upload_url).and_return('https://s3.amazonaws.com/presigned-url')
    end

    it 'creates a recording and returns a presigned URL' do
      post "/api/agreements/#{agreement.id}/audio/presign"

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['upload_url']).to eq('https://s3.amazonaws.com/presigned-url')
      expect(json['recording_id']).to be_present
      expect(json['s3_key']).to match(%r{agreements/#{agreement.id}/.+\.webm})
    end

    it 'persists an audio recording with uploading status' do
      expect {
        post "/api/agreements/#{agreement.id}/audio/presign"
      }.to change(AudioRecording, :count).by(1)

      recording = AudioRecording.last
      expect(recording.status).to eq('uploading')
      expect(recording.agreement_id).to eq(agreement.id)
    end

    context 'with non-existent agreement' do
      it 'returns 404' do
        post '/api/agreements/999999/audio/presign'
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe 'POST /api/agreements/:agreement_id/audio/transcribe' do
    let(:recording) { create(:audio_recording, agreement: agreement) }

    it 'enqueues TranscribeAudioJob and returns status' do
      expect {
        post "/api/agreements/#{agreement.id}/audio/transcribe", params: { recording_id: recording.id }
      }.to have_enqueued_job(TranscribeAudioJob).with(recording.id)

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['status']).to eq('transcribing')
      expect(json['recording_id']).to eq(recording.id)
    end

    context 'with non-existent recording' do
      it 'returns 404' do
        post "/api/agreements/#{agreement.id}/audio/transcribe", params: { recording_id: 999999 }
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe 'POST /api/agreements/:agreement_id/audio/upload' do
    let(:audio_file) { fixture_file_upload(StringIO.new('fake-audio-data'), 'audio/webm') }

    before do
      allow(s3_service).to receive(:upload)
    end

    it 'uploads the file and enqueues transcription' do
      file = Rack::Test::UploadedFile.new(StringIO.new('fake-audio-data'), 'audio/webm', true, original_filename: 'test.webm')

      expect {
        post "/api/agreements/#{agreement.id}/audio/upload", params: { audio: file }
      }.to have_enqueued_job(TranscribeAudioJob)

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json['status']).to eq('transcribing')
      expect(json['recording_id']).to be_present
      expect(json['s3_key']).to be_present
    end

    it 'returns 400 when no audio file is provided' do
      post "/api/agreements/#{agreement.id}/audio/upload"

      expect(response).to have_http_status(:bad_request)
      json = JSON.parse(response.body)
      expect(json['error']).to eq('No audio file provided')
    end
  end

  describe 'GET /api/agreements/:agreement_id/audio/status/:recording_id' do
    context 'with a completed recording' do
      let(:recording) { create(:audio_recording, :completed, agreement: agreement) }

      before do
        allow(s3_service).to receive(:presigned_download_url).and_return('https://s3.amazonaws.com/download-url')
      end

      it 'returns the recording status with audio_url' do
        get "/api/agreements/#{agreement.id}/audio/status/#{recording.id}"

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['id']).to eq(recording.id)
        expect(json['status']).to eq('completed')
        expect(json['transcription']).to be_present
        expect(json['duration']).to be_present
        expect(json['audio_url']).to eq('https://s3.amazonaws.com/download-url')
      end
    end

    context 'with a non-completed recording' do
      let(:recording) { create(:audio_recording, :transcribing, agreement: agreement) }

      it 'returns status without audio_url' do
        get "/api/agreements/#{agreement.id}/audio/status/#{recording.id}"

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['status']).to eq('transcribing')
        expect(json).not_to have_key('audio_url')
      end
    end

    context 'with a non-existent recording' do
      it 'returns 404' do
        get "/api/agreements/#{agreement.id}/audio/status/999999"
        expect(response).to have_http_status(:not_found)
      end
    end
  end
end

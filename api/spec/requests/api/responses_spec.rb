require 'rails_helper'

RSpec.describe 'Api::Responses', type: :request do
  let(:agreement) { create(:agreement) }

  describe 'POST /api/agreements/:agreement_id/responses' do
    let(:valid_params) do
      {
        response: {
          question: 'What matters most?',
          transcription: 'I want more open communication.',
          audio_s3_key: 'agreements/1/audio.webm',
          phase: 'initial'
        }
      }
    end

    it 'creates a response and returns it' do
      post "/api/agreements/#{agreement.id}/responses", params: valid_params

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json['response']['question']).to eq('What matters most?')
      expect(json['response']['transcription']).to eq('I want more open communication.')
      expect(json['response']['phase']).to eq('initial')
      expect(json['response']).to have_key('id')
      expect(json['response']).to have_key('created_at')
    end

    it 'persists the response to the database' do
      expect {
        post "/api/agreements/#{agreement.id}/responses", params: valid_params
      }.to change(Response, :count).by(1)
    end

    it 'enqueues GenerateContractJob' do
      expect {
        post "/api/agreements/#{agreement.id}/responses", params: valid_params
      }.to have_enqueued_job(GenerateContractJob).with(agreement.id)
    end

    it 'enqueues GenerateFollowUpsJob' do
      expect {
        post "/api/agreements/#{agreement.id}/responses", params: valid_params
      }.to have_enqueued_job(GenerateFollowUpsJob).with(agreement.id)
    end

    context 'with missing question' do
      it 'returns 422' do
        post "/api/agreements/#{agreement.id}/responses",
          params: { response: { transcription: 'test', phase: 'initial' } }

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context 'with invalid phase' do
      it 'returns 422' do
        post "/api/agreements/#{agreement.id}/responses",
          params: { response: { question: 'Q?', phase: 'bogus' } }

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context 'with non-existent agreement' do
      it 'returns 404' do
        post '/api/agreements/999999/responses', params: valid_params
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe 'GET /api/agreements/:agreement_id/responses' do
    it 'returns all responses for the agreement ordered by created_at' do
      r1 = create(:response, agreement: agreement, question: 'First?', created_at: 1.hour.ago)
      r2 = create(:response, agreement: agreement, question: 'Second?', created_at: Time.current)

      get "/api/agreements/#{agreement.id}/responses"

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['responses'].length).to eq(2)
      expect(json['responses'][0]['question']).to eq('First?')
      expect(json['responses'][1]['question']).to eq('Second?')
    end

    it 'returns the expected response shape' do
      create(:response, agreement: agreement)

      get "/api/agreements/#{agreement.id}/responses"

      json = JSON.parse(response.body)
      resp = json['responses'].first
      expect(resp).to have_key('id')
      expect(resp).to have_key('question')
      expect(resp).to have_key('transcription')
      expect(resp).to have_key('audio_s3_key')
      expect(resp).to have_key('phase')
      expect(resp).to have_key('created_at')
    end

    it 'returns empty array when no responses exist' do
      get "/api/agreements/#{agreement.id}/responses"

      json = JSON.parse(response.body)
      expect(json['responses']).to eq([])
    end

    context 'with non-existent agreement' do
      it 'returns 404' do
        get '/api/agreements/999999/responses'
        expect(response).to have_http_status(:not_found)
      end
    end
  end
end

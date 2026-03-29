require 'rails_helper'

RSpec.describe 'Api::FollowUps', type: :request do
  let(:agreement) { create(:agreement) }

  describe 'GET /api/agreements/:agreement_id/follow_ups' do
    it 'returns active (unskipped, unanswered) follow-up questions' do
      active = create(:follow_up_question, agreement: agreement)
      create(:follow_up_question, :skipped, agreement: agreement)
      create(:follow_up_question, :answered, agreement: agreement)

      get "/api/agreements/#{agreement.id}/follow_ups"

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['follow_ups'].length).to eq(1)
      expect(json['follow_ups'][0]['id']).to eq(active.id)
      expect(json['follow_ups'][0]['question']).to eq(active.question)
      expect(json['follow_ups'][0]['context']).to eq(active.context)
    end

    it 'returns empty array when no active follow-ups exist' do
      get "/api/agreements/#{agreement.id}/follow_ups"

      json = JSON.parse(response.body)
      expect(json['follow_ups']).to eq([])
    end

    context 'with non-existent agreement' do
      it 'returns 404' do
        get '/api/agreements/999999/follow_ups'
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe 'POST /api/agreements/:agreement_id/follow_ups/:id/skip' do
    let(:follow_up) { create(:follow_up_question, agreement: agreement) }

    it 'marks the follow-up as skipped' do
      post "/api/agreements/#{agreement.id}/follow_ups/#{follow_up.id}/skip"

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['status']).to eq('skipped')
      expect(follow_up.reload.skipped).to be true
    end

    context 'with non-existent follow-up' do
      it 'returns 404' do
        post "/api/agreements/#{agreement.id}/follow_ups/999999/skip"
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe 'POST /api/agreements/:agreement_id/follow_ups/:id/answer' do
    let(:follow_up) { create(:follow_up_question, agreement: agreement, question: 'How do you feel?') }

    it 'marks the follow-up as answered and creates a response' do
      expect {
        post "/api/agreements/#{agreement.id}/follow_ups/#{follow_up.id}/answer",
          params: { transcription: 'I feel great about this.', audio_s3_key: 'audio/key.webm' }
      }.to change(Response, :count).by(1)

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['status']).to eq('answered')
      expect(follow_up.reload.answered).to be true
    end

    it 'creates the response with the follow-up question text' do
      post "/api/agreements/#{agreement.id}/follow_ups/#{follow_up.id}/answer",
        params: { transcription: 'I feel great.', audio_s3_key: 'audio/key.webm' }

      created_response = agreement.responses.last
      expect(created_response.question).to eq('How do you feel?')
      expect(created_response.transcription).to eq('I feel great.')
      expect(created_response.phase).to eq('initial')
    end

    it 'enqueues GenerateContractJob' do
      expect {
        post "/api/agreements/#{agreement.id}/follow_ups/#{follow_up.id}/answer",
          params: { transcription: 'Answer text' }
      }.to have_enqueued_job(GenerateContractJob).with(agreement.id)
    end

    context 'with non-existent follow-up' do
      it 'returns 404' do
        post "/api/agreements/#{agreement.id}/follow_ups/999999/answer"
        expect(response).to have_http_status(:not_found)
      end
    end
  end
end

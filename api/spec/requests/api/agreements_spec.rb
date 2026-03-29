require 'rails_helper'

RSpec.describe 'Api::Agreements', type: :request do
  let(:gemini_service) { instance_double(GeminiService) }

  before do
    allow(GeminiService).to receive(:new).and_return(gemini_service)
  end

  describe 'POST /api/agreements' do
    let(:valid_params) do
      { agreement: { title: 'Roommate Rules', description: 'Living together', participant_names: 'Alice, Bob' } }
    end

    before do
      allow(gemini_service).to receive(:generate_voice_prompt).and_return('Tell me about your situation.')
    end

    it 'creates an agreement and returns it with an initial prompt' do
      post '/api/agreements', params: valid_params

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json['agreement']['title']).to eq('Roommate Rules')
      expect(json['agreement']['status']).to eq('draft')
      expect(json['agreement']['description']).to eq('Living together')
      expect(json['agreement']['participant_names']).to eq('Alice, Bob')
      expect(json['initial_prompt']).to eq('Tell me about your situation.')
    end

    it 'returns the full agreement shape' do
      post '/api/agreements', params: valid_params

      json = JSON.parse(response.body)
      agreement = json['agreement']
      expect(agreement).to have_key('id')
      expect(agreement).to have_key('current_version')
      expect(agreement).to have_key('follow_ups')
      expect(agreement).to have_key('responses_count')
      expect(agreement).to have_key('versions_count')
      expect(agreement).to have_key('created_at')
      expect(agreement).to have_key('updated_at')
    end

    it 'persists the agreement to the database' do
      expect {
        post '/api/agreements', params: valid_params
      }.to change(Agreement, :count).by(1)
    end

    context 'with missing title' do
      it 'returns 422' do
        post '/api/agreements', params: { agreement: { description: 'No title' } }

        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json['error']).to include('Title')
      end
    end

    context 'with missing agreement params key' do
      it 'returns 400 or 422 for missing required params' do
        post '/api/agreements', params: { title: 'Test' }

        # ActionController::ParameterMissing triggers a 400 by default in API mode
        expect(response).to have_http_status(:bad_request)
      end
    end
  end

  describe 'GET /api/agreements/:id' do
    let(:agreement) { create(:agreement, :with_version) }

    it 'returns the agreement with serialized data' do
      get "/api/agreements/#{agreement.id}"

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['agreement']['id']).to eq(agreement.id)
      expect(json['agreement']['title']).to eq(agreement.title)
      expect(json['agreement']['current_version']).to be_present
      expect(json['agreement']['current_version']['version_number']).to eq(1)
    end

    it 'includes follow_ups and counts' do
      create(:follow_up_question, agreement: agreement)
      create(:response, agreement: agreement)

      get "/api/agreements/#{agreement.id}"

      json = JSON.parse(response.body)
      expect(json['agreement']['follow_ups'].length).to eq(1)
      expect(json['agreement']['responses_count']).to eq(1)
      expect(json['agreement']['versions_count']).to eq(1)
    end

    context 'with a non-existent ID' do
      it 'returns 404' do
        get '/api/agreements/999999'

        expect(response).to have_http_status(:not_found)
        json = JSON.parse(response.body)
        expect(json['error']).to eq('Not found')
      end
    end
  end

  describe 'GET /api/agreements/:id/versions' do
    let(:agreement) { create(:agreement) }

    it 'returns all versions ordered by version_number' do
      v1 = create(:agreement_version, agreement: agreement, version_number: 1, change_summary: 'Initial')
      v2 = create(:agreement_version, agreement: agreement, version_number: 2, change_summary: 'Amendment')

      get "/api/agreements/#{agreement.id}/versions"

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['versions'].length).to eq(2)
      expect(json['versions'][0]['version_number']).to eq(1)
      expect(json['versions'][1]['version_number']).to eq(2)
      expect(json['versions'][0]).to have_key('content')
      expect(json['versions'][0]).to have_key('change_summary')
      expect(json['versions'][0]).to have_key('created_at')
    end

    it 'returns empty array when no versions exist' do
      get "/api/agreements/#{agreement.id}/versions"

      json = JSON.parse(response.body)
      expect(json['versions']).to eq([])
    end

    context 'with non-existent agreement' do
      it 'returns 404' do
        get '/api/agreements/999999/versions'
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe 'POST /api/agreements/:id/amend' do
    let(:agreement) { create(:agreement, :active) }

    before do
      allow(gemini_service).to receive(:generate_voice_prompt).and_return('What would you like to change?')
    end

    it 'returns a voice prompt for amendment' do
      post "/api/agreements/#{agreement.id}/amend", params: { context: 'Chore schedule issues' }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['prompt']).to eq('What would you like to change?')
    end

    it 'passes amendment_context to GeminiService' do
      expect(gemini_service).to receive(:generate_voice_prompt).with(
        agreement,
        amendment_context: 'Chore schedule issues'
      )

      post "/api/agreements/#{agreement.id}/amend", params: { context: 'Chore schedule issues' }
    end

    context 'with non-existent agreement' do
      it 'returns 404' do
        post '/api/agreements/999999/amend'
        expect(response).to have_http_status(:not_found)
      end
    end
  end
end

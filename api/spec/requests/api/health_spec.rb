require 'rails_helper'

RSpec.describe 'Api::Health', type: :request do
  describe 'GET /api/health' do
    it 'returns status ok with a timestamp' do
      get '/api/health'

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['status']).to eq('ok')
      expect(json['timestamp']).to be_present
    end

    it 'returns a valid ISO8601 timestamp' do
      get '/api/health'

      json = JSON.parse(response.body)
      expect { Time.iso8601(json['timestamp']) }.not_to raise_error
    end
  end
end

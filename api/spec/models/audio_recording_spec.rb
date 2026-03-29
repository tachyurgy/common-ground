require 'rails_helper'

RSpec.describe AudioRecording, type: :model do
  describe 'associations' do
    it { should belong_to(:agreement) }
  end

  describe 'validations' do
    subject { build(:audio_recording) }

    it { should validate_presence_of(:s3_key) }
    it { should allow_value('uploading').for(:status) }
    it { should allow_value('transcribing').for(:status) }
    it { should allow_value('completed').for(:status) }
    it { should allow_value('failed').for(:status) }
    it { should_not allow_value('invalid').for(:status) }

    it 'does not allow nil for status after the default callback has run' do
      recording = build(:audio_recording, status: nil)
      recording.valid?
      # The callback sets nil to 'uploading', so it's effectively never nil after validation
      expect(recording.status).to eq('uploading')
    end
  end

  describe 'defaults' do
    it 'sets status to uploading on create' do
      recording = create(:audio_recording, status: nil)
      expect(recording.status).to eq('uploading')
    end
  end

  describe '#s3_url' do
    it 'returns the full S3 URL for the recording' do
      recording = build(:audio_recording, s3_key: 'agreements/5/test.webm')
      expected = "https://test-bucket.s3.amazonaws.com/agreements/5/test.webm"
      expect(recording.s3_url).to eq(expected)
    end
  end
end

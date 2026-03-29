require 'rails_helper'

RSpec.describe S3Service do
  let(:s3_client) { instance_double(Aws::S3::Client) }
  let(:presigner) { instance_double(Aws::S3::Presigner) }
  let(:service) { described_class.new }

  before do
    allow(Aws::S3::Client).to receive(:new).and_return(s3_client)
    allow(Aws::S3::Presigner).to receive(:new).and_return(presigner)
  end

  describe '#upload' do
    it 'puts the object in S3 and returns the public URL' do
      allow(s3_client).to receive(:put_object)

      result = service.upload('test/key.webm', 'audio-data')

      expect(s3_client).to have_received(:put_object).with(
        bucket: 'test-bucket',
        key: 'test/key.webm',
        body: 'audio-data',
        content_type: 'audio/webm'
      )
      expect(result).to eq('https://test-bucket.s3.amazonaws.com/test/key.webm')
    end

    it 'accepts a custom content_type' do
      allow(s3_client).to receive(:put_object)

      service.upload('test/key.mp3', 'data', content_type: 'audio/mpeg')

      expect(s3_client).to have_received(:put_object).with(
        hash_including(content_type: 'audio/mpeg')
      )
    end
  end

  describe '#presigned_upload_url' do
    it 'returns a presigned PUT URL' do
      allow(presigner).to receive(:presigned_url).and_return('https://s3.amazonaws.com/presigned-put')

      result = service.presigned_upload_url('test/key.webm')

      expect(presigner).to have_received(:presigned_url).with(
        :put_object,
        bucket: 'test-bucket',
        key: 'test/key.webm',
        content_type: 'audio/webm',
        expires_in: 900
      )
      expect(result).to eq('https://s3.amazonaws.com/presigned-put')
    end

    it 'accepts custom content_type and expires_in' do
      allow(presigner).to receive(:presigned_url).and_return('https://url')

      service.presigned_upload_url('key', content_type: 'audio/mp3', expires_in: 300)

      expect(presigner).to have_received(:presigned_url).with(
        :put_object,
        hash_including(content_type: 'audio/mp3', expires_in: 300)
      )
    end
  end

  describe '#presigned_download_url' do
    it 'returns a presigned GET URL' do
      allow(presigner).to receive(:presigned_url).and_return('https://s3.amazonaws.com/presigned-get')

      result = service.presigned_download_url('test/key.webm')

      expect(presigner).to have_received(:presigned_url).with(
        :get_object,
        bucket: 'test-bucket',
        key: 'test/key.webm',
        expires_in: 3600
      )
      expect(result).to eq('https://s3.amazonaws.com/presigned-get')
    end

    it 'accepts custom expires_in' do
      allow(presigner).to receive(:presigned_url).and_return('https://url')

      service.presigned_download_url('key', expires_in: 600)

      expect(presigner).to have_received(:presigned_url).with(
        :get_object,
        hash_including(expires_in: 600)
      )
    end
  end

  describe '#download' do
    it 'gets the object from S3 and returns the body' do
      body_double = instance_double(StringIO, read: 'downloaded-audio-data')
      response_double = instance_double(Aws::S3::Types::GetObjectOutput, body: body_double)
      allow(s3_client).to receive(:get_object).and_return(response_double)

      result = service.download('test/key.webm')

      expect(s3_client).to have_received(:get_object).with(
        bucket: 'test-bucket',
        key: 'test/key.webm'
      )
      expect(result).to eq('downloaded-audio-data')
    end
  end

  describe '#delete' do
    it 'deletes the object from S3' do
      allow(s3_client).to receive(:delete_object)

      service.delete('test/key.webm')

      expect(s3_client).to have_received(:delete_object).with(
        bucket: 'test-bucket',
        key: 'test/key.webm'
      )
    end
  end
end

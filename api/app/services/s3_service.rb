class S3Service
  def initialize
    @client = Aws::S3::Client.new(
      region: ENV.fetch("AWS_REGION", "us-east-1"),
      access_key_id: ENV.fetch("AWS_ACCESS_KEY_ID"),
      secret_access_key: ENV.fetch("AWS_SECRET_ACCESS_KEY")
    )
    @bucket = ENV.fetch("S3_BUCKET", "common-ground-audio")
  end

  def upload(key, body, content_type: "audio/webm")
    @client.put_object(
      bucket: @bucket,
      key: key,
      body: body,
      content_type: content_type
    )
    public_url(key)
  end

  def presigned_upload_url(key, content_type: "audio/webm", expires_in: 900)
    signer = Aws::S3::Presigner.new(client: @client)
    signer.presigned_url(:put_object,
      bucket: @bucket,
      key: key,
      content_type: content_type,
      expires_in: expires_in
    )
  end

  def presigned_download_url(key, expires_in: 3600)
    signer = Aws::S3::Presigner.new(client: @client)
    signer.presigned_url(:get_object,
      bucket: @bucket,
      key: key,
      expires_in: expires_in
    )
  end

  def download(key)
    @client.get_object(bucket: @bucket, key: key).body.read
  end

  def delete(key)
    @client.delete_object(bucket: @bucket, key: key)
  end

  private

  def public_url(key)
    "https://#{@bucket}.s3.amazonaws.com/#{key}"
  end
end

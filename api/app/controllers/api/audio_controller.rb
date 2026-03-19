module Api
  class AudioController < BaseController
    before_action :set_agreement

    def presign
      key = "agreements/#{@agreement.id}/#{SecureRandom.uuid}.webm"

      recording = @agreement.audio_recordings.create!(
        s3_key: key,
        status: "uploading"
      )

      s3 = S3Service.new
      upload_url = s3.presigned_upload_url(key)

      render json: {
        upload_url: upload_url,
        recording_id: recording.id,
        s3_key: key
      }
    end

    def transcribe
      recording = @agreement.audio_recordings.find(params[:recording_id])
      TranscribeAudioJob.perform_later(recording.id)

      render json: { status: "transcribing", recording_id: recording.id }
    end

    def upload
      unless params[:audio].present?
        return render json: { error: "No audio file provided" }, status: :bad_request
      end

      key = "agreements/#{@agreement.id}/#{SecureRandom.uuid}.webm"
      s3 = S3Service.new
      s3.upload(key, params[:audio].read, content_type: params[:audio].content_type)

      recording = @agreement.audio_recordings.create!(
        s3_key: key,
        status: "uploading"
      )

      TranscribeAudioJob.perform_later(recording.id)

      render json: {
        recording_id: recording.id,
        s3_key: key,
        status: "transcribing"
      }, status: :created
    end

    def status
      recording = @agreement.audio_recordings.find(params[:recording_id])

      result = {
        id: recording.id,
        status: recording.status,
        s3_key: recording.s3_key,
        duration: recording.duration,
        transcription: recording.transcription
      }

      if recording.status == "completed" && recording.s3_key.present?
        s3 = S3Service.new
        result[:audio_url] = s3.presigned_download_url(recording.s3_key)
      end

      render json: result
    end

    private

    def set_agreement
      @agreement = Agreement.find(params[:agreement_id])
    end
  end
end

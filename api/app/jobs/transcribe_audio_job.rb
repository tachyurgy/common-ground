class TranscribeAudioJob < ApplicationJob
  queue_as :default
  retry_on StandardError, wait: :polynomially_longer, attempts: 3

  def perform(audio_recording_id)
    recording = AudioRecording.find(audio_recording_id)
    recording.update!(status: "transcribing")

    s3 = S3Service.new
    audio_data = s3.download(recording.s3_key)

    groq = GroqTranscriptionService.new
    result = groq.transcribe(audio_data)

    recording.update!(
      transcription: result[:text],
      duration: result[:duration],
      status: "completed"
    )

    recording
  rescue => e
    recording&.update(status: "failed")
    raise e
  end
end

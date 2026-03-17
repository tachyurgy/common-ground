require "net/http"
require "json"

class GroqTranscriptionService
  ENDPOINT = URI("https://api.groq.com/openai/v1/audio/transcriptions")

  def initialize
    @api_key = ENV.fetch("GROQ_API_KEY")
  end

  def transcribe(audio_data, filename: "recording.webm", language: "en")
    boundary = "----FormBoundary#{SecureRandom.hex(16)}"

    body = build_multipart_body(boundary, audio_data, filename, language)

    request = Net::HTTP::Post.new(ENDPOINT)
    request["Authorization"] = "Bearer #{@api_key}"
    request["Content-Type"] = "multipart/form-data; boundary=#{boundary}"
    request.body = body

    http = Net::HTTP.new(ENDPOINT.host, ENDPOINT.port)
    http.use_ssl = true
    http.read_timeout = 300

    response = http.request(request)

    unless response.is_a?(Net::HTTPSuccess)
      raise TranscriptionError, "Groq API error (#{response.code}): #{response.body}"
    end

    parsed = JSON.parse(response.body)
    {
      text: parsed["text"],
      segments: parsed["segments"],
      language: parsed["language"],
      duration: parsed["duration"]
    }
  end

  class TranscriptionError < StandardError; end

  private

  def build_multipart_body(boundary, audio_data, filename, language)
    parts = []

    parts << "--#{boundary}\r\n"
    parts << "Content-Disposition: form-data; name=\"file\"; filename=\"#{filename}\"\r\n"
    parts << "Content-Type: audio/webm\r\n\r\n"
    parts << audio_data
    parts << "\r\n"

    { "model" => "whisper-large-v3-turbo", "response_format" => "verbose_json", "language" => language }.each do |key, value|
      parts << "--#{boundary}\r\n"
      parts << "Content-Disposition: form-data; name=\"#{key}\"\r\n\r\n"
      parts << value
      parts << "\r\n"
    end

    parts << "--#{boundary}--\r\n"
    parts.join
  end
end

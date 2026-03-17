require "net/http"
require "json"

class GeminiService
  MODEL = "gemini-2.5-flash"
  BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"

  def initialize
    @api_key = ENV.fetch("GEMINI_API_KEY")
  end

  def generate_contract(responses, existing_contract: nil)
    context = responses.map { |r| "Q: #{r[:question]}\nA: #{r[:transcription]}" }.join("\n\n")

    system_prompt = if existing_contract
      <<~PROMPT
        You are a behavioral agreement facilitator. A participant has provided additional input to amend an existing behavioral contract.

        Here is the current contract:
        #{existing_contract}

        Based on the new responses below, update the contract. Preserve sections that haven't changed. Add or modify sections based on the new input. Output the full updated contract in markdown format.

        Structure the contract with these sections as appropriate:
        - Overview (brief summary of what this agreement covers)
        - Specific Behavioral Commitments (observable actions each party agrees to)
        - Boundaries (what each party will not do)
        - Communication Agreements (how and when to discuss issues)
        - Check-in Schedule (regular intervals to review progress)
        - Conflict Resolution Process (steps when disagreements arise)
        - Amendment Process (how to propose changes)
      PROMPT
    else
      <<~PROMPT
        You are a behavioral agreement facilitator. Based on the participant responses below, synthesize a clear, actionable behavioral contract between the involved parties.

        Focus on:
        - Translating abstract needs into observable, specific behaviors
        - Reducing ambiguity
        - Creating mutual accountability
        - Being empathetic but concrete

        Output the contract in markdown format with these sections:
        - Overview (brief summary of what this agreement covers)
        - Specific Behavioral Commitments (observable actions each party agrees to)
        - Boundaries (what each party will not do)
        - Communication Agreements (how and when to discuss issues)
        - Check-in Schedule (regular intervals to review progress)
        - Conflict Resolution Process (steps when disagreements arise)
        - Amendment Process (how to propose changes)

        Write in second person ("you will...") to make it personal and direct. Keep language warm but specific.
      PROMPT
    end

    call_gemini(system_prompt, context)
  end

  def generate_follow_ups(responses, existing_contract: nil)
    context = responses.map { |r| "Q: #{r[:question]}\nA: #{r[:transcription]}" }.join("\n\n")

    system_prompt = <<~PROMPT
      You are a behavioral agreement facilitator. Based on the conversation so far, suggest 3-5 follow-up topics that would strengthen the behavioral contract.

      #{existing_contract ? "Current contract:\n#{existing_contract}\n\n" : ""}

      For each follow-up, provide:
      1. A clear question to ask the participant (conversational tone, as if speaking)
      2. Brief context about why this topic matters

      Focus on:
      - Areas where commitments could be more specific
      - Topics that were mentioned but not fully explored
      - Common relationship pain points not yet addressed
      - Practical logistics that make agreements work (timing, frequency, signals)

      Return JSON array: [{"question": "...", "context": "..."}]
      Return ONLY the JSON array, no other text.
    PROMPT

    raw = call_gemini(system_prompt, context)
    parse_follow_ups(raw)
  end

  def generate_voice_prompt(agreement, amendment_context: nil)
    system_prompt = <<~PROMPT
      You are a behavioral agreement facilitator conducting a voice conversation. Generate a single warm, conversational prompt that invites the participant to speak about what they'd like to change in their behavioral agreement.

      #{amendment_context ? "They want to amend: #{amendment_context}" : "This is the start of a new agreement session."}

      #{agreement&.current_version ? "Current contract:\n#{agreement.current_version.content}" : ""}

      The prompt should:
      - Feel like a real person asking a thoughtful question
      - Be specific enough to guide but open enough for free expression
      - Be 2-3 sentences max
      - End with a clear question

      Return ONLY the prompt text, nothing else.
    PROMPT

    call_gemini(system_prompt, "Generate the voice prompt.")
  end

  private

  def call_gemini(system_instruction, user_content)
    uri = URI("#{BASE_URL}/#{MODEL}:generateContent?key=#{@api_key}")

    body = {
      system_instruction: { parts: [ { text: system_instruction } ] },
      contents: [ { parts: [ { text: user_content } ] } ],
      generationConfig: { temperature: 0.7, maxOutputTokens: 4096 }
    }

    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.read_timeout = 60

    request = Net::HTTP::Post.new(uri)
    request["Content-Type"] = "application/json"
    request.body = body.to_json

    response = http.request(request)

    unless response.is_a?(Net::HTTPSuccess)
      raise GeminiError, "Gemini API error (#{response.code}): #{response.body}"
    end

    parsed = JSON.parse(response.body)
    parsed.dig("candidates", 0, "content", "parts", 0, "text") || ""
  end

  def parse_follow_ups(raw)
    cleaned = raw.gsub(/```json\n?/, "").gsub(/```\n?/, "").strip
    JSON.parse(cleaned)
  rescue JSON::ParserError
    []
  end

  class GeminiError < StandardError; end
end

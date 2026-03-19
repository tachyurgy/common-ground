class GenerateFollowUpsJob < ApplicationJob
  queue_as :default
  retry_on StandardError, wait: :polynomially_longer, attempts: 3

  def perform(agreement_id)
    agreement = Agreement.find(agreement_id)

    responses = agreement.responses.map do |r|
      { question: r.question, transcription: r.transcription }
    end

    return if responses.empty?

    gemini = GeminiService.new
    existing = agreement.current_version&.content

    follow_ups = gemini.generate_follow_ups(responses, existing_contract: existing)

    follow_ups.each do |fu|
      agreement.follow_up_questions.create!(
        question: fu["question"],
        context: fu["context"]
      )
    end
  end
end

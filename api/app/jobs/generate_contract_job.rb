class GenerateContractJob < ApplicationJob
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

    contract_content = gemini.generate_contract(responses, existing_contract: existing)

    version_number = agreement.next_version_number
    change_summary = version_number > 1 ? "Amendment based on new participant input" : "Initial behavioral contract"

    agreement.versions.create!(
      version_number: version_number,
      content: contract_content,
      change_summary: change_summary
    )

    agreement.update!(status: "active") if agreement.status == "draft"
  end
end

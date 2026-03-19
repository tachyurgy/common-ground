module Api
  class AgreementsController < BaseController
    before_action :set_agreement, only: [ :show, :versions, :amend ]

    def create
      agreement = Agreement.create!(agreement_params)

      gemini = GeminiService.new
      prompt = gemini.generate_voice_prompt(agreement)

      render json: {
        agreement: serialize_agreement(agreement),
        initial_prompt: prompt
      }, status: :created
    end

    def show
      render json: { agreement: serialize_agreement(@agreement) }
    end

    def versions
      render json: {
        versions: @agreement.versions.map { |v|
          {
            id: v.id,
            version_number: v.version_number,
            content: v.content,
            change_summary: v.change_summary,
            created_at: v.created_at.iso8601
          }
        }
      }
    end

    def amend
      gemini = GeminiService.new
      prompt = gemini.generate_voice_prompt(
        @agreement,
        amendment_context: params[:context]
      )

      render json: { prompt: prompt }
    end

    private

    def set_agreement
      @agreement = Agreement.find(params[:id])
    end

    def agreement_params
      params.require(:agreement).permit(:title, :description, :participant_names)
    end

    def serialize_agreement(agreement)
      {
        id: agreement.id,
        title: agreement.title,
        description: agreement.description,
        status: agreement.status,
        participant_names: agreement.participant_names,
        current_version: agreement.current_version&.then { |v|
          {
            id: v.id,
            version_number: v.version_number,
            content: v.content,
            change_summary: v.change_summary,
            created_at: v.created_at.iso8601
          }
        },
        follow_ups: agreement.active_follow_ups.map { |fu|
          {
            id: fu.id,
            question: fu.question,
            context: fu.context
          }
        },
        responses_count: agreement.responses.count,
        versions_count: agreement.versions.count,
        created_at: agreement.created_at.iso8601,
        updated_at: agreement.updated_at.iso8601
      }
    end
  end
end

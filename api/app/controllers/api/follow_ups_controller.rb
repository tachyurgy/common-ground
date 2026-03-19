module Api
  class FollowUpsController < BaseController
    before_action :set_agreement

    def index
      follow_ups = @agreement.follow_up_questions.active
      render json: {
        follow_ups: follow_ups.map { |fu|
          { id: fu.id, question: fu.question, context: fu.context }
        }
      }
    end

    def skip
      follow_up = @agreement.follow_up_questions.find(params[:id])
      follow_up.update!(skipped: true)
      render json: { status: "skipped" }
    end

    def answer
      follow_up = @agreement.follow_up_questions.find(params[:id])
      follow_up.update!(answered: true)

      @agreement.responses.create!(
        question: follow_up.question,
        transcription: params[:transcription],
        audio_s3_key: params[:audio_s3_key],
        phase: "initial"
      )

      GenerateContractJob.perform_later(@agreement.id)

      render json: { status: "answered" }
    end

    private

    def set_agreement
      @agreement = Agreement.find(params[:agreement_id])
    end
  end
end

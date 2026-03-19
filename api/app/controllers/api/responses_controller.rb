module Api
  class ResponsesController < BaseController
    before_action :set_agreement

    def create
      response = @agreement.responses.create!(response_params)

      GenerateContractJob.perform_later(@agreement.id)
      GenerateFollowUpsJob.perform_later(@agreement.id)

      render json: {
        response: {
          id: response.id,
          question: response.question,
          transcription: response.transcription,
          phase: response.phase,
          created_at: response.created_at.iso8601
        }
      }, status: :created
    end

    def index
      responses = @agreement.responses.order(created_at: :asc)
      render json: {
        responses: responses.map { |r|
          {
            id: r.id,
            question: r.question,
            transcription: r.transcription,
            audio_s3_key: r.audio_s3_key,
            phase: r.phase,
            created_at: r.created_at.iso8601
          }
        }
      }
    end

    private

    def set_agreement
      @agreement = Agreement.find(params[:agreement_id])
    end

    def response_params
      params.require(:response).permit(:question, :transcription, :audio_s3_key, :phase)
    end
  end
end

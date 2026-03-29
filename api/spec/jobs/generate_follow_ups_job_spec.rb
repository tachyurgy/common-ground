require 'rails_helper'

RSpec.describe GenerateFollowUpsJob, type: :job do
  let(:agreement) { create(:agreement) }
  let(:gemini_service) { instance_double(GeminiService) }

  before do
    allow(GeminiService).to receive(:new).and_return(gemini_service)
  end

  describe '#perform' do
    let(:follow_ups) do
      [
        { 'question' => 'How often should you check in?', 'context' => 'Regular check-ins help.' },
        { 'question' => 'What about guests?', 'context' => 'Guest policies prevent conflicts.' }
      ]
    end

    before do
      allow(gemini_service).to receive(:generate_follow_ups).and_return(follow_ups)
    end

    context 'when the agreement has responses' do
      before do
        create(:response, agreement: agreement, question: 'What matters?', transcription: 'Communication.')
      end

      it 'generates follow-ups via Gemini' do
        described_class.perform_now(agreement.id)

        expect(gemini_service).to have_received(:generate_follow_ups).with(
          [{ question: 'What matters?', transcription: 'Communication.' }],
          existing_contract: nil
        )
      end

      it 'creates follow-up questions in the database' do
        expect {
          described_class.perform_now(agreement.id)
        }.to change(FollowUpQuestion, :count).by(2)
      end

      it 'saves the correct question and context' do
        described_class.perform_now(agreement.id)

        questions = agreement.follow_up_questions.order(:created_at)
        expect(questions[0].question).to eq('How often should you check in?')
        expect(questions[0].context).to eq('Regular check-ins help.')
        expect(questions[1].question).to eq('What about guests?')
        expect(questions[1].context).to eq('Guest policies prevent conflicts.')
      end

      it 'creates follow-ups with defaults (not skipped, not answered)' do
        described_class.perform_now(agreement.id)

        agreement.follow_up_questions.each do |fq|
          expect(fq.skipped).to eq(false)
          expect(fq.answered).to eq(false)
        end
      end

      context 'with an existing version' do
        before do
          create(:agreement_version, agreement: agreement, version_number: 1, content: 'Existing contract')
        end

        it 'passes the existing contract to Gemini' do
          described_class.perform_now(agreement.id)

          expect(gemini_service).to have_received(:generate_follow_ups).with(
            anything,
            existing_contract: 'Existing contract'
          )
        end
      end
    end

    context 'when the agreement has no responses' do
      it 'does not call Gemini and creates no follow-ups' do
        expect {
          described_class.perform_now(agreement.id)
        }.not_to change(FollowUpQuestion, :count)

        expect(gemini_service).not_to have_received(:generate_follow_ups)
      end
    end

    context 'when Gemini returns an empty array' do
      before do
        create(:response, agreement: agreement)
        allow(gemini_service).to receive(:generate_follow_ups).and_return([])
      end

      it 'creates no follow-up questions' do
        expect {
          described_class.perform_now(agreement.id)
        }.not_to change(FollowUpQuestion, :count)
      end
    end
  end

  describe 'job configuration' do
    it 'is enqueued in the default queue' do
      expect(described_class.new.queue_name).to eq('default')
    end
  end
end

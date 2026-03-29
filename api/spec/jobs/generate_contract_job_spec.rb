require 'rails_helper'

RSpec.describe GenerateContractJob, type: :job do
  let(:agreement) { create(:agreement) }
  let(:gemini_service) { instance_double(GeminiService) }

  before do
    allow(GeminiService).to receive(:new).and_return(gemini_service)
  end

  describe '#perform' do
    let(:contract_text) { "## Behavioral Contract\n\nYou will be respectful..." }

    before do
      allow(gemini_service).to receive(:generate_contract).and_return(contract_text)
    end

    context 'when the agreement has responses' do
      before do
        create(:response, agreement: agreement, question: 'What matters?', transcription: 'Respect.')
      end

      it 'generates a contract via Gemini' do
        described_class.perform_now(agreement.id)

        expect(gemini_service).to have_received(:generate_contract).with(
          [{ question: 'What matters?', transcription: 'Respect.' }],
          existing_contract: nil
        )
      end

      it 'creates a new agreement version' do
        expect {
          described_class.perform_now(agreement.id)
        }.to change(AgreementVersion, :count).by(1)

        version = agreement.versions.last
        expect(version.version_number).to eq(1)
        expect(version.content).to eq(contract_text)
        expect(version.change_summary).to eq('Initial behavioral contract')
      end

      it 'updates the agreement status from draft to active' do
        described_class.perform_now(agreement.id)

        expect(agreement.reload.status).to eq('active')
      end

      it 'does not change status if already active' do
        agreement.update!(status: 'active')

        described_class.perform_now(agreement.id)

        expect(agreement.reload.status).to eq('active')
      end

      context 'with an existing version' do
        before do
          create(:agreement_version, agreement: agreement, version_number: 1, content: 'Old contract')
        end

        it 'passes the existing contract to Gemini for amendment' do
          described_class.perform_now(agreement.id)

          expect(gemini_service).to have_received(:generate_contract).with(
            anything,
            existing_contract: 'Old contract'
          )
        end

        it 'creates version 2 with amendment summary' do
          described_class.perform_now(agreement.id)

          version = agreement.versions.reorder(version_number: :desc).first
          expect(version.version_number).to eq(2)
          expect(version.change_summary).to eq('Amendment based on new participant input')
        end
      end
    end

    context 'when the agreement has no responses' do
      it 'does not call Gemini and does not create a version' do
        expect {
          described_class.perform_now(agreement.id)
        }.not_to change(AgreementVersion, :count)

        expect(gemini_service).not_to have_received(:generate_contract)
      end
    end
  end

  describe 'job configuration' do
    it 'is enqueued in the default queue' do
      expect(described_class.new.queue_name).to eq('default')
    end
  end
end

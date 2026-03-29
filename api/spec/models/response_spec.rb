require 'rails_helper'

RSpec.describe Response, type: :model do
  describe 'associations' do
    it { should belong_to(:agreement) }
  end

  describe 'validations' do
    it { should validate_presence_of(:question) }
    it { should allow_value('initial').for(:phase) }
    it { should allow_value('amendment').for(:phase) }
    it { should_not allow_value('invalid').for(:phase) }
    it { should_not allow_value(nil).for(:phase) }
  end

  describe 'scopes' do
    let(:agreement) { create(:agreement) }

    describe '.initial' do
      it 'returns only initial-phase responses' do
        initial = create(:response, agreement: agreement, phase: 'initial')
        create(:response, :amendment, agreement: agreement)

        expect(Response.initial).to eq([initial])
      end
    end

    describe '.amendments' do
      it 'returns only amendment-phase responses' do
        create(:response, agreement: agreement, phase: 'initial')
        amendment = create(:response, :amendment, agreement: agreement)

        expect(Response.amendments).to eq([amendment])
      end
    end
  end
end

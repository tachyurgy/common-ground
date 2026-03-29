require 'rails_helper'

RSpec.describe AgreementVersion, type: :model do
  describe 'associations' do
    it { should belong_to(:agreement) }
  end

  describe 'validations' do
    subject { build(:agreement_version) }

    it { should validate_presence_of(:version_number) }
    it { should validate_uniqueness_of(:version_number).scoped_to(:agreement_id) }
    it { should validate_presence_of(:content) }
  end

  describe 'default_scope' do
    let(:agreement) { create(:agreement) }

    it 'orders by version_number ascending' do
      v3 = create(:agreement_version, agreement: agreement, version_number: 3)
      v1 = create(:agreement_version, agreement: agreement, version_number: 1)
      v2 = create(:agreement_version, agreement: agreement, version_number: 2)

      expect(agreement.versions.to_a).to eq([v1, v2, v3])
    end
  end
end

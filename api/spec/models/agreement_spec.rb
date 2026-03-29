require 'rails_helper'

RSpec.describe Agreement, type: :model do
  describe 'associations' do
    it { should have_many(:versions).class_name('AgreementVersion').dependent(:destroy) }
    it { should have_many(:responses).dependent(:destroy) }
    it { should have_many(:follow_up_questions).dependent(:destroy) }
    it { should have_many(:audio_recordings).dependent(:destroy) }
  end

  describe 'validations' do
    it { should validate_presence_of(:title) }
    it { should allow_value('draft').for(:status) }
    it { should allow_value('active').for(:status) }
    it { should allow_value('completed').for(:status) }
    it { should allow_value(nil).for(:status) }
    it { should_not allow_value('invalid').for(:status) }
  end

  describe 'defaults' do
    it 'sets status to draft on create' do
      agreement = create(:agreement, status: nil)
      expect(agreement.status).to eq('draft')
    end

    it 'does not override an explicitly provided status' do
      agreement = create(:agreement, status: 'active')
      expect(agreement.status).to eq('active')
    end
  end

  describe '#current_version' do
    let(:agreement) { create(:agreement) }

    it 'returns nil when no versions exist' do
      expect(agreement.current_version).to be_nil
    end

    it 'returns the version with the highest version_number' do
      create(:agreement_version, agreement: agreement, version_number: 1)
      v2 = create(:agreement_version, agreement: agreement, version_number: 2)
      create(:agreement_version, agreement: agreement, version_number: 3)

      # The highest version_number is 3
      expect(agreement.current_version.version_number).to eq(3)
    end
  end

  describe '#next_version_number' do
    let(:agreement) { create(:agreement) }

    it 'returns 1 when no versions exist' do
      expect(agreement.next_version_number).to eq(1)
    end

    it 'returns the next number after the highest existing version' do
      create(:agreement_version, agreement: agreement, version_number: 1)
      create(:agreement_version, agreement: agreement, version_number: 2)
      expect(agreement.next_version_number).to eq(3)
    end
  end

  describe '#active_follow_ups' do
    let(:agreement) { create(:agreement) }

    it 'returns only unanswered, unskipped follow-up questions' do
      active = create(:follow_up_question, agreement: agreement)
      create(:follow_up_question, :skipped, agreement: agreement)
      create(:follow_up_question, :answered, agreement: agreement)

      expect(agreement.active_follow_ups).to eq([active])
    end

    it 'returns empty when all follow-ups are handled' do
      create(:follow_up_question, :skipped, agreement: agreement)
      create(:follow_up_question, :answered, agreement: agreement)

      expect(agreement.active_follow_ups).to be_empty
    end
  end
end

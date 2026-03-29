require 'rails_helper'

RSpec.describe FollowUpQuestion, type: :model do
  describe 'associations' do
    it { should belong_to(:agreement) }
  end

  describe 'validations' do
    it { should validate_presence_of(:question) }
  end

  describe 'defaults' do
    it 'sets skipped to false on create when nil' do
      fq = create(:follow_up_question, skipped: nil, answered: nil)
      expect(fq.skipped).to eq(false)
    end

    it 'sets answered to false on create when nil' do
      fq = create(:follow_up_question, skipped: nil, answered: nil)
      expect(fq.answered).to eq(false)
    end
  end

  describe 'scopes' do
    let(:agreement) { create(:agreement) }

    describe '.active' do
      it 'returns questions that are not skipped and not answered' do
        active = create(:follow_up_question, agreement: agreement)
        create(:follow_up_question, :skipped, agreement: agreement)
        create(:follow_up_question, :answered, agreement: agreement)

        expect(FollowUpQuestion.active).to eq([active])
      end
    end

    describe '.skipped' do
      it 'returns only skipped questions' do
        create(:follow_up_question, agreement: agreement)
        skipped = create(:follow_up_question, :skipped, agreement: agreement)

        expect(FollowUpQuestion.skipped).to eq([skipped])
      end
    end
  end
end

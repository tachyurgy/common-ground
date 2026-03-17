class FollowUpQuestion < ApplicationRecord
  belongs_to :agreement

  validates :question, presence: true

  scope :active, -> { where(skipped: false, answered: false) }
  scope :skipped, -> { where(skipped: true) }

  before_validation :set_defaults, on: :create

  private

  def set_defaults
    self.skipped = false if skipped.nil?
    self.answered = false if answered.nil?
  end
end

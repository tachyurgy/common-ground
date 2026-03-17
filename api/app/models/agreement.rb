class Agreement < ApplicationRecord
  has_many :versions, class_name: "AgreementVersion", dependent: :destroy
  has_many :responses, dependent: :destroy
  has_many :follow_up_questions, dependent: :destroy
  has_many :audio_recordings, dependent: :destroy

  validates :title, presence: true
  validates :status, inclusion: { in: %w[draft active completed], allow_nil: true }

  before_validation :set_defaults, on: :create

  def current_version
    versions.reorder(version_number: :desc).first
  end

  def next_version_number
    (versions.maximum(:version_number) || 0) + 1
  end

  def active_follow_ups
    follow_up_questions.where(skipped: false, answered: false)
  end

  private

  def set_defaults
    self.status ||= "draft"
  end
end

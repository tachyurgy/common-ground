class Response < ApplicationRecord
  belongs_to :agreement

  validates :question, presence: true
  validates :phase, inclusion: { in: %w[initial amendment] }

  scope :initial, -> { where(phase: "initial") }
  scope :amendments, -> { where(phase: "amendment") }
end

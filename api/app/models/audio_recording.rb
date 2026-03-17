class AudioRecording < ApplicationRecord
  belongs_to :agreement

  validates :s3_key, presence: true
  validates :status, inclusion: { in: %w[uploading transcribing completed failed] }

  before_validation :set_defaults, on: :create

  def s3_url
    "https://#{ENV.fetch('S3_BUCKET', 'common-ground-audio')}.s3.amazonaws.com/#{s3_key}"
  end

  private

  def set_defaults
    self.status ||= "uploading"
  end
end

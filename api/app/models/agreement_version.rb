class AgreementVersion < ApplicationRecord
  belongs_to :agreement

  validates :version_number, presence: true, uniqueness: { scope: :agreement_id }
  validates :content, presence: true

  default_scope { order(version_number: :asc) }
end

FactoryBot.define do
  factory :agreement_version do
    association :agreement
    sequence(:version_number) { |n| n }
    content { "## Behavioral Contract\n\nThis agreement covers household responsibilities." }
    change_summary { "Initial behavioral contract" }
  end
end

FactoryBot.define do
  factory :agreement do
    sequence(:title) { |n| "Roommate Agreement #{n}" }
    description { "A behavioral agreement between roommates" }
    status { "draft" }
    participant_names { "Alice, Bob" }

    trait :active do
      status { "active" }
    end

    trait :completed do
      status { "completed" }
    end

    trait :with_version do
      after(:create) do |agreement|
        create(:agreement_version, agreement: agreement, version_number: 1)
      end
    end

    trait :with_responses do
      after(:create) do |agreement|
        create_list(:response, 2, agreement: agreement)
      end
    end

    trait :with_follow_ups do
      after(:create) do |agreement|
        create_list(:follow_up_question, 3, agreement: agreement)
      end
    end
  end
end

FactoryBot.define do
  factory :follow_up_question do
    association :agreement
    sequence(:question) { |n| "How would you handle situation #{n}?" }
    context { "This topic came up but wasn't fully addressed." }
    skipped { false }
    answered { false }

    trait :skipped do
      skipped { true }
    end

    trait :answered do
      answered { true }
    end
  end
end

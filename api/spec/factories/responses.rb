FactoryBot.define do
  factory :response do
    association :agreement
    sequence(:question) { |n| "What matters most to you about topic #{n}?" }
    transcription { "I think we should communicate more openly about schedules." }
    audio_s3_key { "agreements/1/response-audio.webm" }
    phase { "initial" }

    trait :amendment do
      phase { "amendment" }
    end
  end
end

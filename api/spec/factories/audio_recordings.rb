FactoryBot.define do
  factory :audio_recording do
    association :agreement
    sequence(:s3_key) { |n| "agreements/1/recording-#{n}.webm" }
    status { "uploading" }
    duration { nil }
    transcription { nil }

    trait :transcribing do
      status { "transcribing" }
    end

    trait :completed do
      status { "completed" }
      duration { 45.2 }
      transcription { "This is the transcribed audio content." }
    end

    trait :failed do
      status { "failed" }
    end
  end
end

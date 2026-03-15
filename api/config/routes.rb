Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    get "health", to: "health#show"

    resources :agreements, only: [ :create, :show ] do
      member do
        get :versions
        post :amend
      end

      resources :responses, only: [ :create, :index ]

      resources :follow_ups, only: [ :index ] do
        member do
          post :skip
          post :answer
        end
      end

      post "audio/presign", to: "audio#presign"
      post "audio/upload", to: "audio#upload"
      post "audio/transcribe", to: "audio#transcribe"
      get "audio/status/:recording_id", to: "audio#status", as: :audio_status
    end
  end
end

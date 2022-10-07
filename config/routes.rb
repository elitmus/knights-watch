Proctoring::Engine.routes.draw do
  resources :video_streamings do
    collection do
      get 'distribute_channel_to_rooms'
      get 'user_channel'
    end
    member do
      get 'event'
      get 'stream_channel'
      get 'stream_room'
      post 'upload_video'
    end
  end

  namespace :api do
    namespace :v1 do
      resources :authentication, only: :create
    end
  end
end

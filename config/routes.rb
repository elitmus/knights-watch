KnightsWatch::Engine.routes.draw do
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
end

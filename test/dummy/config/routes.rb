Rails.application.routes.draw do
  resources :video_proctorings
  mount Proctoring::Engine => "/proctoring"
end

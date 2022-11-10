module Proctoring
  class ApplicationController < ActionController::Base
    protect_from_forgery with: :exception

    def authenticate_app_token
      token_valid? request.headers['Token']
    end

    private

    def token_valid?(token)
      JWT.decode token, Proctoring.hundred_ms_auth_secret, true, { algorithm: 'HS256' }
    rescue StandardError => _e
      render json: { success: false, error: 'You are not an authorized person.' }, status: :unauthorized
    end
  end
end

module Proctoring
  class ApplicationController < ActionController::Base
    protect_from_forgery with: :exception

    def authenticate_app_token
      token_valid? request.headers['Token']
    end

    private

    def token_valid?(token)
      JWT.decode token, Proctoring.app_secret, true, { algorithm: 'HS256' }
      true
    rescue StandardError => _e
      render json: { success: false, error: e.message }, status: :unauthorize
    end
  end
end

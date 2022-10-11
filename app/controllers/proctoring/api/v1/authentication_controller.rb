# frozen_string_literal: true

module Proctoring::Api::V1
  class AuthenticationController < ApplicationController
    include Proctoring::TokensHelper
    include Proctoring::HundredMsServiceHelper

    def create
      room = generate_room({ event_id: params[:event_id] })
      authentication_params = {
        user_id: params[:user_id],
        role: params[:role],
        room_id: room['id']
      }
      authentication_token = generate_authentication_token(authentication_params)
      render json: { success: true, authentication_token: authentication_token }
    rescue StandardError => e
      render json: { success: false, error: e.message }, status: :internal_error
    end
  end
end

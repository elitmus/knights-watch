# frozen_string_literal: true

module Proctoring::Api::V1
  class AuthenticationController < Proctoring::ApplicationController
    include Proctoring::TokensHelper
    include Proctoring::HundredMsServiceHelper
    before_action :authenticate_app_token

    def create
      event_id = params[:event_id]
      user_id = params[:user_id]
      role = params[:role]
      max_people_allowed = params[:max_people_allowed]

      room_id = room_already_exists?(event_id, user_id)

      room_id ||= room_exists_with_space?(event_id, user_id, role, max_people_allowed)

      if room_id.blank?
        room_id = generate_room({ event_id: event_id })['id']
        add_room_to_the_cache(room_id, user_id, role, event_id)
      end

      authentication_params = { user_id: user_id, role: role, room_id: room_id }
      authentication_token = generate_authentication_token(authentication_params)
      render json: { success: true, authentication_token: authentication_token }
    rescue StandardError => e
      render json: { success: false, error: e.message }, status: :internal_server_error
    end
  end
end

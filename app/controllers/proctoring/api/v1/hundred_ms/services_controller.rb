# frozen_string_literal: true

module Proctoring::Api::V1
  module HundredMs
    class ServicesController < Proctoring::ApplicationController
      skip_before_action :verify_authenticity_token
      before_action :authenticate_api_token

      def create
        hundred_ms_response = JSON.parse(request.raw_post)

        case hundred_ms_response['type']
        when 'recording.success'
          data = hundred_ms_response['data']
          room_name = data['room_name']
          invitation_code = room_name.split('-').first
          ProctoringStorageHelper.initiate_processing(invitation_code)
        end

        render json: {}
      end
    end
  end
end

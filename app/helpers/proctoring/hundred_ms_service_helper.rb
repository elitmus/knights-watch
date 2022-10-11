# frozen_string_literal: true

require 'net/http'
module Proctoring
  module HundredMsServiceHelper
    include Proctoring::TokensHelper
    def generate_room(params)
      uri = get_api_url('create_room')
      uri = URI.parse(uri)
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = true
      request = Net::HTTP::Post.new(uri.path, { 'Content-Type' => 'application/json' })
      request['Authorization'] = "Bearer #{generate_management_token}"
      body = {
        name: "#{params[:event_id]}-#{SecureRandom.uuid}",
        description: "Room for the event with id - #{params[:event_id]}",
        template_id: Proctoring.hundred_ms_template_id,
        recording_info: {
          enabled: true,
          upload_info: {
            type: 's3',
            location: Proctoring.hundred_ms_s3_bucket,
            prefix: params[:event_id],
            options: {
              region: Proctoring.hundred_ms_s3_region
            },
            credentials: {
              key: Proctoring.hundred_ms_s3_access_key,
              secret: Proctoring.hundred_ms_s3_access_secret
            }
          }
        },
        region: 'in'
      }
      request.body = body.to_json
      response = http.request(request)
      JSON.parse(response.body)
    end

    private

    def get_api_url(service_name)
      case service_name
      when 'create_room'
        'https://api.100ms.live/v2/rooms'
      end
    end
  end
end

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
      body = get_create_room_request_parameters(params[:event_id])
      request.body = body.to_json
      response = http.request(request)
      JSON.parse(response.body)
    end

    def room_already_exists?(event_id, user_id)
      rooms = fetch_rooms_for_a_event(event_id)
      return if rooms.blank?

      rooms.each do |room_id, candidates|
        candidates.each do |candidate_hash|
          return room_id if candidate_hash[:user_id] == user_id
        end
      end; nil
    end

    def room_exists_with_space?(event_id, user_id, role, max_people_allowed)
      rooms = fetch_rooms_for_a_event(event_id)
      return if rooms.blank?

      rooms.each do |room_id, candidates|
        roles = candidates.map { |candidate_hash| candidate_hash[:role] }
        next if roles.count(role) >= max_people_allowed.to_i

        candidates << { user_id: user_id, role: role }
        rooms[room_id] = candidates
        Rails.cache.write("100ms_room_details_#{event_id}", rooms, expires_in: 2.hours)
        return room_id
      end; nil
    end

    def add_room_to_the_cache(room_id, user_id, role, event_id)
      candidates = []
      candidates << { user_id: user_id, role: role }
      rooms = fetch_rooms_for_a_event(event_id) || {}
      rooms[room_id] = candidates
      Rails.cache.write("100ms_room_details_#{event_id}", rooms, expires_in: 2.hours)
    end

    private

    def get_api_url(service_name)
      case service_name
      when 'create_room'
        'https://api.100ms.live/v2/rooms'
      end
    end

    def get_create_room_request_parameters(event_id)
      {
        name: "#{event_id}-#{SecureRandom.uuid}",
        description: "Room for the event with id - #{event_id}",
        template_id: Proctoring.hundred_ms_template_id,
        recording_info: {
          enabled: true,
          upload_info: {
            type: 's3',
            location: Proctoring.hundred_ms_s3_bucket,
            prefix: event_id,
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
    end

    def fetch_rooms_for_a_event(event_id)
      Rails.cache.read("100ms_room_details_#{event_id}")
    end
  end
end

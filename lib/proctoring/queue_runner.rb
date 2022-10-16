require 'jwt'
require 'securerandom'
require 'rails/all'
require_relative "../../app/helpers/proctoring/tokens_helper.rb"
require_relative "../../app/helpers/proctoring/hundred_ms_service_helper.rb"

module Proctoring
  class QueueRunner
    include Proctoring::TokensHelper
    include Proctoring::HundredMsServiceHelper
    def run_task(input)
      system("echo 'I am executed inside queue runner with input #{input}'")
      system("echo 'Class Name = #{input.class}'")
      room_id = room_already_exists?(input[:event_id], input[:user_id])

      room_id ||= room_exists_with_space?(input[:event_id], input[:user_id], input[:role], input[:max_people_allowed])

      return if room_id.present?

      room_id = generate_room({ event_id: input[:event_id] })['id']
      add_room_to_the_cache(room_id, input[:user_id], input[:role], input[:event_id])
    end
  end
end

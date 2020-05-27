module Proctoring
  class VideoStreaming < ApplicationRecord
    validates :channel,  presence: true
    validates :user_id,  presence: true
    validates :event_id, presence: true
    validates_uniqueness_of :user_id, scope: [:event_id]

    enum status: { active: 0, stopped: 1 }

    before_validation :ensure_channel_has_a_value

    scope :by_event, ->(event_id) { where(event_id: event_id) }

    def self.setup_rooms(event_id, no_of_users_in_channel)
      @channels = VideoStreaming.by_event(event_id).active.pluck(:channel)
      video_streaming_room = VideoStreamingRoom.where(event_id: event_id, total_users: no_of_users_in_channel).active
      if (video_streaming_room.length.positive?)
        channels_in_room = video_streaming_room.pluck(:channels)&.flatten
        return if @channels == channels_in_room
        video_streaming_room.map(&:closed!)
      end

      channels_by_room = @channels.each_slice(no_of_users_in_channel).to_a if @channels.length.positive? && no_of_users_in_channel.positive?
      VideoStreaming.transaction do
        channels_by_room.each do |channels|
          VideoStreamingRoom.create(event_id: event_id, total_users: no_of_users_in_channel, channels: channels)
        end
      end
    end

    def self.open_join_channel(user_id, event_id)
      video_streaming = VideoStreaming.find_by(event_id: event_id, user_id: user_id)
      unless video_streaming
        video_streaming = VideoStreaming.create(event_id: event_id, user_id: user_id)
      end
      video_streaming
    end

    private

      def ensure_channel_has_a_value
        if channel.nil?
          self.channel = SecureRandom.uuid
          self.status = :active
        end
      end
  end
end

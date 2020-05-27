module Proctoring
  class VideoStreamingRoom < ApplicationRecord
    validates :room,  presence: true
    validates :event_id, presence: true
    validates :channels, presence: true
    validates :total_users, presence: true

    # validate :check_total_users_equals_channels

    enum status: { active: 0, closed: 1 }

    before_validation :ensure_room_has_a_value

    private

      def ensure_room_has_a_value
        if room.nil?
          self.room = SecureRandom.uuid
          self.status = :active
        end
      end

      # def check_total_users_equals_channels
      #   if self.total_users != self.channels&.length
      #     errors.add(:total_users, "Total users are not equal to channels in room.")
      #   end
      # end
  end
end

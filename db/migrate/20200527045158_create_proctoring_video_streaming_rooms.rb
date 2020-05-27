class CreateProctoringVideoStreamingRooms < ActiveRecord::Migration[6.0]
  def change
    create_table :proctoring_video_streaming_rooms do |t|
      t.string  :room, limit: 38, null: false
      t.integer :event_id
      t.integer :status
      t.json    :channels
      t.integer :total_users

      t.timestamps
    end
  end
end

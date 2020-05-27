class CreateProctoringVideoStreamings < ActiveRecord::Migration[6.0]
  def change
    create_table :proctoring_video_streamings do |t|
      t.string :channel, limit: 38, null: false
      t.integer :user_id
      t.integer :event_id
      t.integer :status

      t.timestamps
    end

    add_index :proctoring_video_streamings, :channel, unique: true
    add_index :proctoring_video_streamings, [:user_id, :event_id]
  end
end

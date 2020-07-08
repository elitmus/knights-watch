class CreateVideoProctorings < ActiveRecord::Migration[6.0]
  def change
    create_table :video_proctorings do |t|

      t.timestamps
    end
  end
end

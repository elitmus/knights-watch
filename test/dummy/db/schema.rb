# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `rails
# db:schema:load`. When creating a new database, `rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2020_05_27_045158) do

  create_table "proctoring_video_streaming_rooms", force: :cascade do |t|
    t.string "room", limit: 38, null: false
    t.integer "event_id"
    t.integer "status"
    t.json "channels"
    t.integer "total_users"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "proctoring_video_streamings", force: :cascade do |t|
    t.string "channel", limit: 38, null: false
    t.integer "user_id"
    t.integer "event_id"
    t.integer "status"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["channel"], name: "index_proctoring_video_streamings_on_channel", unique: true
    t.index ["user_id", "event_id"], name: "index_proctoring_video_streamings_on_user_id_and_event_id"
  end

end

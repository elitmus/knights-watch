require 'test_helper'
module Proctoring
  class VideoStreamingsTest < ActionDispatch::SystemTestCase
    include Engine.routes.url_helpers
    setup do
      @video_streaming = proctoring_video_streamings(:one)
    end

    test "visiting the index" do
      visit video_streamings_url
      assert_selector "h1", text: "Video Streamings"
    end

    test "creating a Video streaming" do
      visit video_streamings_url
      click_on "New Video Streaming"

      fill_in "Channel", with: @video_streaming.channel
      fill_in "User", with: @video_streaming.user_id
      click_on "Create Video streaming"

      assert_text "Video streaming was successfully created"
      click_on "Back"
    end

    test "updating a Video streaming" do
      visit video_streamings_url
      click_on "Edit", match: :first

      fill_in "Channel", with: @video_streaming.channel
      fill_in "User", with: @video_streaming.user_id
      click_on "Update Video streaming"

      assert_text "Video streaming was successfully updated"
      click_on "Back"
    end

    test "destroying a Video streaming" do
      visit video_streamings_url
      page.accept_confirm do
        click_on "Destroy", match: :first
      end

      assert_text "Video streaming was successfully destroyed"
    end
  end
end

require 'test_helper'

module Proctoring
  class VideoStreamingsControllerTest < ActionDispatch::IntegrationTest
    include Engine.routes.url_helpers

    setup do
      @video_streaming = proctoring_video_streamings(:one)
    end

    test "should get index" do
      get video_streamings_url
      assert_response :success
    end

    test "should get new" do
      get new_video_streaming_url
      assert_response :success
    end

    test "should create video_streaming" do
      assert_difference('VideoStreaming.count') do
        post video_streamings_url, params: { video_streaming: { channel: @video_streaming.channel, user_id: @video_streaming.user_id } }
      end

      assert_redirected_to video_streaming_url(VideoStreaming.last)
    end

    test "should show video_streaming" do
      get video_streaming_url(@video_streaming)
      assert_response :success
    end

    test "should get edit" do
      get edit_video_streaming_url(@video_streaming)
      assert_response :success
    end

    test "should update video_streaming" do
      patch video_streaming_url(@video_streaming), params: { video_streaming: { channel: @video_streaming.channel, user_id: @video_streaming.user_id } }
      assert_redirected_to video_streaming_url(@video_streaming)
    end

    test "should destroy video_streaming" do
      assert_difference('VideoStreaming.count', -1) do
        delete video_streaming_url(@video_streaming)
      end

      assert_redirected_to video_streamings_url
    end
  end
end

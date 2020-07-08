require 'test_helper'

class VideoProctoringsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @video_proctoring = video_proctorings(:one)
  end

  test "should get index" do
    get video_proctorings_url
    assert_response :success
  end

  test "should get new" do
    get new_video_proctoring_url
    assert_response :success
  end

  test "should create video_proctoring" do
    assert_difference('VideoProctoring.count') do
      post video_proctorings_url, params: { video_proctoring: {  } }
    end

    assert_redirected_to video_proctoring_url(VideoProctoring.last)
  end

  test "should show video_proctoring" do
    get video_proctoring_url(@video_proctoring)
    assert_response :success
  end

  test "should get edit" do
    get edit_video_proctoring_url(@video_proctoring)
    assert_response :success
  end

  test "should update video_proctoring" do
    patch video_proctoring_url(@video_proctoring), params: { video_proctoring: {  } }
    assert_redirected_to video_proctoring_url(@video_proctoring)
  end

  test "should destroy video_proctoring" do
    assert_difference('VideoProctoring.count', -1) do
      delete video_proctoring_url(@video_proctoring)
    end

    assert_redirected_to video_proctorings_url
  end
end

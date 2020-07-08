require "application_system_test_case"

class VideoProctoringsTest < ApplicationSystemTestCase
  setup do
    @video_proctoring = video_proctorings(:one)
  end

  test "visiting the index" do
    visit video_proctorings_url
    assert_selector "h1", text: "Video Proctorings"
  end

  test "creating a Video proctoring" do
    visit video_proctorings_url
    click_on "New Video Proctoring"

    click_on "Create Video proctoring"

    assert_text "Video proctoring was successfully created"
    click_on "Back"
  end

  test "updating a Video proctoring" do
    visit video_proctorings_url
    click_on "Edit", match: :first

    click_on "Update Video proctoring"

    assert_text "Video proctoring was successfully updated"
    click_on "Back"
  end

  test "destroying a Video proctoring" do
    visit video_proctorings_url
    page.accept_confirm do
      click_on "Destroy", match: :first
    end

    assert_text "Video proctoring was successfully destroyed"
  end
end

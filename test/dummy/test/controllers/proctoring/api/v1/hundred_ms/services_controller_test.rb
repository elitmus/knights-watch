require 'test_helper'

module Proctoring
  module Api
    module V1
      module HundredMs
        class ServicesControllerTest < ActionDispatch::IntegrationTest
          include Engine.routes.url_helpers

          test 'should not accept webhook request' do
            post(
              api_v1_hundred_ms_services_url,
              params: '{"version": "2.0", "type": "recording.success", "data": {"room_name": "xyz123-ammam-mamam-mmama"}}',
              headers: {
                'Api-Secret': 'Wrong Secret'
              }
            )

            assert_response :unauthorized
            result = JSON.parse(response.body)
            assert_equal result['success'], false
            assert_equal result['error'], 'You are not an authorized person.'
          end

          test 'should accept webhook request' do
            post(
              api_v1_hundred_ms_services_url,
              params: '{"version": "2.0", "type": "recording.success", "data": {"room_name": "xyz123-ammam-mamam-mmama"}}',
              headers: {
                'Api-Secret': Proctoring.hundred_ms_webhook_secret
              }
            )

            assert_response :success
            result = JSON.parse(response.body)
            assert result['success']
          end
        end
      end
    end
  end
end

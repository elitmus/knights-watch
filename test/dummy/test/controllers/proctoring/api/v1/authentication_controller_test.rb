require 'test_helper'

module Proctoring
  module Api
    module V1
      class AuthenticationControllerTest < ActionDispatch::IntegrationTest
        include Engine.routes.url_helpers

        test 'should not generate authentication token' do
          post(
            api_v1_authentication_index_url,
            params: {
              event_id: 10,
              user_id: 2,
              role: 'proctor',
              max_people_allowed: 2
            }
          )

          assert_response :unauthorized
          result = JSON.parse(response.body)
          assert_equal result['success'], false
          assert_equal result['error'], 'You are not an authorized person.'
        end

        test 'should generate authentication token' do
          post(
            api_v1_authentication_index_url,
            params: {
              event_id: 10,
              user_id: 2,
              role: 'proctor',
              max_people_allowed: 2
            },
            headers: {
              'Token': Proctoring::TokensHelper.encode_authentication_token
            }
          )

          assert_response :success
          result = JSON.parse(response.body)
          assert_equal result['success'], true
          assert_not_nil result['authentication_token']
        end
      end
    end
  end
end

require 'test_helper'

module Proctoring
  class TokensHelperTest < ActionView::TestCase
    test 'generate authentication token' do
      authentication_token = generate_authentication_token({ room_id: 10, user_id: 5, role: 'proctor' })
      decoded_token = JWT.decode authentication_token, '', true, { algorithm: 'HS256' }
      assert_nil decoded_token.first['access_key']
      assert_equal decoded_token.first['room_id'], 10
      assert_equal decoded_token.first['user_id'], 5
      assert_equal decoded_token.first['role'], 'proctor'
      assert_equal decoded_token.first['type'], 'app'
      assert_equal decoded_token.first['version'], 2
    end

    test 'generate management token' do
      management_token = generate_management_token
      decoded_token = JWT.decode management_token, '', true, { algorithm: 'HS256' }
      assert_nil decoded_token.first['access_key']
      assert_equal decoded_token.first['type'], 'management'
      assert_equal decoded_token.first['version'], 2
    end

    test 'encode authentication token' do
      encoded_authentication_token = Proctoring::TokensHelper.encode_authentication_token
      decoded_token = JWT.decode encoded_authentication_token, 'random-key', true, { algorithm: 'HS256' }
      assert_equal decoded_token.first['app_name'], 'default'
      assert_equal decoded_token.first['type'], 'application'
      assert_equal decoded_token.first['version'], 2
    end
  end
end

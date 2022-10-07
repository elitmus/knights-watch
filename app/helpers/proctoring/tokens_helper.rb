# frozen_string_literal: true
require 'jwt'
require 'securerandom'

module Proctoring
  module TokensHelper
    def generate_authentication_token(params)
      now = Time.now
      exp = now + 1.day
      payload = {
        access_key: Proctoring.hundred_ms_app_access_key,
        room_id: params[:room_id],
        user_id: params[:user_id],
        role: params[:role],
        type: 'app',
        jti: SecureRandom.uuid,
        version: 2,
        iat: now.to_i,
        nbf: now.to_i,
        exp: exp.to_i
      }
      JWT.encode(payload, Proctoring.hundred_ms_app_secret, 'HS256')
    end

    def generate_management_token
      now = Time.now
      exp = now + 1.day
      payload = {
        access_key: Proctoring.hundred_ms_app_access_key,
        type: 'management',
        version: 2,
        jti: SecureRandom.uuid,
        iat: now.to_i,
        nbf: now.to_i,
        exp: exp.to_i
      }
      JWT.encode(payload, Proctoring.hundred_ms_app_secret, 'HS256')
    end

    def self.encode_authentication_token
      now = Time.now
      exp = now + 10.minutes
      payload = {
        app_name: Proctoring.app_name,
        type: 'application',
        jti: SecureRandom.uuid,
        version: 2,
        iat: now.to_i,
        nbf: now.to_i,
        exp: exp.to_i
      }
      JWT.encode payload, Proctoring.hundred_ms_auth_secret, 'HS256'
    end
  end
end

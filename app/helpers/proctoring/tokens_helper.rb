# frozen_string_literal: true
require 'jwt'
require 'securerandom'

module Proctoring
  module TokensHelper
    def generate_authentication_token(params)
      generate_app_token(
        params[:room_id],
        params[:user_id],
        params[:role],
        Proctoring.hundred_ms_app_access_key,
        Proctoring.hundred_ms_app_secret
      )
    end

    def generate_management_token
      management_token(
        Proctoring.hundred_ms_app_access_key,
        Proctoring.hundred_ms_app_secret
      )
    end

    def self.encode_authentication_token
      payload = { app_name: Proctoring.app_name }
      JWT.encode payload, Proctoring.app_secret, 'HS256'
    end

    private

    def generate_app_token(room_id, user_id, role, app_access_key, app_secret)
      now = Time.now
      exp = now + 1.day
      payload = {
        access_key: app_access_key,
        room_id: room_id,
        user_id: user_id,
        role: role,
        type: 'app',
        jti: SecureRandom.uuid,
        version: 2,
        iat: now.to_i,
        nbf: now.to_i,
        exp: exp.to_i
      }
      JWT.encode(payload, app_secret, 'HS256')
    end

    def management_token(app_access_key, app_secret)
      now = Time.now
      exp = now + 1.day
      payload = {
        access_key: app_access_key,
        type: 'management',
        version: 2,
        jti: SecureRandom.uuid,
        iat: now.to_i,
        nbf: now.to_i,
        exp: exp.to_i
      }
      JWT.encode(payload, app_secret, 'HS256')
    end
  end
end

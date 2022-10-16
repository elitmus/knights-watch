module Proctoring
  mattr_accessor :media_server_url
  mattr_accessor :app_name
  mattr_accessor :turn_secret
  mattr_accessor :hundred_ms_app_access_key
  mattr_accessor :hundred_ms_app_secret
  mattr_accessor :hundred_ms_template_id
  mattr_accessor :hundred_ms_s3_bucket
  mattr_accessor :hundred_ms_s3_access_key
  mattr_accessor :hundred_ms_s3_access_secret
  mattr_accessor :hundred_ms_s3_region
  mattr_accessor :app_secret
  mattr_accessor :redis_host
  mattr_accessor :redis_port
  mattr_accessor :redis_db

  self.media_server_url = 'localhost:8000'
  self.app_name = 'default'
  self.turn_secret = 'secret'

  def self.setup(&block)
    yield self
  end

  def self.turnserver_session_credentials
    time     = Time.zone.now.strftime("%s")
    timeout  = 15000
    username = time.to_i + timeout
    password = Base64.encode64 (OpenSSL::HMAC.digest("sha1", turn_secret, username.to_s))
    turn_servers = [{
      "urls" => "turn:#{media_server_url}:3478",
      "username" => username,
      "credential" => password.chomp
    }]
    turn_servers
  end

  class Engine < ::Rails::Engine
    isolate_namespace Proctoring
  end
end

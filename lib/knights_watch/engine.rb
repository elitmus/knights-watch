module KnightsWatch
  class << self
    mattr_accessor :media_server_url
    mattr_accessor :app_name
    self.media_server_url = 'localhost:8000'
    self.app_name = 'default'
  end

  def self.setup(&block)
    yield self
  end

  class Engine < ::Rails::Engine
    isolate_namespace KnightsWatch
  end
end

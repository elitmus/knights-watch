module Proctoring
  class << self
    mattr_accessor :media_server_url
    self.media_server_url = 'nainital-beta.elitmus.com'
  end

  def self.setup(&block)
    yield self
  end

  class Engine < ::Rails::Engine
    isolate_namespace Proctoring
  end
end

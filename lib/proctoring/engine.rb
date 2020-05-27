module Proctoring
  class << self
    mattr_accessor :stream_video_url
    self.stream_video_url = 'https://nainital-beta.elitmus.com:8000/'
  end

  def self.setup(&block)
    yield self
  end

  class Engine < ::Rails::Engine
    isolate_namespace Proctoring
  end
end

require_relative 'boot'

require 'rails/all'
# Rails 8 no longer loads sprockets via rails/all; require it explicitly so the
# asset pipeline (config.assets.*) is available for the engine's assets.
require 'sprockets/railtie'

Bundler.require(*Rails.groups)
require "proctoring"

module Dummy
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 6.0

    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration can go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded after loading
    # the framework and any gems in your application.
  end
end


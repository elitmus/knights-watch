$:.push File.expand_path("lib", __dir__)

# Maintain your gem's version:
require "proctoring/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |spec|
  spec.name        = "proctoring"
  spec.version     = Proctoring::VERSION
  spec.authors     = ["Shireesh Jayashetty", "Manish Sharma"]
  spec.email       = ["shireesh@elitmus.com", "manish.sharma@elitmus.com"]
  spec.homepage    = "https://www.elitmus.com"
  spec.summary     = "A proctoring rails engine to provide proctoring features to varuious apps in a decentralised way."
  spec.description = "A proctoring rails engine to provide proctoring features to varuious apps in a decentralised way."
  spec.license     = "MIT"

  # Prevent pushing this gem to RubyGems.org. To allow pushes either set the 'allowed_push_host'
  # to allow pushing to a single host or delete this section to allow pushing to any host.
  if spec.respond_to?(:metadata)
    spec.metadata["allowed_push_host"] = "https://rubygems.org"
  else
    raise "RubyGems 2.0 or newer is required to protect against " \
      "public gem pushes."
  end

  spec.files = Dir["{app,config,db,lib}/**/*", "MIT-LICENSE", "Rakefile", "README.md"]

  spec.add_dependency "rails", "~> 7.2"

  spec.add_development_dependency "sqlite3"
  spec.add_runtime_dependency 'jwt'
end

require 'redis'

module Proctoring
  module RedisFetcher
    waiting = true
    result = ''

    while waiting
      begin
        key, result = $redis_cli.blpop($all_app_config['ChannelName'], timeout: 5)
        waiting = false
      rescue StandardError => _e
        $log.debug('connection lost')
        waiting = false
        sleep 0.5
      ensure
        sleep 0.1
        next
      end
    end
    result
  end
end

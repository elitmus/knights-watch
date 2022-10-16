require 'redis'

module Proctoring
  module RedisFetcher
    def self.fetch_from_redis(redis_cli, log)
      waiting = true
      result = ''
      system("echo 'I am executed in the  redis fetcher from redis start'")
      while waiting
        system("echo 'I am executed in the  redis fetcher from redis start - WHILE LOoop'")
        begin
          key, result = redis_cli.blpop('candidate_code:queue', timeout: 5)
          system("echo 'I am executed in the  redis fetcher from redis start - WHILE result #{result}'")
          waiting = false
        rescue StandardError => _e
          log.debug('connection lost')
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
end

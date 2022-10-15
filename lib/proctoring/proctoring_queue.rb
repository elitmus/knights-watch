require 'redis'
require "redis"
require "json"
require "yaml"
require "logger"
require "securerandom"
require 'proctoring/queue_runner'

module Proctoring
  module ProctoringQueue
    def self.set_global_variables
      $running = true
      $running = true
      $input_file_name = 'inp'
      $proj_dir = Dir.pwd
      $process_name = ENV['PROCESS_NAME']
      $root_path = ENV['ROOT_PATH']
      $log = Logger.new("log/output_#{$process_name}.log", 'monthly')
      $cronus_pid = "pids/#{$process_name.gsub(/:/, '')}.pid"
      $working_dir =  "#{$proj_dir}/temp/#{$process_name.gsub(/:/,'')}"
      $process_key = SecureRandom.hex
      $cronus_name = ENV['CRONUS_NAME'] || ENV['HOST']
      $private_channel = "channel_#{$cronus_name}"
      $private__reply_channel = "channel_#{$cronus_name}_reply"
    end

    def self.load_config
      environment = ENV['CRONUS_ENV']  || ENV['RACK_ENV']  || ENV['RAILS_ENV'] || 'development'
      begin
        $app_env = environment
        $all_app_config = YAML.load_file(File.dirname(__FILE__) + "/../config/settings.yml")[environment]
        $log.level = environment == 'development' ? Logger::DEBUG : Logger::WARN
        $redis_cli = Redis.new(url: $all_app_config['Address'])
        $allowed_apps = %w[dallas ph-dallas].map(&:downcase)
      rescue StandardError => e
        abort(e.message)
      end
    end

    def self.daemonize
      set_global_variables
      $pid = -1
      if ARGV[0] == 'start'
        load_config
        fork_it
      elsif ARGV[0] == 'stop'
        kill_the_fork
      elsif ARGV[0] == 'restart'
        kill_the_fork
        load_config
        fork_it
      end
    end

    def self.fork_it
      nochdir = true
      noclose = true
      Process.daemon(nochdir, noclose)
      Signal.trap('HUP') { $running = false }
      write_pids_to_file
      start_worker
      sleep 1
    end

    def self.kill_the_fork
      begin
        pid = File.read($cronus_pid).to_i

        File.delete($cronus_pid)
        if pid != -1
          Process.kill('HUP', pid)
        end
      rescue StandardError => e
        $log.debug(e.message)
      end
    end

    def self.write_pids_to_file
      $pid = Process.pid
      begin
        if $pid != -1
          File.open(cronus_pid, 'w') { |file| file.write($pid) }
        end
      rescue StandardError => e
        $log.debug(e.message)
      end
    end

    def self.start_worker
      qr = Proctoring::QueueRunner.new

      while $running do
        input = Proctoring::RedisFetcher.fetch_from_redis
        if input.nil? || input.empty?
          sleep 0.2
        else
          begin
            input_json = JSON.parse(input)
            output = qr.run_task input
            results_key = $app_config['RedisResultPrefix']
            $redis_cli.rpush results_key, output
          rescue StandardError => e
            $log.error(e.message)
            $log.error(e.backtrace)
          end
        end
      end
    end
  end
end

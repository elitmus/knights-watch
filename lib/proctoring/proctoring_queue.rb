require 'redis'
require 'json'
require 'yaml'
require 'logger'
require 'securerandom'
require 'proctoring/queue_runner'
require 'proctoring/redis_fetcher'

module Proctoring
  module ProctoringQueue
    def self.set_global_variables
      $running = true
      $running = true
      $input_file_name = 'inp'
      $proj_dir = Dir.pwd
      $process_name = 'elitw:1'
      $log = Logger.new("lib/output_#{$process_name}.log", 'monthly')
      $proctoring_pid = "pids/#{$process_name.gsub(/:/, '')}.pid"
      system("echo 'I am executed in the set global variables'")
    end

    def self.load_config
      environment = ENV['CRONUS_ENV'] || ENV['RACK_ENV'] || ENV['RAILS_ENV'] || 'development'
      begin
        $app_env = environment
        $log.level = environment == 'development' ? Logger::DEBUG : Logger::WARN
        $redis_cli = Redis.new(url: 'redis://localhost:6379/4')
        system("echo 'I am executed in the load config'")
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
        system("echo 'I am executed in the daemonize'")
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
      system("echo 'I am executed in the fork it'")
      sleep 1
    end

    def self.kill_the_fork
      begin
        pid = File.read($proctoring_pid).to_i

        File.delete($proctoring_pid)
        if pid != -1
          Process.kill('HUP', pid)
        end
        system("echo 'I am executed in the kill the fork'")
      rescue StandardError => e
        $log.debug(e.message)
      end
    end

    def self.write_pids_to_file
      $pid = Process.pid
      begin
        if $pid != -1
          File.open($proctoring_pid, 'w') { |file| file.write($pid) }
        end
        system("echo 'I am executed in the write pids to file'")
      rescue StandardError => e
        $log.debug(e.message)
      end
    end

    def self.start_worker
      qr = Proctoring::QueueRunner.new
      system("echo 'I am executed in the start worker start'")
      while $running do
        system("echo 'I am executed in the start worker start - in the start of while loop'")
        input = Proctoring::RedisFetcher.fetch_from_redis($redis_cli, $log)
        system("echo 'I am executed in the start worker - result fetch from redis #{input}'")
        if input.nil? || input.empty?
          sleep 0.2
        else
          begin
            input_json = JSON.parse(input)
            output = qr.run_task input_json
            results_key = 'dallas_resposne'
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
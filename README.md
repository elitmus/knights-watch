# Proctoring
Short description and motivation.

## Usage

Current features:

* Live Video streaming single and bulk

Future plans:

* Face detection
* AI video proctoring
* AI image proctoring

***This Gem is currently under development and API can change in future***

### Per user recording

```erb
  <%= render template: 'proctoring/video_streamings/_video_recording.html.erb'%>
  <div id="proctoring-data" data-stream-video-url=<%=Proctoring.media_server_url  %>></div>
```

now `startRecordingSingleSession(eventId, userId)` javascript method will be available at the global scope which can be called when the session needs to be recorded. Both eventId and userId are required paramaeters for now.

## Installation
Add this line to your application's Gemfile:

```ruby
gem 'proctoring'
```

And then execute:
```bash
$ bundle
```

Or install it yourself as:
```bash
$ gem install proctoring
```
mount in application

```ruby
mount Proctoring::Engine => '/proctoring'
```

create initializer file

```ruby
Proctoring.setup do |config|
  config.media_server_url = 'server-url without protocol and no extra forward slashes'
end
```

## Contributing
Contribution directions go here.

## License
The gem is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).

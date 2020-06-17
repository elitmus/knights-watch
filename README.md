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

#### Available API for recorder

HTML if want to show video to user ids can be passed to Object.
```html
<video id="videoInput" autoplay width="480px" height="360px" poster="img/webrtc.png" controls></video>
<video id="videoOutput" autoplay width="480px" height="360px" poster="img/webrtc.png" controls></video>
```

```Javascript
const options = {
  event, // unique event
  user, // unique user
  inputVideoElmId, // Id for video element to preview while recording, default: false
  proctoringDataElmId, // Id to look for proctoring data like media url and appName, default: 'proctoring-data'
}

const videoRecorder = new VideoRecording(options);

// Record entire session without intervals, browser and server will try to save video for entire session in one file
videoRecorder.startRecordingSingleSession();

// Play recorded video
videoRecorder.playVideo(elmId); // Id to show the recorded video in element, default elmId= 'videoOutput'

// Stop and play video
videoRecorder.stopAndPlayVideo(elmID); // Id to show the recorded video in element, default elmId= 'videoOutput'

// Stop recording at any point
videoRecorder.stopRecording();

// Save videos in intervals
videoRecorder.startRecordingSingleSessionWithInterval(interval); // save videos in intervals, default and minimum session = 30000 = 30sec.

// Record video for specific time
// Can be used for viva type questions where by using this we can specify timing for each question.
videoRecorder.recordAndPlaySessionWithTimeout(timeout); // default timeout = 10000 = 10 sec minimum.

```

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

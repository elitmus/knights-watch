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

### Live streaming

Add yarn dependencies to your product:

```bash
yarn add rtcmulticonnection
```

For adding rtc libraries in the page you want to proctor add:

```erb
render file: 'proctoring/video_streaming/_socket_rtc_scripts.html.erb'
```

Now create a new js/jsx file and add below script:

```jsx
const RTCMultiConnection = require('rtcmulticonnection');

const connectVideo = async (eventId, userId) => {
  const userConferenceId = `proctoring-video_streaming-${eventId}-${userId}`;
  const resp = await fetch(`/proctoring/video_streaming/user_channel.json?event_id=${eventId}&user_id=${userId}`);
  const proctorResp = await resp.json();
  const connection = new RTCMultiConnection();
  connection.socketURL = proctorResp.socketURL;
  connection.session = {
    audio: false,
    video: true,
  };

  connection.sdpConstraints.mandatory = {
    OfferToReceiveAudio: false,
    OfferToReceiveVideo: true,
  };

  connection.userid = userConferenceId;

  connection.extra = {
    eventId,
    userId,
  };


  connection.setUserPreferences = (userPreferences) => {
    // eslint-disable-next-line no-param-reassign
    userPreferences.dontGetRemoteStream = true;
    return userPreferences;
  };

  connection.onstream = () => {};
  if (proctorResp && proctorResp.room_id) {
    connection.openOrJoin(proctorResp.room_id, () => {
      setTimeout(() => {
        const localStream = connection.attachStreams[0];
        localStream.mute('audio');
      }, 500);
    });
  }
};
export default {
  createJoinRoom(eventId, userId) {
    connectVideo(eventId, userId);
  },
};
```

Use createJoinRoom in your react component, eventId and userId are mandatory in above module.
You can also use it as a ES5 script no extra changes needed other than the module definition.

### Per user recording

```erb
  <%= render template: 'proctoring/video_streamings/_video_recording.html.erb'%>
  <div id="proctoring-data" data-stream-video-url=<%=Proctoring.stream_video_url%>></div>
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

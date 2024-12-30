## About Knights Watch

![Open issues](https://img.shields.io/github/issues/elitmus/knights-watch)
![Commit activity](https://img.shields.io/github/commit-activity/m/elitmus/knights-watch)

### Introduction

:wave: Welcome to the eLitmus Knights Watch.  Knights Watch is a open source project providing a platform suitable for creating modular applications with live video proctoring capabillites. 

It provides the following feature:

* Video Proctoring Client side integration for services:
  
  1. [Kurento Media Server](https://www.kurento.org)
  2. [100ms](https://www.100ms.live/)

* Option to configure the video recording.

Future plans:

* Face detection
* AI video proctoring
* AI image proctoring
* Proctor can see candidate live screen
* Proctor can chat with candidate
* Auto Proctoring

***This Gem is currently under development and API can change in future***

### Usage

This section demonstrates how to use this engine with the RubyOnRails application to build web-based video proctoring application.

**100ms Example**

#### Set Up Variables

1. Add this line to your application's Gemfile:

```ruby
gem 'proctoring', '=1.0.0', git: 'https://github.com/elitmus/knights-watch.git'
```

2. And then execute:
```bash
$ bundle install
```

3. Mount in application

```ruby
mount Proctoring::Engine => '/proctoring'
```

3. Create initializer file `proctoring.rb`

```ruby
Proctoring.setup do |config|
  config.app_name = 'app_name'
  config.hundred_ms_app_access_key = '' #Generate the app accccess key from the 100ms dashboard
  config.hundred_ms_app_secret = '' #Generae the app secret from the 100ms dashboard
  config.hundred_ms_template_id = '' #Generate template id from 100ms dashboard
  config.hundred_ms_s3_bucket = '' #S3 bucket to store the recording fo candidates
  config.hundred_ms_s3_access_key = '' #S3 access key
  config.hundred_ms_s3_access_secret = '' #S3 access secret
  config.hundred_ms_s3_region = '' #S3 region
  config.hundred_ms_auth_secret = '' #32 bit random string
end
```

#### Available API's for Candidate Side:

HTML for showing the candidate video element

```ruby
<div id="videoreplay">
  <video id="vid" autoplay loop ></video>
</div>
<%= render template: 'proctoring/video_streamings/_video_recording100ms.html.erb'%>
<%= content_tag :div, '', id: 'proctoring-user-data', data: { event_id: 'event_code', user: 'user_id', hundred_ms_proctoring_service: true, max_candidate_allowed: '10' } %>
```

Javascript for the application

```Javascript
  const proctoringData = document.getElementById('proctoring-user-data');
  const {
    hundredMsProctoringService, eventId, user, maxCandidateAllowed,
  } = proctoringData.dataset;
  if (proctoringData && hundredMsProctoringService === 'true') {
    const options = {
      userId: user,
      eventId,
      maxPeopleAllowed: maxCandidateAllowed,
      userRole: 'candidates',
    };
    connectToCandidateRoom(options);
  }
```

#### Avaliable API's for the proctor side

HTML for proctor side

```ruby
  <%= render template: 'proctoring/video_player/live_video_proctoring_100ms.html.erb'%>
  <%= content_tag :div, '', id: 'proctoring-user-data', data: { 'user-id': 'user_id', 'event-id': 'event_code', 'max-proctor-allowed': '2' } %>
```

Javascript is written in engine itself for proctor. So need to add javascript on the main application.

---

**Kurento Media Server Example**

#### Set Up Variables

1. Execute the first three steps mentioned in the 100ms Example.

2. Create initializer file `proctoring.rb`

```ruby
Proctoring.setup do |config|
  config.app_name = 'your_name'
  config.media_server_url = 'server-url without protocol and no extra forward slashes'
  config.turn_secret = 'turn_server_secret'
end
```

##### Available API's for Candidate Side:

HTML if want to show video to user ids can be passed to Object.
```ruby
<div
  id="vid-btn"
  title="Monitoring Video"
  data-signaling-server-url = "<%= signaling_server_url %>"
  data-event-id = "<%= event_id %>"
  data-user-id = "<%= user_id %>"
  data-video-proctoring="<%= video_proctoring %>"
></div>

<div id="videoreplay">
  <video id="vid" autoplay loop ></video>
</div>

<%= render template: 'proctoring/video_streamings/_video_recording.html.erb'%>
```

Integrate Javascript into the main application.
```Javascript
const connectToScocket = (url, evnt, app, user) => {
  var socket = io(url);

  socket.on('authorization',function(data){
    socket.emit('authorization', {"event_id": evnt, "app_name": app, "user_id": user});
  });
  socket.on('disconnect', function(){
  });
  return socket;
}

const {
  signalingServerUrl,
  eventId,
  userId
} = document.getElementById('vid-btn').dataset;

const socket = connectToScocket(
  signalingServerUrl,
  eventId,
  'app_name',
  userId,
);

const options = {
  event: eventId,
  user: userId,
  socket: socket,
};

videoRecordingUsingSignalingServer(options);
```

#### Available API's for Proctor Side:

HTML to integrate proctor side screen.

```ruby
<%= render template: 'proctoring/video_player/live_video_proctoring.html.erb'%>
<%= content_tag :div, '', id: 'proctoring-user-data', data: { 'signaling-server-url': 'singaling_server_url', 'event': 'event_id', 'user': 'user_id', 'assigned_user_ids': [] }%>
```

Javascript for proctor side:

```Javascript
const connectToScocketAsAdmin = (url, app) => {
  var socket = io(url);

  socket.on('authorization',function(data){
    socket.emit('admin-authorization', {"app_name": app});
  });
  socket.on('disconnect', function(){
  });
  return socket;
}

document.addEventListener('DOMContentLoaded', () => {
  const userData = document.getElementById('proctoring-user-data');
  const { signalingServerUrl, event, user, assignedUserIds } = userData.dataset;
  const socket = connectToScocketAsAdmin(signalingServerUrl, 'app_name');
  liveVideoUsingSignalingServer({ socket, event, user, assignedUserIds });
});
```

### Documentation

#### Architecture

1. Check the Knights Watch [100ms Architecture](https://docs.google.com/presentation/d/1_CebvXEStUtx8m4Hw9DLQPK6AD8gxBKU/edit?usp=sharing&ouid=100590295233713204603&rtpof=true&sd=true) to get better understanding.


### Prerequisites

Check our prerequisites to get started.

1. [100ms Prerequisites](./docs/100ms/prerequisites.md)

### Installation

Use our installation guidelines to setup the project on your local

1. [100ms Installation Guidelines](./docs/100ms/installation.md)

### Useful Links

- [Development Guidelines](./docs/development.md)
- [Code of Conduct](./docs/code_of_conduct.md)

### New Contributor?

If you are a new contributor, visit our [Contributing Guidelines](./docs/contributing.md) to get started.

## License
The gem is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
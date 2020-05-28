let channelElm = document.getElementById('channel-data');
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.msGetUserMedia || navigator.mediaDevices.getUserMedia;
let connection = new RTCMultiConnection();
connection.socketURL = channelElm.dataset.mediaServerUrl;

connection.session = {
  audio: false,
  video: true
};

connection.sdpConstraints.mandatory = {
  OfferToReceiveAudio: false,
  OfferToReceiveVideo: true
};

connection.extra = {
  userType: 'proctor',
};

connection.onstream = function(event) {
  const video = event.mediaElement;
  if(event && event.userid) {
    if(event.extra && event.extra.userType === 'proctor') {
      return;
    }
    video.id = event.userid;
    const videoContainer = document.getElementById('video-container');
    const userVideoElm = document.getElementById(event.userid);
    if(userVideoElm) {
      userVideoElm.parentNode.removeChild(userVideoElm);
    }
    videoContainer.querySelector(".video-div").prepend(video);
    const statusElm = videoContainer.querySelector('.video-status');
    statusElm.innerHTML = `Status: ${event.status}`;
  }
};
connection.onUserStatusChanged = function (event) {
  const userVideoElm = document.getElementById(event.userid);
  if (userVideoElm && event && event.status) {
    userVideoElm.parentElement.style.backgroundColor =
      event.status === "online" ? "#34A853" : "#EA4335";
    const status = document.getElementById(`video-status-${event.userid}`);
    if (status && event.status) status.innerHTML = `Status: ${event.status}`;
  }
}

connection.onstreamended = function(event) {
  let video = document.getElementById(event.userid);
  if (video && video.parentNode) {
    video.parentNode.removeChild(video);
  }
};


let url = new URL(window.location);
let channel = channelElm.dataset.channel;
if (channel) {
  connection.dontCaptureUserMedia = true;
  navigator.getUserMedia({
      video: true,
      audio: false
  }, function(externalStream) {
      connection.attachStreams = [externalStream];
      connection.openOrJoin(channel);
  }, function(error) {});
}

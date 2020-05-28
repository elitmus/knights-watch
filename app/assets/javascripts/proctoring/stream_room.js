navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.msGetUserMedia || navigator.mediaDevices.getUserMedia;
const channelDiv = document.getElementById("channel-data");
let connection = new RTCMultiConnection();
connection.socketURL = `https://${channelDiv.dataset.mediaServerUrl}/`;
var listOfRecorders = {};

connection.session = {
  audio: false,
  video: true
};

connection.sdpConstraints.mandatory = {
  OfferToReceiveAudio: false,
  OfferToReceiveVideo: true
};

// connection.setUserPreferences = function(userPreferences) {
//   userPreferences.dontAttachLocalStream = true;
//   return userPreferences;
// };

connection.onstream = function(event) {
  if(event && event.userid) {
     if (event.extra && event.extra.userType === "proctor") {
       return;
     }
    const userVideoElm = document.getElementById(event.userid);
    if (userVideoElm) {
      userVideoElm.parentNode.removeChild(userVideoElm);
    }
    const videoContainer = document.getElementById('video-container');
    let div = document.createElement('div');
    div.id = event.userid;
    div.className = 'video-div';
    div.appendChild(event.mediaElement); // appending VIDOE to DIV

    let h2 = document.createElement('h4');
    h2.innerHTML = `UserID: ${event.extra.userId}`;
    div.appendChild(h2);

    let pElm = document.createElement('p');
    pElm.id = `video-status-${event.userid}`;
    pElm.innerHTML = `Status: ${event.status}`;
    div.appendChild(pElm);

    let pElm2 = document.createElement('p');
    pElm2.id = `video-recording-status-${event.userid}`;
    pElm2.innerHTML = `Status: Recording...`;
    div.appendChild(pElm2);

    let button = document.createElement('button');
    button.id = `video-recording-stop-${event.userid}`;
    button.dataset = { userid: event.userid };
    button.style.color = '#000';
    button.innerHTML = `Stop Recording`;
    div.appendChild(button);

    div.style.backgroundColor = '#34A853';
    div.style.textAlign = 'center';
    div.style.color = '#fff';

    videoContainer.appendChild(div);


    /** Recording **/
    let recorder = RecordRTC(event.stream, {
      type: 'video',
      recorderType: MediaStreamRecorder
    });

    recorder.startRecording();

    listOfRecorders[event.userid] = recorder;

    console.log(button);

    button.addEventListener("click", function(){
      let streamid = event.userid;

      if(!listOfRecorders[streamid]) throw 'Wrong stream-id';

      let recorder = listOfRecorders[streamid];
      recorder.stopRecording(function() {
        let blob = recorder.getBlob();
        invokeSaveAsDialog(blob);
        // window.open( URL.createObjectURL(blob) );
        // or upload to server
        // var formData = new FormData();
        // formData.append('file', blob);
        // $.post('/server-address', formData, serverCallback);
      });
    });
  }
};
connection.onUserStatusChanged = function (event) {
  const userVideoElm = document.getElementById(event.userid);
  if(userVideoElm && event && event.status) {
    userVideoElm.style.backgroundColor = event.status === 'online' ? '#34A853' : '#EA4335';
    const status = document.getElementById(`video-status-${event.userid}`);
    if(status && event.status) status.innerHTML = `Status: ${event.status}`;
  }
}

connection.onstreamended = function(event) {
  let video = document.getElementById(event.userid);
  if (video && video.parentNode) {
    video.parentNode.removeChild(video);
  }
};

const connectVideos = () => {
  setTimeout(function() {
    if(channels.length) {
      const channel = channels.shift()
      navigator.getUserMedia({
          video: true,
          audio: false
      }, function(externalStream) {
          connection.attachStreams = [externalStream];
          connection.openOrJoin(channel);
      }, function(error) {});
      connectVideos();
    }
  }, 3000)
}


let channels = [];
channels = JSON.parse(channelDiv.dataset.streamChannels);
connection.dontCaptureUserMedia = true;
connectVideos()
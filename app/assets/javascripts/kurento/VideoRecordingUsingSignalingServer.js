function videoRecordingUsingSignalingServer(props) {
  // variables
  let roomName;
  let userName;
  let appName;
  let participants = {};
  let currentRtcPeer;
  let iceServers = [];

  let socket = props.socket;

  let proctoringData = document.getElementById("proctoring-data");
  appName = proctoringData.dataset.appName;
  roomName = props.event.toString();
  userName = props.user.toString();

  if (roomName && userName) {
    let message = {
      event: "joinRoom",
      roomName,
      userName,
      appName,
      extraInfo: {},
    };

    sendMessage(message);
  }

  function socketListener(message) {
    switch (message.event) {
      case "existingParticipants":
        onExistingParticipants(message.userId, message.existingUsers);
        break;
      case "receiveVideoAnswer":
        onReceiveVideoAnswer(message.senderId, message.sdpAnswer);
        break;
      case "candidate":
        addIceCandidate(message.userId, message.candidate);
        break;
      case "turnServer":
        setTurnServer(message.turnserver);
        break;
    }
  }

  socket.on("signaling-message", socketListener);

  function sendMessage(message) {
    socket.emit("signaling-message", message);
  }

  function setTurnServer(turnServer) {
    iceServers = turnServer;
  }
  
  function stopRecordingAndRestart() {
    let message = {
      event: "stopRecordingAndRestart",
      appName,
    };
    sendMessage(message);
    currentRtcPeer.dispose();
    socket.removeListener("signaling-message", socketListener);
    videoRecordingUsingSignalingServer(props);
  }

  window.onbeforeunload = function () {
    currentRtcPeer.dispose();
    socket.disconnect();
  };

  function receiveVideo(userIdWs, userNameWs) {
    let video = document.createElement("video");
    let div = document.createElement("div");
    div.className = "videoContainer";
    div.id = `participant-video-${userIdWs}-${userNameWs}`;
    let name = document.createElement("div");
    video.id = userIdWs;
    video.autoplay = true;
    name.appendChild(document.createTextNode(userNameWs));
    div.appendChild(video);
    div.appendChild(name);
    // divMeetingRoom.appendChild(div);

    const onOffer = (_err, offer, _wp) => {
      let message = {
        event: "receiveVideoFrom",
        userId: user.id,
        roomName: roomName,
        sdpOffer: offer,
      };
      sendMessage(message);
    };

    // send Icecandidate
    const onIceCandidate = (candidate, wp) => {
      var message = {
        event: "candidate",
        userId: user.id,
        roomName: roomName,
        candidate: candidate,
      };
      sendMessage(message);
    };

    let user = {
      id: userIdWs,
      userName: userNameWs,
      video: video,
      rtcPeer: null,
    };

    participants[user.id] = user;

    let options = {
      remoteVideo: video,
      onicecandidate: onIceCandidate,
    };

    if (iceServers) {
      options.configurations = {
        iceServers: iceServers,
      }
    }

    // This is for receving candidates
    user.rtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(
      options,
      function (err) {
        if (err) {
          return console.error(err);
        }
        this.generateOffer(onOffer);
      }
    );
  }

  function onExistingParticipants(userIdWs, existingUsers) {
    let video = document.createElement("video");
    video.id = userIdWs;
    video.autoplay = true;

    let user = {
      id: userIdWs,
      userName: userName,
      video: video,
      rtcPeer: null,
    };

    participants[user.id] = user;

    let constraints = {
      audio: true,
      video: {
        mandatory: {
          maxWidth: 320,
          maxFrameRate: 15,
          minFrameRate: 5,
        },
      },
    };

    const onOffer = (_err, offer, _wp) => {
      console.log("On Offer");
      let message = {
        event: "receiveVideoFrom",
        userId: user.id,
        roomName: roomName,
        sdpOffer: offer,
      };
      sendMessage(message);
    };

    // send Icecandidate
    const onIceCandidate = (candidate, wp) => {
      var message = {
        event: "candidate",
        userId: user.id,
        roomName: roomName,
        candidate: candidate,
      };
      sendMessage(message);
    };

    let options = {
      localVideo: video,
      mediaConstraints: constraints,
      onicecandidate: onIceCandidate,
    };

    if (iceServers) {
      options.configurations = {
        iceServers: iceServers,
      }
    }

    // This is for sending candidate
    user.rtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(
      options,
      function (err) {
        if (err) {
          return console.error(err);
        }
        this.generateOffer(onOffer);
      }
    );

    currentRtcPeer = user.rtcPeer;

    setTimeout(() => {
      stopRecordingAndRestart();
    }, 5*60*1000);
  }

  function onReceiveVideoAnswer(senderId, sdpAnswer) {
    const user = participants[senderId];
    if (user) user.rtcPeer.processAnswer(sdpAnswer);
  }

  function addIceCandidate(userId, candidate) {
    const user = participants[userId];
    if (user) user.rtcPeer.addIceCandidate(candidate);
  }
};
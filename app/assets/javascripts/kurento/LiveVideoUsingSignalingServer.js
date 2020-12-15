function liveVideoUsingSignalingServer(props) {
  // variables
  let roomName;
  let userName;
  let appName;
  let participants = {};
  let currentRtcPeer;

  let socket = props.socket;
  var divMeetingRoom = document.getElementById(
    props.videoDivId || "proctoringVideos"
  );

  let proctoringData = document.getElementById("proctoring-data");
  appName = proctoringData.dataset.appName;
  roomName = props.event.toString();
  userName = props.user.toString();
  adminUserName = userName + '-admin'
  if (roomName && userName) {
    let message = {
      event: "joinRoom",
      roomName,
      userName: adminUserName,
      appName,
      extraInfo: {},
    };

    sendMessage(message);
  }

  function socketListener(message) {
    console.log("Message arrived", message);

    switch (message.event) {
      case "newParticipantArrived":
        onNewParticipant(message.userId, message.userName, message.roomName);
        break;
      case "existingParticipants":
        onExistingParticipants(message.userId, message.existingUsers);
        break;
      case "receiveVideoAnswer":
        onReceiveVideoAnswer(message.senderId, message.sdpAnswer);
        break;
      case "participantLeft":
        setOffline(message.userName);
        break;
      case "candidate":
        addIceCandidate(message.userId, message.candidate);
        break;
    }
  }

  socket.on("signaling-message", socketListener);

  function sendMessage(message) {
    console.log("sending " + message.event + " message to server");
    socket.emit("signaling-message", message);
  }

  
  function stopRecordingAndRestart() {
    let message = {
      event: "stopRecordingAndRestart",
      appName,
    };
    sendMessage(message);
    currentRtcPeer.dispose();
    socket.removeListener("signaling-message", socketListener);
    liveVideoUsingSignalingServer(props);
  }

  window.onbeforeunload = function () {
    currentRtcPeer.dispose();
    socket.disconnect();
  };

  function setOffline(userid) {
    const container = document.getElementById(`participant-video-${userid}`);
    if(container) {
      container.classList.remove("border-success");
      container.classList.add("border-danger");
      // const callButton = container.querySelector(".connect-candidate");
      // callButton.disabled = true;
    }
  }

  function receiveVideo(userIdWs, userNameWs) {
    const currentUser = props.user;
    // if (userNameWs === currentUser) return;
    if (checkAdminUser(userNameWs)) return;

    const checkContainer = document.getElementById(
      `participant-video-${userNameWs}`
    );
    let video, div;
    if (checkContainer) {
      div = checkContainer; 
      const videoElm = checkContainer.querySelector('video');
      video = videoElm;
    } else {
      const nodeToCopy = document.getElementById("sample-video-div").querySelector('div');
      const newDiv = nodeToCopy.cloneNode(true);
      div = newDiv;
      video = newDiv.querySelector('video');
      let name = newDiv.querySelector(".video-user-id");
      name.innerText = userNameWs;
      div.id = `participant-video-${userNameWs}`;
      video.id = `video-elm-${userNameWs}`;
      video.style.display = 'none';
      divMeetingRoom.appendChild(div);
    }

    if(div) {
      div.classList.remove("border-danger");
      div.classList.add("border-success");
      // const callButton = div.querySelector(".connect-candidate");
      // callButton.disabled = false;
    }

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
      console.log("sending ice candidates");
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

  function onNewParticipant(userIdWs, userNameWs, roomNameWs) {
    if (roomName === roomNameWs) receiveVideo(userIdWs, userNameWs);
  }

  function onExistingParticipants(userIdWs, existingUsers) {
    // let video = document.createElement("video");
    // video.id = userIdWs;
    // video.autoplay = false;

    // let user = {
    //   id: userIdWs,
    //   userName: userName,
    //   video: video,
    //   rtcPeer: null,
    // };

    let user = {
      id: userIdWs,
      userName: userName,
      rtcPeer: null,
    };

    participants[user.id] = user;

    // let constraints = {
    //   audio: true,
    //   video: {
    //     width: { min: 320, ideal: 320, max: 640 },
    //     height: { min: 240, ideal: 240, max: 480 },
    //   },
    // };

    // This is for sending candidate
    user.rtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(
      options,
      function (err) {
        if (err) {
          return console.error(err);
        }
        this.generateOffer(onOffer);
      }
    );

    existingUsers.forEach(function (element) {
      if (roomName === element.roomName) receiveVideo(element.id, element.name);
    });

    currentRtcPeer = user.rtcPeer;

    setTimeout(() => {
      stopRecordingAndRestart();
    }, 5*60*1000);
  }

  function checkAdminUser(userName) {
    return userName.split('-').includes('admin');
  }

  function onReceiveVideoAnswer(senderId, sdpAnswer) {
    participants[senderId].rtcPeer.processAnswer(sdpAnswer);
  }

  function addIceCandidate(userId, candidate) {
    participants[userId].rtcPeer.addIceCandidate(candidate);
  }
};


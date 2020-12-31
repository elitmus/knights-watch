function liveVideoUsingSignalingServer(props) {
  // variables
  let roomName;
  let userName;
  let appName;
  let participants = {};
  let currentRtcPeer;
  const iceCandidateQueue = {};
  const connectedEvent = document.getElementById("connected-event");
  const assignedUsers = document.getElementById("assigned-candidates");
  const connectedUsers = document.getElementById("connected-candidates");
  const connectedAdminUsers = document.getElementById("connected-recruiters");
  const connectedUsersList = document.getElementById("connected-candidates-list");
  const updateTimer = 5 * 1000; // 5 seconds
  const { socket, event, user, assignedUserIds } = props;

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
      case "analytics-data":
        setUpAnalytics(message.roomInfo);
        break;
    }
  }

  socket.on("signaling-message", socketListener);
  getLiveVideoProctoringAnalyticsData({ socket, event });
  setInterval(() => {
    getLiveVideoProctoringAnalyticsData({ socket, event });
  }, updateTimer);

  function sendMessage(message) {
    console.log("sending " + message.event + " message to server");
    socket.emit("signaling-message", message);
  }

  function getLiveVideoProctoringAnalyticsData(props) {
    let roomName = props.event.toString();
    let message = {
      event: "analytics-data",
      roomName,
    };
    sendMessage(message);
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
      video.muted = true;
      // video.style.display = 'none';
      video.autoplay = false;
      divMeetingRoom.appendChild(div);
    }

    if(div) {
      div.classList.remove("border-danger");
      div.classList.add("border-success");
      // const callButton = div.querySelector(".connect-candidate");
      // callButton.disabled = false;
    }

    const onOffer = (_err, offer, _wp) => {
      // console.log("On Offer");
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
      // console.log("sending ice candidates");
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
        if (iceCandidateQueue) {
          while (iceCandidateQueue.length) {
            const ice = iceCandidateQueue.shift();
            user.rtcPeer.addIceCandidate(ice.candidate);
          }
        }
        this.generateOffer(onOffer);
      }
    );
  }

  function onNewParticipant(userIdWs, userNameWs, roomNameWs) {
    if (validCandidate(userNameWs, roomNameWs)) receiveVideo(userIdWs, userNameWs);
  }

  function onExistingParticipants(userIdWs, existingUsers) {
    let video = document.createElement("video");
    video.id = userIdWs;
    video.autoplay = false;

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
        width: { min: 320, ideal: 320, max: 640 },
        height: { min: 240, ideal: 240, max: 480 },
      },
    };

    const onOffer = (_err, offer, _wp) => {
      // console.log("On Offer");
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
      // console.log("sending ice candidates");
      var message = {
        event: "candidate",
        userId: user.id,
        roomName: roomName,
        candidate: candidate,
      };
      sendMessage(message);
    };

    let options = {
      // localVideo: video,
      // mediaConstraints: constraints,
      onicecandidate: onIceCandidate,
    };

    // This is for sending candidate
    user.rtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(
      options,
      function (err) {
        if (err) {
          return console.error(err);
        }
        if (iceCandidateQueue) {
          while (iceCandidateQueue.length) {
            const ice = iceCandidateQueue.shift();
            user.rtcPeer.addIceCandidate(ice.candidate);
          }
        }
        this.generateOffer(onOffer);
      }
    );

    existingUsers.forEach(function (element) {
      if (validCandidate(element.name, element.roomName)) receiveVideo(element.id, element.name);
    });

    currentRtcPeer = user.rtcPeer;

    setTimeout(() => {
      stopRecordingAndRestart();
    }, 5*60*1000);
  }

  function setUpAnalytics(roomInfo) {
    connectedEvent.innerText = event;
    let candidateCount = 0;
    let adminCount = 0;
    let assignedCount = 0;

    if (roomInfo) {
      Object.keys(roomInfo).forEach((key) => {
        if (checkAdminUser(key)) adminCount += 1;
        else candidateCount += 1;

        if (validCandidate(key, roomInfo[key].room)) assignedCount += 1;
      });
    }
    assignedUsers.innerText = `${assignedCount}/${JSON.parse(assignedUserIds).length}`;
    connectedUsers.innerText = candidateCount;
    connectedAdminUsers.innerText = adminCount;
    // List update
    let div = document.createElement("div");
    div.className = "list-group";
    listClass = "list-group-item list-group-item-action rounded-0";
    if (roomInfo) {
      Object.keys(roomInfo).forEach((key) => {
        if (validCandidate(key, roomInfo[key].room)) {
          let link = document.createElement('a');
          const text = document.createTextNode(key);
          link.appendChild(text);
          link.id = `candidate-list-elm-${key}`;
          link.className = listClass;
          div.appendChild(link);
          // link.addEventListener('click', () => {
          //   const videoElm = document.getElementById(`video-elm-${key}`);
          //   if (videoElm.style.display === 'none') videoElm.style.display = 'block';
          //   else videoElm.style.display = 'none';
          // });
        }
      })
    } else {
      let link = document.createElement("a");
      const text = document.createTextNode("No users connected!");
      link.appendChild(text);
      link.className = listClass;
      div.appendChild(link);
    }
    connectedUsersList.innerHTML = "";
    connectedUsersList.appendChild(div);
  }

  function validCandidate(candidateUserId, room) {
    if (checkAdminUser(candidateUserId)) return false;
    if (roomName !== room) return false;
    if (!assignedUserIds.includes(parseInt(candidateUserId))) return false;

    return true;
  }

  function checkAdminUser(userName) {
    return userName.split('-').includes('admin');
  }

  function onReceiveVideoAnswer(senderId, sdpAnswer) {
    participants[senderId].rtcPeer.processAnswer(sdpAnswer);
  }

  function addIceCandidate(userId, candidate) {
    const user = participants[userId]
    if (user) participants[userId].rtcPeer.addIceCandidate(candidate);
    else {
      if (!iceCandidateQueue[userId]) iceCandidateQueue[userId] = [];
      iceCandidateQueue[userId].push({ candidate });
    }
  }
};

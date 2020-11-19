function startLiveVideoProctoring(props) {
  const connectedEvent = document.getElementById("connected-event");
  const connectedUsers = document.getElementById("connected-users");
  const connectedUsersList = document.getElementById("connected-users-list");
  const updateTimer = 1 * 5 * 1000; // 1 minute
  const { socket, event, user } = props;

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

  function socketListener(message) {
    // console.log("Message arrived", message);

    switch (message.event) {
      case "analytics-data":
        setUpAnalytics(message.roomInfo);
        break;
    }
  }

  function setUpAnalytics(roomInfo) {
    connectedEvent.innerText = event;
    let roomKeys;
    if (roomInfo) {
      roomKeys = Object.keys(roomInfo).length;
      if (Object.keys(roomInfo).includes(user)) roomKeys -= 1;
    } else {
      roomKeys = 0;
    }
    connectedUsers.innerText = roomKeys;

    // List update
    let div = document.createElement("div");
    div.className = "list-group";
    listClass = "list-group-item list-group-item-action rounded-0";
    if (roomInfo) {
      Object.keys(roomInfo).forEach((key) => {
        if (key !== user) {
          let link = document.createElement('a');
          const text = document.createTextNode(key);
          link.appendChild(text);
          link.className = listClass;
          div.appendChild(link);
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

  socket.on("signaling-message", socketListener);
  getLiveVideoProctoringAnalyticsData({ socket, event });
  setInterval(() => {
    getLiveVideoProctoringAnalyticsData({ socket, event });
  }, updateTimer);
  liveVideoUsingSignalingServer(props);
}

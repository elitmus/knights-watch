function startLiveVideoProctoring(props) {
  const connectedEvent = document.getElementById("connected-event");
  const connectedUsers = document.getElementById("connected-users");
  const connectedUsersList = document.getElementById("connected-users-list");
  const updateTimer = 1 * 5 * 1000; // 1 minute
  const { socket, event } = props;

  function sendMessage(message) {
    console.log("sending " + message.event + " message to server");
    socket.emit("signaling-message", message);
  }

  function getLiveVideoProctoringAnalyticsData(props) {
    let socket = props.socket;
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
    } else {
      roomKeys = 0;
    }
    connectedUsers.innerText = roomKeys;

    // List update
    if (roomInfo) {
      let div = document.createElement("div");
      div.className = "list-group";
      Object.keys(roomInfo).forEach((key) => {
        let link = document.createElement('a');
        const text = document.createTextNode(key);
        link.appendChild(text);
        link.className = "list-group-item list-group-item-action rounded-0";
        div.appendChild(link);
      })
      connectedUsersList.innerHTML = "";
      connectedUsersList.appendChild(div);
    }

  }

  socket.on("signaling-message", socketListener);
  getLiveVideoProctoringAnalyticsData({ socket, event });
  setInterval(() => {
    getLiveVideoProctoringAnalyticsData({ socket, event });
  }, updateTimer);
}

import { HMSReactiveStore, selectIsConnectedToRoom, selectPeers } from "https://cdn.skypack.dev/@100mslive/hms-video-store";

const connectToCandidateRoom = (props) => {
  const hms = new HMSReactiveStore();
  const hmsStore = hms.getStore();
  const hmsActions = hms.getHMSActions();

  const joinRoom = async (props) => {
    await hmsActions.join(
      {
        userName: props.userId,
        authToken: props.authToken,
        settings: {
          isAudioMuted: false,
          isVideoMuted: false
        },
        metadata: JSON.stringify({
          user_id: props.userId,
        }),
        rememberDeviceSelection: true
      }
    )
  }

  joinRoom(props);

  const leaveRoom = () => {
    hmsActions.leave();
  }

  const renderCandidateStream = (peers) => {
    const video = document.getElementById('vid');
    peers.forEach((peer) => {
      if(peer.isLocal || peer.name === props.userId){
        hmsActions.attachVideo(peer.videoTrack, video)
      }
    })
  }

  const onConnection = (isConnected) => {
    console.log(isConnected);
  }

  window.onunload = leaveRoom;

  hmsStore.subsribe(renderCandidateStream, selectPeers);
  hmsStore.subsribe(onConnection, selectIsConnectedToRoom);
}

window.connectToCandidateRoom = connectToCandidateRoom
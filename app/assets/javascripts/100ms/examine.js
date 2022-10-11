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

  const fetchAuthenticationToken = (props) => {
    const url = '/proctoring/api/v1/authentication';
    const csrfMeta = document.getElementsByName('csrf-token');
    const token = csrfMeta[0] ? csrfMeta[0].content : '';
    const data = {
      user_id: props.userId,
      role: 'candidates',
      event_id: props.eventId,
      max_people_allowed: props.maxPeopleAllowed
    }

    return fetch(url, {
      method: 'POST',
      headers: {
        'X-CSRF-TOKEN': token,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then((response) => response.json())
    .then((result) => result)
    .catch((error) => console.warn(error))
  }

  const joinVideoProctoring = (props) => {
    const authTokenKey = `authToken-${props.eventId}-${props.userId}`;
    let authToken = window.localStorage.getItem(authTokenKey)
    if(authToken){
      joinRoom({ userId: props.userId, authToken: authToken });
    } else {
      fetchAuthenticationToken(props).then((result) => {
        if(result.success){
          window.localStorage.setItem(authTokenKey, result.authentication_token);
          joinRoom({ userId: props.userId, authToken: result.authentication_token });
        } else {
          console.log(result.error)
        }
      })
    }
  }

  joinVideoProctoring(props);

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
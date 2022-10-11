import { HMSReactiveStore, selectPeers, selectIsConnectedToRoom } from "https://cdn.skypack.dev/@100mslive/hms-video-store";

const connectToVideoProctoringRoom = (props) => {
  const hms = new HMSReactiveStore();
  const hmsStore = hms.getStore();
  const hmsActions = hms.getHMSActions();
  
  const joinVideoProctoringRoom = async (props) => {
    await hmsActions.join(
      {
        userName: props.userId,
        authToken: props.authToken,
        settings: {
          isAudioMuted: true,
          isVideoMuted: true
        },
        metadata: JSON.stringify({
          admin_id: props.userId,
        }),
        rememberDeviceSelection: true
      }
    )
  }

  const fetchAuthenticationToken = (props) => {
    const csrfMeta = document.getElementsByName('csrf-token');
    const token = csrfMeta[0] ? csrfMeta[0].content : '';
    const url = '/proctoring/api/v1/authentication'
    const data = {
      user_id: props.userId,
      role: 'proctor',
      event_id: props.eventId
    }

    return fetch(url, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': token,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then((response) => response.json())
    .then((result) => {
      return result;
    })
    .catch(error => console.warn(error));
  } 

  const joinVideoProctoring = (props) => {
    const authTokenKey = `authToken-${props.eventId}-${props.userId}`;
    let authToken = window.localStorage.getItem(authTokenKey)
    if(authToken){
      joinVideoProctoringRoom({ userId: props.userId, authToken: authToken });
    } else {
      fetchAuthenticationToken(props).then((result) => {
        if(result.success){
          window.localStorage.setItem(authTokenKey, result.authentication_token);
          joinVideoProctoringRoom({ userId: props.userId, authToken: result.authentication_token });
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
  
  const htmlElement = (tag, attrs = {}, ...children) => {
    const newElement = document.createElement(tag);
  
    Object.keys(attrs).forEach((key) => {
      newElement.setAttribute(key, attrs[key]);
    })
  
    children.forEach((child) => {
      newElement.append(child);
    })
  
    return newElement
  }
  const renderPeers = (peers) => {
    const divMeetingRoom = document.getElementById("proctoringVideos");
    divMeetingRoom.innerHTML = '';
    peers.forEach((peer) => {
      if(!(peer.isLocal || peer.name === props.userId)){
        const video = htmlElement('video', {
            autoplay: true,
            muted: true,
            playsinline: true
        });
  
        hmsActions.attachVideo(peer.videoTrack, video);
  
        const peerContainer = htmlElement(
          'div', 
          {
            class: 'videoContainer rounded-0 card',
            id: `participant-video-${peer.name}`
          },
          video,
          htmlElement(
            'div',
            {
              class: 'card-body p-2'
            },
            htmlElement(
              'span',
              {
                class: 'text-dark m-0 h6'
              },
              htmlElement(
                'strong',
                {},
                `UserId`
              ),
              htmlElement(
                'strong',
                {
                  class: 'video-user-id'
                },
                peer.name
              ),
            ),
            htmlElement(
              'span',
              {
                class: 'status-online text-success'
              },
              'Online'
            )
          )
        )
  
        divMeetingRoom.append(peerContainer);
      }
    });
  }
  
  const onConnection = (isConnected) => {
    const loader = document.getElementById('loader');
  
    if(isConnected){
      loader.classList.add('d-none')
    } else {
      loader.classList.remove('d-none');
    }
  }
  
  window.onunload = leaveRoom;
  
  hmsStore.subscribe(renderPeers, selectPeers)
  hmsStore.subscribe(onConnection, selectIsConnectedToRoom);
}

window.connectToVideoProctoringRoom = connectToVideoProctoringRoom;


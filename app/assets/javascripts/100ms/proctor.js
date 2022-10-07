import { HMSReactiveStore, selectPeers, selectIsConnectedToRoom } from "https://cdn.skypack.dev/@100mslive/hms-video-store";

const hms = new HMSReactiveStore();
const hmsStore = hms.getStore();
const hmsActions = hms.getHMSActions();
const peers = hmsStore.getState(selectPeers);
const divMeetingRoom = document.getElementById("proctoringVideos");

export const joinVideoProctoringRoom = async (props) => {
  await hmsActions.join(
    {
      userName: props.userId,
      authToken: props.authToken,
      settings: {
        isAudioMuted: true,
        isVideoMuted: true
      },
      metadata: JSON.stringify({
        admin_id: props.admin_id,
        rememberDeviceSelection: true
      })
    }
  )
}

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
  divMeetingRoom.innerHTML = '';
  peers.forEach((peer) => {
    if(!peer.isLocal){
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
          id: `participant-video-${peer.id}`
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
          ),
          htmlElement(
            'span', 
            {
              class: 'status-offline text-danger'
            },
            'Offline'
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
window.joinVideoProctoringRoom = joinVideoProctoringRoom;

hmsStore.subscribe(renderPeers, selectPeers)
hmsStore.subscribe(onConnection, selectIsConnectedToRoom);



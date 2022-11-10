//= require 100ms/join_proctor_room
//= require 100ms/hundred_ms

import { HMSReactiveStore, selectPeerByID, selectAudioTrackVolume } from "https://cdn.skypack.dev/@100mslive/hms-video-store";

const connectToVideoProctoringRoom = (props) => {
  const hms = new HMSReactiveStore();
  const hmsStore = hms.getStore();
  const hmsActions = hms.getHMSActions();

  const htmlElement = (tag, attrs = {}, ...children) => {
    const newElement = document.createElement(tag);
  
    Object.keys(attrs).forEach((key) => {
      newElement.setAttribute(key, attrs[key]);
    })
  
    children.forEach((child) => {
      newElement.append(child);
    })
  
    return newElement;
  }

  const toggleCandidateSound = (candidateId) => {
    const buttonEle = document.getElementById(`sound-btn-${candidateId}`);
    const peer = hmsStore.getState(selectPeerByID(candidateId));

    if(peer && peer.audioTrack) {
      const presentVolume = hmsStore.getState(selectAudioTrackVolume(peer.audioTrack));
      if(presentVolume === 0) {
        buttonEle.innerHTML = 'Stop Sound';
        hmsActions.setVolume(100, peer.audioTrack);
      } else {
        buttonEle.innerHTML = 'Start Sound';
        hmsActions.setVolume(0, peer.audioTrack);
      }
    }
  }

  const renderPeers = (peers) => {
    const divMeetingRoom = document.getElementById("proctoring-videos");
    divMeetingRoom.innerHTML = '';

    const proctorSet = new Set();
    const candidateSet = new Set();

    peers.forEach((peer) => {
      if(peer.roleName === 'candidates'){
        const participantVideoPeer = document.getElementById(`participant-video-${peer.name}`);

        candidateSet.add(peer.name);

        if(participantVideoPeer) {
          participantVideoPeer.remove();
        }

        const video = htmlElement('video', {
            autoplay: true,
            muted: true,
            playsinline: true,
            controls: true,
            id: `video-element-${peer.name}`
        });

        if(peer.videoTrack) {
          hmsActions.attachVideo(peer.videoTrack, video);
        }

        if (peer && peer.audioTrack) {
          hmsActions.setVolume(0, peer.audioTrack); //initial keep all the peer volume to the 0 not auidble.
        }
  
        const peerContainer = htmlElement(
          'div', 
          {
            class: 'video-container rounded-0 card',
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
                class: 'text-dark m-0'
              },
              htmlElement(
                'strong',
                {},
                `CandidateId: `
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
              '(Online)'
            ),
            htmlElement(
              'button',
              {
                class: 'float-right btn btn-sm btn-rounded btn-primary my-0 p-0 px-1 sound-btn',
                onclick: `toggleCandidateSound('${peer.id}')`,
                id: `sound-btn-${peer.id}`
              },
              'Start Sound',
            )
          )
        )
  
        divMeetingRoom.append(peerContainer);
      } else {
        proctorSet.add(peer.name);
      }
    });

    document.getElementById('assigned-candidates').innerHTML = candidateSet.size;
    document.getElementById('connected-recruiters').innerHTML = proctorSet.size;
  }
  
  const onConnection = (isConnected) => {
    const loader = document.getElementById('loader');
    const joinVideoProctoringBtn = document.getElementById('join-proctoring-room-btn');
    const proctoringDataComponent = document.getElementById('proctoring-data-component');

    if(isConnected){
      loader.classList.add('d-none');
      joinVideoProctoringBtn.classList.add('d-none');
      proctoringDataComponent.classList.remove('d-none');
    } else {
      loader.classList.remove('d-none');
    }
  }
  
  window.toggleCandidateSound = toggleCandidateSound;
  connectToRoom(props, renderPeers, onConnection, hmsStore, hmsActions);
}
window.connectToVideoProctoringRoom = connectToVideoProctoringRoom;


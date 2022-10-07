//= require 100ms/hundred_ms

import { HMSReactiveStore } from "https://cdn.skypack.dev/@100mslive/hms-video-store";

const connectToCandidateRoom = (props) => {
  const hms = new HMSReactiveStore();
  const hmsStore = hms.getStore();
  const hmsActions = hms.getHMSActions();

  const renderCandidateStream = (peers) => {
    const video = document.getElementById('vid');
    peers.forEach((peer) => {
      if(peer.isLocal || peer.name === props.userId){
        hmsActions.attachVideo(peer.videoTrack, video);
      }
    })
  }

  const onConnectionCandidate = (isConnected) => {
    console.log(isConnected);
  }

  connectToRoom(props, renderCandidateStream, onConnectionCandidate, hmsStore, hmsActions);
}

window.connectToCandidateRoom = connectToCandidateRoom;
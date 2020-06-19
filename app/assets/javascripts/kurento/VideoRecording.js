class VideoRecording {
  constructor({
    event,
    user,
    inputVideoElmId = false,
    proctoringDataElmId = "proctoring-data",
  }) {
    this.webRtcPeer;
    this.client;
    this.pipeline;
    this.recorder;
    this.mediaServerUrl;
    this.player;
    this.eventName = event;
    this.user = user;
    this.retryCount = 0;
    if (this.inputVideoElmId) {
      this.inputVideoElm = document.getElementById(inputVideoElmId);
      this.showInputVideo = true;
    }
    const proctoringData = document.getElementById(proctoringDataElmId);
    if (proctoringData) {
      this.mediaServerUrl = proctoringData.dataset.mediaServerUrl;
      this.appName = proctoringData.dataset.appName;
    } else {
      this.mediaServerUrl = window.location.host;
      this.appName = window.location.host;
    }
    this.streamConfig = {
      ws_uri: `ws${location.protocol === "http:" ? "" : "s"}://${
        this.mediaServerUrl
      }/kurento`,
      ice_servers: undefined,
    };
    this.onStartOffer = this.onStartOffer.bind(this);
    this.onPlayOffer = this.onPlayOffer.bind(this);
  }

  setIceCandidateCallbacks(webRtcPeer, webRtcEp, onerror) {
    webRtcPeer.on("icecandidate", function (candidate) {
      // console.log("Local candidate:",candidate);

      candidate = kurentoClient.getComplexType("IceCandidate")(candidate);

      webRtcEp.addIceCandidate(candidate, onerror);
    });

    webRtcEp.on("OnIceCandidate", function (event) {
      let candidate = event.candidate;

      // console.log("Remote candidate:",candidate);

      webRtcPeer.addIceCandidate(candidate, onerror);
    });
    webRtcEp.on("ConnectionStateChanged", (event) => {
      if (event.newState === "DISCONNECTED") {
        this.connectionStatus = null;
      } else {
        this.connectionStatus = event.newState;
      }
      this.clearTimeDilation();
    });
  }

  startRecordingSingleSession() {
    const { eventName, user, appName } = this;
    this.streamConfig.file_uri = `file:///recordings/app_data/${appName}/video/${eventName}/${user}/${user}-${+new Date()}.webm`;
    let constraints = {
      audio: true,
      video: {
        width: 640,
        framerate: 15,
      },
    };
    let options = {
      mediaConstraints: constraints,
    };
    if (this.showInputVideo) {
      options.localVideo = this.inputVideoElm;
      this.inputVideoElm.muted = true;
    }

    if (this.streamConfig.ice_servers) {
      console.log("Use ICE servers: " + this.streamConfig.ice_servers);
      options.configuration = {
        iceServers: this.streamConfig.ice_servers,
      };
    } else {
      console.log("Use freeice");
    }
    const self = this;
    self.webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendrecv(
      options,
      function (error) {
        if (error) return self.onError(error);

        this.generateOffer(self.onStartOffer);
      }
    );
  }

  onStartOffer(error, sdpOffer) {
    const self = this;
    if (error) return self.onError(error);

    co(function* () {
      try {
        if (!self.client)
          self.client = yield kurentoClient(self.streamConfig.ws_uri);

        self.pipeline = yield self.client.create("MediaPipeline");

        let webRtc = yield self.pipeline.create("WebRtcEndpoint");
        self.setIceCandidateCallbacks(self.webRtcPeer, webRtc, self.onError);

        self.recorder = yield self.pipeline.create("RecorderEndpoint", {
          uri: self.streamConfig.file_uri,
        });

        yield webRtc.connect(self.recorder);
        yield webRtc.connect(self.webRtc);

        yield self.recorder.record();

        let sdpAnswer = yield webRtc.processOffer(sdpOffer);
        webRtc.gatherCandidates(self.onError);
        self.webRtcPeer.processAnswer(sdpAnswer);

        // setStatus(CALLING);
      } catch (e) {
        self.onError(e);
      }
    })();
  }

  playVideo(elm = "videoOutput") {
    const videoOutput = document.getElementById(elm);
    let options = {
      remoteVideo: videoOutput,
    };

    if (this.streamConfig.ice_servers) {
      console.log("Use ICE servers: " + this.streamConfig.ice_servers);
      options.configuration = {
        iceServers: this.streamConfig.ice_servers,
      };
    } else {
      console.log("Use freeice");
    }
    const self = this;
    self.webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(
      options,
      function (error) {
        if (error) return onError(error);

        this.generateOffer(self.onPlayOffer);
      }
    );
  }

  stopAndPlayVideo(elm = "videoOutput") {
    this.stopRecording();
    this.playVideo(elm);
  }

  onPlayOffer(error, sdpOffer) {
    const self = this;
    if (error) return self.onError(error);

    co(function* () {
      try {
        if (!self.client)
          self.client = yield kurentoClient(self.streamConfig.ws_uri);

        self.pipeline = yield self.client.create("MediaPipeline");

        let webRtc = yield self.pipeline.create("WebRtcEndpoint");
        self.setIceCandidateCallbacks(self.webRtcPeer, webRtc, self.onError);

        self.player = yield self.pipeline.create("PlayerEndpoint", {
          uri: self.streamConfig.file_uri,
        });

        self.player.on("EndOfStream", self.stopRecording);

        yield self.player.connect(webRtc);

        let sdpAnswer = yield webRtc.processOffer(sdpOffer);
        webRtc.gatherCandidates(self.onError);
        self.webRtcPeer.processAnswer(sdpAnswer);

        yield self.player.play();
      } catch (e) {
        self.onError(e);
      }
    })();
  }

  onError(error) {
    if (error) {
      console.error(error);
      this.stopRecording();
      this.retryCount += 1;
      if(this.retryCount < 5) {
        setTimeout(() => {
          if (this.interval) {
            this.startRecordingSingleSessionWithInterval(this.interval);
          }
        }, 1000 * this.retryCount);
      } else {
        throw "Something went wrong with video recording.";
      }
    }
  }

  stopRecording() {
    if (this.recorder) {
      this.recorder.stop();
      this.recorder = null;
    }
    if (this.webRtcPeer) {
      this.webRtcPeer.dispose();
      this.webRtcPeer = null;
    }
    if (this.pipeline) {
      this.pipeline.release();
      this.pipeline = null;
    }
  }

  startRecordingSingleSessionWithInterval(interval = 30000) {
    if (typeof interval !== "number" || interval < 30000) {
      // In ms
      throw "Interval for single session must be more than or equal to 30sec.";
    }
    this.interval = interval;
    this.startRecordingSingleSession();
    const self = this;
    setInterval(() => {
      console.log("retry");
      if (self.recorder || self.pipeline || self.webRtcPeer) {
        self.stopRecording();
      }
      setTimeout(() => {
        self.startRecordingSingleSession();
      }, 300);
    }, interval + 300);
  }

  recordAndPlaySessionWithTimeout(timeout = 10000, videInput, videoOutput) {
    if (typeof timeout !== "number" || timeout < 10000) {
      throw "Timeout for single session must be more than or equal to 10sec.";
    }
    if (videInput) {
      this.inputVideoElm = document.getElementById(videInput);
      this.showInputVideo = true;
    }
    this.startRecordingSingleSession();
    this.setupTimeDilation();
    setTimeout(() => {
      this.stopAndPlayVideoAfterTimeAddition(videoOutput);
    }, timeout); // extra buffer of 300ms
  }

  stopAndPlayVideoAfterTimeAddition(videoOutput) {
    setTimeout(() => this.stopAndPlayVideo(videoOutput), this.timeDilation);
  }

  setupTimeDilation() {
    this.timeDilation = 0;
    this.timeDilationInterval = setInterval(() => {
      this.timeDilation += 1000;
    }, 1000);
  }

  clearTimeDilation() {
    if (this.timeDilationInterval) clearInterval(this.timeDilationInterval);
  }
}

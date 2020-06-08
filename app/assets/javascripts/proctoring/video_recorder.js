class VideoRecorder {
  constructor(eventId, userId) {
    this.eventId = eventId;
    this.userId = userId;
    let videoRecordingInfoElm = document.getElementById('video-recording-info');
    this.appName = videoRecordingInfoElm.dataset.appName;
    this.recordEndpoint = videoRecordingInfoElm.dataset.recordEndpoint;
    this.uploadUrl = videoRecordingInfoElm.dataset.uploadUrl;
    this.proctorResp = {};
    this.listOfRecorders = {};
  }

  connectVideo() {
    const { eventId, userId } = this;
    fetch(
      `/proctoring/video_streamings/user_channel.json?event_id=${eventId}&user_id=${userId}`
    )
      .then((response) => response.json())
      .then((data) => {
        this.proctorResp = data;
        this.startWebrtcAndRecord();
      });
    
  }

  startWebrtcAndRecord() {
    const {
      eventId,
      userId,
      proctorResp,
      appName,
      listOfRecorders,
      recordEndpoint,
      uploadUrl,
    } = this;
    const userConferenceId = `proctoring-video_streaming-${appName}-${eventId}-${userId}`;
    const connection = new RTCMultiConnection();
    window.listOfRecorders = listOfRecorders;

    connection.socketURL = proctorResp.socketURL;
    connection.session = {
      audio: false,
      video: true,
    };

    connection.sdpConstraints.mandatory = {
      OfferToReceiveAudio: false,
      OfferToReceiveVideo: true,
    };

    connection.userid = userConferenceId;

    connection.extra = {
      eventId,
      userId,
    };

    const supports = navigator.mediaDevices.getSupportedConstraints();
    if (supports.width && supports.height) {
      connection.applyConstraints({
        video: {
          width: 320,
          height: 240,
        },
      });
    }

    const resolutions = "VGA";
    let videoConstraints = {};

    if (resolutions === "VGA") {
      videoConstraints = {
        width: { min: 320, ideal: 320 },
        height: { min: 240 },
        frameRate: 15,
        facingMode: "user",
      };
    }

    connection.mediaConstraints = {
      video: videoConstraints,
      audio: true,
    };

    connection.setUserPreferences = (userPreferences) => {
      // eslint-disable-next-line no-param-reassign
      userPreferences.dontGetRemoteStream = true;
      return userPreferences;
    };

    const recordAndUploadVideo = (event) => {
      // eslint-disable-next-line no-undef
      const recorder = RecordRTC(event.stream, {
        type: "video",
        // eslint-disable-next-line no-undef
        // recorderType: MediaStreamRecorder,
        timeSlice: 1000 * 60 * 1,
        canvas: {
          width: 320,
          height: 240,
        },
        frameRate: 5,
        mimeType: "video/x-matroska;codecs=avc1",
        ondataavailable(blob) {
          const fileOfBlob = new File(
            [blob],
            `videorecording-${appName}-${eventId}-${userId}-${+new Date()}.webm`,
            { type: "video/webm" }
          );
          console.log(blob, fileOfBlob);
          invokeSaveAsDialog(blob);
          // const upload = new ActiveStorage.DirectUpload(
          //   fileOfBlob,
          //   uploadUrl,
          //   this
          // );
          // upload.create((error, blob) => {
          //   if (error) {
          //     console.log(error);
          //   } else {
          //     console.log(blob);

          //     const csrfElement = document.getElementsByName("csrf-token")[0];
          //     const csrfToken = csrfElement ? csrfElement.content : "";

          //     const submitData = {
          //       video_streaming: {
          //         videos: [blob.signed_id],
          //         user_id: userId,
          //       },
          //     };

          //     console.log(submitData);

          //     // fetch(`${recordEndpoint}/${proctorResp.id}/upload_video`, {
          //     //   method: "POST",
          //     //   headers: {
          //     //     "Content-Type": "application/json",
          //     //     "X-Requested-With": "XMLHttpRequest",
          //     //     "X-CSRF-TOKEN": csrfToken,
          //     //     Accept: "application/json",
          //     //   },
          //     //   body: JSON.stringify(submitData),
          //     //   credentials: "include",
          //     // })
          //     //   .then((res) => res.json())
          //     //   .then((res) => console.log(res));
          //   }
          // });
        },
      });

      recorder.startRecording();

      listOfRecorders[event.userid] = recorder;
    };

    connection.onstream = (event) => {
      recordAndUploadVideo(event);
    };

    if (proctorResp && proctorResp.channel) {
      console.log(proctorResp);
      connection.openOrJoin(proctorResp.channel, () => {
        setTimeout(() => {
          const localStream = connection.attachStreams[0];
          localStream.mute("audio");
        }, 500);
      });
    }
  }
}
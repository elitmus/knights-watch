class VideoPlayer {
  constructor(elementId='preview-player', playlist) {
    this.player = videojs(elementId, {
      fluid: true,
    });
    const defaultDataEl = document.getElementById('video-player-proctoring');
    if(defaultDataEl && defaultDataEl.dataset.defaultThumbnail) {
      this.thumbnail = defaultDataEl.dataset.defaultThumbnail;
    }
  }

  playPlaylist(playlist) {
    if (this.thumbnail) {
      this.playlist = playlist.map((list) => {
        if (!list.thumbnail) {
          list.thumbnail = [{ src: this.thumbnail }];
        }
        return list;
      });
    } else {
      this.playlist = playlist;
    }
    this.player.playlist(this.playlist);
    // playlist structure
    // [{
    //   name: "Sintel open movie",
    //   description: "Explore the depths of our planet's oceans. ",
    //   duration: 10,
    //   // src: 'http://media.w3.org/2010/05/sintel/trailer.mp4',
    //   sources: [
    //     {
    //       src: "http://media.w3.org/2010/05/sintel/trailer.mp4",
    //       type: "video/mp4",
    //     },
    //   ],
    //   thumbnail: [{ src: "http://media.w3.org/2010/05/sintel/poster.png" }],
    // },
    // {
    //   name: "Sintel open movie",
    //   description: "Explore the depths of our planet's oceans. ",
    //   duration: 10,
    //   // src: 'http://media.w3.org/2010/05/sintel/trailer.mp4',
    //   sources: [
    //     {
    //       src: "http://media.w3.org/2010/05/sintel/trailer.mp4",
    //       type: "video/mp4",
    //     },
    //   ],
    //   thumbnail: [{ src: "http://media.w3.org/2010/05/sintel/poster.png" }],
    // }];
    // populate playlist UI
    this.player.playlistUi();
    // Auto advance one video after another
    this.player.playlist.autoadvance(0);
  }

  pauseVideo() {
    if (this.player) {
      this.player.pause();
    }
  }

}
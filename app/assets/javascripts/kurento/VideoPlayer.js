class VideoPlayer {
  constructor(playlist) {
    this.player = videojs('preview-player', {
      fluid: true
    });
    const defaultDataEl = document.getElementById('video-player-proctoring');
    console.log(defaultDataEl.dataset.defaultThumbnail);
    if(defaultDataEl && defaultDataEl.dataset.defaultThumbnail) {
      this.playlist = playlist.map((list) => {
        console.log(list)
        if(!list.thumbnail) {
          list.thumbnail = [{ src: defaultDataEl.dataset.defaultThumbnail }];
        }
        console.log(list)
        return list;
      })
    }
    console.log(this.playlist);
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
    this.player.playlistUi();
    this.player.playlist.autoadvance(0);
  }

}
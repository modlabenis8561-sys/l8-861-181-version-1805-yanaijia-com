(function () {
  function init(streamUrl) {
    var video = document.querySelector("[data-player-video]");
    var cover = document.querySelector("[data-player-cover]");
    var startButtons = Array.prototype.slice.call(document.querySelectorAll("[data-player-start]"));
    if (!video || !streamUrl) {
      return;
    }

    var streamAttached = false;
    var hlsInstance = null;

    function attachStream() {
      if (streamAttached) {
        return;
      }
      streamAttached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        return;
      }
      video.src = streamUrl;
    }

    function playMovie(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      attachStream();
      if (cover) {
        cover.hidden = true;
      }
      video.controls = true;
      var playTask = video.play();
      if (playTask && typeof playTask.catch === "function") {
        playTask.catch(function () {
          if (cover) {
            cover.hidden = false;
          }
        });
      }
    }

    startButtons.forEach(function (button) {
      button.addEventListener("click", playMovie);
    });
    if (cover) {
      cover.addEventListener("click", playMovie);
    }
    video.addEventListener("click", function () {
      if (!streamAttached) {
        playMovie();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  window.MoviePlayer = { init: init };
})();

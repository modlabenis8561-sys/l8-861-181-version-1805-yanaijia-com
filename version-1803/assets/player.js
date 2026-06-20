(function () {
  function attachSource(video, source) {
    if (!video || video._movieReady) {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video._movieHls = hls;
    } else {
      video.src = source;
    }
    video._movieReady = true;
  }

  function playVideo(video, source, overlay) {
    attachSource(video, source);
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    if (video) {
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }
  }

  window.initMoviePlayer = function (source) {
    var video = document.getElementById("movie-player");
    var overlay = document.querySelector(".player-overlay");
    var shell = document.querySelector(".player-shell");
    if (!video) {
      return;
    }
    if (overlay) {
      overlay.addEventListener("click", function () {
        playVideo(video, source, overlay);
      });
    }
    if (shell) {
      shell.addEventListener("click", function (event) {
        if (event.target === video && video._movieReady) {
          return;
        }
        playVideo(video, source, overlay);
      });
    }
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
  };
})();

(function () {
    var video = document.querySelector('.movie-player-video');
    var cover = document.querySelector('.player-cover');
    var button = document.querySelector('.player-start');
    var source = typeof movieSource === 'string' ? movieSource : '';
    var loaded = false;
    var hlsInstance = null;

    function attachSource() {
        if (!video || !source || loaded) {
            return;
        }

        loaded = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls();
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
        } else {
            video.src = source;
        }
    }

    function startPlayback() {
        if (!video) {
            return;
        }

        attachSource();

        if (cover) {
            cover.classList.add('is-hidden');
        }

        var playTask = video.play();
        if (playTask && typeof playTask.catch === 'function') {
            playTask.catch(function () {});
        }
    }

    if (button) {
        button.addEventListener('click', startPlayback);
    }

    if (cover) {
        cover.addEventListener('click', startPlayback);
    }

    if (video) {
        video.addEventListener('click', function () {
            if (video.paused) {
                startPlayback();
            }
        });
    }

    window.addEventListener('pagehide', function () {
        if (hlsInstance && typeof hlsInstance.destroy === 'function') {
            hlsInstance.destroy();
        }
    });
})();

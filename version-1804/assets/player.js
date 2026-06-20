(function () {
    function setupStaticPlayer(source) {
        var video = document.querySelector('[data-video]');
        var overlay = document.querySelector('[data-play-overlay]');
        var playButton = document.querySelector('[data-play-button]');
        var hls = null;

        if (!video || !source) {
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else {
            video.src = source;
        }

        function play() {
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        function hideOverlay() {
            if (overlay) {
                overlay.classList.add('hidden');
            }
        }

        function showOverlay() {
            if (overlay) {
                overlay.classList.remove('hidden');
            }
        }

        function startPlayback() {
            hideOverlay();
            play();
        }

        if (overlay) {
            overlay.addEventListener('click', startPlayback);
        }

        if (playButton) {
            playButton.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                startPlayback();
            });
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                startPlayback();
            } else {
                video.pause();
            }
        });

        video.addEventListener('play', hideOverlay);
        video.addEventListener('pause', showOverlay);
        video.addEventListener('ended', showOverlay);
        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    window.setupStaticPlayer = setupStaticPlayer;
})();

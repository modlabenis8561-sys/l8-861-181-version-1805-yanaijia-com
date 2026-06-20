(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-nav]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    function normalize(value) {
        return String(value || "").toLowerCase().replace(/\s+/g, "");
    }

    function applySearch(root, value) {
        var cards = Array.prototype.slice.call(root.querySelectorAll("[data-movie-card]"));
        var empty = root.querySelector("[data-empty-state]") || document.querySelector("[data-empty-state]");
        var keyword = normalize(value);
        var visible = 0;
        cards.forEach(function (card) {
            var text = normalize(card.getAttribute("data-keywords") || card.textContent);
            var matched = !keyword || text.indexOf(keyword) !== -1;
            card.style.display = matched ? "" : "none";
            if (matched) {
                visible += 1;
            }
        });
        if (empty) {
            empty.classList.toggle("is-visible", visible === 0);
        }
    }

    function initSearch() {
        var blocks = Array.prototype.slice.call(document.querySelectorAll("[data-local-search]"));
        blocks.forEach(function (block) {
            var input = block.querySelector("[data-search-input]");
            var clear = block.querySelector("[data-clear-search]");
            var scope = document;
            if (!input) {
                return;
            }
            input.addEventListener("input", function () {
                applySearch(scope, input.value);
            });
            if (clear) {
                clear.addEventListener("click", function () {
                    input.value = "";
                    applySearch(scope, "");
                    input.focus();
                });
            }
        });
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q");
        var globalInput = document.getElementById("global-search-input");
        if (initial && globalInput) {
            globalInput.value = initial;
            applySearch(document, initial);
        }
        Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]")).forEach(function (button) {
            button.addEventListener("click", function () {
                var value = button.getAttribute("data-filter-value") || "";
                var input = document.querySelector("[data-search-input]");
                if (input) {
                    input.value = value;
                    applySearch(document, value);
                }
            });
        });
    }

    function mountPlayer(videoId, coverId, streamUrl) {
        var video = document.getElementById(videoId);
        var cover = document.getElementById(coverId);
        if (!video || !streamUrl) {
            return;
        }
        var hls = null;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                } else {
                    hls.destroy();
                    video.src = streamUrl;
                }
            });
        } else {
            video.src = streamUrl;
        }
        function start() {
            if (cover) {
                cover.classList.add("is-hidden");
            }
            var action = video.play();
            if (action && typeof action.catch === "function") {
                action.catch(function () {});
            }
        }
        if (cover) {
            cover.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener("play", function () {
            if (cover) {
                cover.classList.add("is-hidden");
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    window.MovieSitePlayer = {
        mount: mountPlayer
    };

    ready(function () {
        initMenu();
        initHero();
        initSearch();
    });
})();

(function () {
    function text(value) {
        return (value || "").toString().toLowerCase().trim();
    }

    function initNav() {
        var toggle = document.querySelector(".js-nav-toggle");
        var links = document.querySelector(".js-nav-links");
        if (!toggle || !links) {
            return;
        }
        toggle.addEventListener("click", function () {
            links.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector(".hero-section");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
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
            }
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initFilters() {
        var areas = Array.prototype.slice.call(document.querySelectorAll("[data-filter-area]"));
        areas.forEach(function (area) {
            var input = area.querySelector(".js-search-input");
            var yearSelect = area.querySelector(".js-year-filter");
            var regionSelect = area.querySelector(".js-region-filter");
            var chips = Array.prototype.slice.call(area.querySelectorAll(".filter-chip"));
            var cards = Array.prototype.slice.call(area.querySelectorAll(".filter-card"));
            var empty = area.querySelector(".no-result");
            var activeCategory = "all";
            function apply() {
                var query = text(input ? input.value : "");
                var year = yearSelect ? yearSelect.value : "all";
                var region = regionSelect ? regionSelect.value : "all";
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = text([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-tags")
                    ].join(" "));
                    var okQuery = !query || haystack.indexOf(query) !== -1;
                    var okYear = year === "all" || card.getAttribute("data-year") === year;
                    var okRegion = region === "all" || card.getAttribute("data-region") === region;
                    var okCategory = activeCategory === "all" || card.getAttribute("data-category") === activeCategory;
                    var ok = okQuery && okYear && okRegion && okCategory;
                    card.style.display = ok ? "" : "none";
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }
            if (input) {
                input.addEventListener("input", apply);
            }
            if (yearSelect) {
                yearSelect.addEventListener("change", apply);
            }
            if (regionSelect) {
                regionSelect.addEventListener("change", apply);
            }
            chips.forEach(function (chip) {
                chip.addEventListener("click", function () {
                    activeCategory = chip.getAttribute("data-value") || "all";
                    chips.forEach(function (item) {
                        item.classList.toggle("is-active", item === chip);
                    });
                    apply();
                });
            });
            apply();
        });
    }

    function setupVideoPlayer(src) {
        var video = document.getElementById("movieVideo");
        var cover = document.querySelector(".video-cover");
        var stage = document.querySelector(".video-stage");
        if (!video || !src) {
            return;
        }
        var loaded = false;
        var hls;
        function load() {
            if (loaded) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(src);
                hls.attachMedia(video);
            } else {
                video.src = src;
            }
            loaded = true;
        }
        function play() {
            load();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        }
        if (cover) {
            cover.addEventListener("click", play);
        }
        if (stage) {
            stage.addEventListener("click", function (event) {
                if (event.target === stage) {
                    play();
                }
            });
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("play", function () {
            if (cover) {
                cover.classList.add("is-hidden");
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initNav();
        initHero();
        initFilters();
    });

    window.setupVideoPlayer = setupVideoPlayer;
})();

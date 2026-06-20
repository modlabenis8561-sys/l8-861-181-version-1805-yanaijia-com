(function () {
    const menuButton = document.querySelector(".menu-toggle");
    const mobileMenu = document.querySelector(".mobile-menu");

    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", function () {
            const open = mobileMenu.classList.toggle("is-open");
            menuButton.setAttribute("aria-expanded", String(open));
        });
    }

    const carousel = document.querySelector("[data-carousel]");

    if (carousel) {
        const slides = Array.from(carousel.querySelectorAll(".hero-slide"));
        const dots = Array.from(carousel.querySelectorAll(".hero-dot"));
        let activeIndex = 0;

        function setSlide(index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === activeIndex);
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                setSlide(dotIndex);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                setSlide(activeIndex + 1);
            }, 5200);
        }
    }

    const params = new URL搜索筛选Params(window.location.search);
    const initialQuery = params.get("q") || "";
    const searchInput = document.getElementById("movie搜索筛选");
    const categoryFilter = document.getElementById("categoryFilter");
    const yearFilter = document.getElementById("yearFilter");
    const searchableList = document.querySelector(".searchable-list");

    if (searchInput && initialQuery) {
        searchInput.value = initialQuery;
    }

    function yearMatches(value, selected) {
        if (!selected || selected === "全部年份") {
            return true;
        }
        const year = Number(value);
        if (selected === "2010-2019") {
            return year >= 2010 && year <= 2019;
        }
        if (selected === "2000-2009") {
            return year >= 2000 && year <= 2009;
        }
        if (selected === "更早") {
            return year < 2000;
        }
        return String(value) === selected;
    }

    function applyFilters() {
        if (!searchableList) {
            return;
        }
        const query = (searchInput ? searchInput.value : "").trim().toLowerCase();
        const category = categoryFilter ? categoryFilter.value : "全部分类";
        const year = yearFilter ? yearFilter.value : "全部年份";
        const cards = Array.from(searchableList.querySelectorAll(".movie-card"));

        cards.forEach(function (card) {
            const text = [
                card.dataset.title,
                card.dataset.category,
                card.dataset.genre,
                card.dataset.region,
                card.dataset.type,
                card.dataset.year
            ].join(" ").toLowerCase();
            const categoryOk = category === "全部分类" || card.dataset.category === category;
            const yearOk = yearMatches(card.dataset.year, year);
            const queryOk = !query || text.includes(query);
            card.hidden = !(categoryOk && yearOk && queryOk);
        });
    }

    [searchInput, categoryFilter, yearFilter].forEach(function (item) {
        if (item) {
            item.addEventListener("input", applyFilters);
            item.addEventListener("change", applyFilters);
        }
    });

    applyFilters();
})();

function initStreamPlayer(videoId, buttonId, overlayId, streamUrl) {
    const video = document.getElementById(videoId);
    const button = document.getElementById(buttonId);
    const overlay = document.getElementById(overlayId);
    let ready = false;
    let hls = null;

    function loadAndPlay() {
        if (!video || !streamUrl) {
            return;
        }

        if (!ready) {
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
            ready = true;
        }

        if (overlay) {
            overlay.classList.add("is-hidden");
        }

        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
                if (overlay) {
                    overlay.classList.remove("is-hidden");
                }
            });
        }
    }

    if (button) {
        button.addEventListener("click", loadAndPlay);
    }

    if (video) {
        video.addEventListener("click", function () {
            if (!ready || video.paused) {
                loadAndPlay();
            }
        });
    }

    window.addEventListener("beforeunload", function () {
        if (hls) {
            hls.destroy();
        }
    });
}

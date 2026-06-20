(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input) {
                return;
            }
            var value = input.value.trim();
            if (!value) {
                event.preventDefault();
                window.location.href = './search.html';
            }
        });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function activateSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === current);
        });
    }

    function startHero() {
        if (timer || slides.length < 2) {
            return;
        }
        timer = window.setInterval(function () {
            activateSlide(current + 1);
        }, 5200);
    }

    if (slides.length) {
        activateSlide(0);
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                activateSlide(index);
                window.clearInterval(timer);
                timer = null;
                startHero();
            });
        });
        document.querySelectorAll('[data-hero-prev]').forEach(function (button) {
            button.addEventListener('click', function () {
                activateSlide(current - 1);
            });
        });
        document.querySelectorAll('[data-hero-next]').forEach(function (button) {
            button.addEventListener('click', function () {
                activateSlide(current + 1);
            });
        });
        startHero();
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var empty = document.querySelector('[data-no-result]');

    function applyFilter(value) {
        var keyword = (value || '').trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
            var text = card.getAttribute('data-search') || '';
            var matched = !keyword || text.indexOf(keyword) !== -1;
            card.style.display = matched ? '' : 'none';
            if (matched) {
                visible += 1;
            }
        });
        if (empty) {
            empty.classList.toggle('show', visible === 0);
        }
    }

    if (filterInput) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        if (query) {
            filterInput.value = query;
        }
        applyFilter(filterInput.value);
        filterInput.addEventListener('input', function () {
            applyFilter(filterInput.value);
        });
    }
})();

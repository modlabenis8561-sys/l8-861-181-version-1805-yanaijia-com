(function () {
    var mobileButton = document.querySelector('[data-mobile-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (mobileButton && mobileNav) {
        mobileButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(next) {
        if (!slides.length) {
            return;
        }
        current = (next + slides.length) % slides.length;
        slides.forEach(function (slide, index) {
            slide.classList.toggle('is-active', index === current);
        });
        dots.forEach(function (dot, index) {
            dot.classList.toggle('is-active', index === current);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(current + 1);
        }, 6200);
    }

    var filterInputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));
    var filterSelects = Array.prototype.slice.call(document.querySelectorAll('[data-filter-select]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var emptyState = document.querySelector('[data-empty-state]');

    function getValue(name) {
        var field = document.querySelector('[data-filter-select="' + name + '"]');
        return field ? field.value.trim().toLowerCase() : '';
    }

    function runFilter() {
        if (!cards.length) {
            return;
        }
        var keywordField = document.querySelector('[data-filter-input]');
        var keyword = keywordField ? keywordField.value.trim().toLowerCase() : '';
        var genre = getValue('genre');
        var region = getValue('region');
        var type = getValue('type');
        var visible = 0;

        cards.forEach(function (card) {
            var text = card.textContent.toLowerCase();
            var cardGenre = (card.getAttribute('data-genre') || '').toLowerCase();
            var cardRegion = (card.getAttribute('data-region') || '').toLowerCase();
            var cardType = (card.getAttribute('data-type') || '').toLowerCase();
            var ok = true;

            if (keyword && text.indexOf(keyword) === -1) {
                ok = false;
            }
            if (genre && cardGenre.indexOf(genre) === -1) {
                ok = false;
            }
            if (region && cardRegion.indexOf(region) === -1) {
                ok = false;
            }
            if (type && cardType.indexOf(type) === -1) {
                ok = false;
            }

            card.style.display = ok ? '' : 'none';
            if (ok) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('is-visible', visible === 0);
        }
    }

    filterInputs.forEach(function (input) {
        input.addEventListener('input', runFilter);
    });
    filterSelects.forEach(function (select) {
        select.addEventListener('change', runFilter);
    });
})();

(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
      menuButton.addEventListener('click', function () {
        var expanded = menuButton.getAttribute('aria-expanded') === 'true';
        menuButton.setAttribute('aria-expanded', String(!expanded));
        mobileNav.classList.toggle('open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var heroPanelImage = document.querySelector('[data-hero-panel-image]');
    var heroPanelTitle = document.querySelector('[data-hero-panel-title]');
    var heroPanelText = document.querySelector('[data-hero-panel-text]');
    var heroPanelLink = document.querySelector('[data-hero-panel-link]');
    var currentSlide = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      currentSlide = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === currentSlide);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === currentSlide);
      });

      var active = slides[currentSlide];
      if (active) {
        if (heroPanelImage) {
          heroPanelImage.src = active.getAttribute('data-image') || heroPanelImage.src;
          heroPanelImage.alt = active.getAttribute('data-title') || heroPanelImage.alt;
        }
        if (heroPanelTitle) {
          heroPanelTitle.textContent = active.getAttribute('data-title') || heroPanelTitle.textContent;
        }
        if (heroPanelText) {
          heroPanelText.textContent = active.getAttribute('data-text') || heroPanelText.textContent;
        }
        if (heroPanelLink) {
          heroPanelLink.href = active.getAttribute('data-link') || heroPanelLink.href;
        }
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      showSlide(0);
      window.setInterval(function () {
        showSlide(currentSlide + 1);
      }, 5200);
    }

    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
    var searchInput = document.querySelector('.site-search-input');
    var filters = Array.prototype.slice.call(document.querySelectorAll('.filter-select'));
    var resultCount = document.querySelector('[data-result-count]');

    function cardMatches(card, query) {
      var haystack = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
      return haystack.indexOf(query) !== -1;
    }

    function applyFilters() {
      if (!cards.length) {
        return;
      }

      var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var visible = 0;

      cards.forEach(function (card) {
        var ok = cardMatches(card, query);

        filters.forEach(function (select) {
          var value = select.value.trim();
          if (!value) {
            return;
          }
          var haystack = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
          if (haystack.indexOf(value.toLowerCase()) === -1) {
            ok = false;
          }
        });

        card.classList.toggle('hidden-card', !ok);
        if (ok) {
          visible += 1;
        }
      });

      if (resultCount) {
        resultCount.textContent = '共 ' + visible + ' 部';
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
    }

    filters.forEach(function (select) {
      select.addEventListener('change', applyFilters);
    });

    if (cards.length && resultCount) {
      applyFilters();
    }

    Array.prototype.slice.call(document.querySelectorAll('.video-player[data-src]')).forEach(function (video) {
      var shell = video.closest('.video-shell');
      var button = shell ? shell.querySelector('.play-layer') : null;
      var initialized = false;
      var hlsInstance = null;

      function loadVideo() {
        if (initialized) {
          return;
        }

        var source = video.getAttribute('data-src');
        if (!source) {
          return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }

        initialized = true;
      }

      function startVideo() {
        loadVideo();
        video.controls = true;
        if (button) {
          button.classList.add('hidden');
        }
        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {
            video.controls = true;
          });
        }
      }

      if (button) {
        button.addEventListener('click', startVideo);
      }

      video.addEventListener('click', function () {
        if (video.paused) {
          startVideo();
        }
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  });
}());

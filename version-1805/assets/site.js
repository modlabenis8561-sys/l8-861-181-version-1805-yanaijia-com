(function () {
  var menuButton = document.querySelector('.mobile-menu-button');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobileNav.hasAttribute('hidden');
      if (isOpen) {
        mobileNav.removeAttribute('hidden');
      } else {
        mobileNav.setAttribute('hidden', '');
      }
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  var hero = document.querySelector('[data-hero-carousel]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var previousButton = hero.querySelector('.hero-prev');
    var nextButton = hero.querySelector('.hero-next');
    var currentIndex = 0;
    var timer = null;

    function showSlide(index) {
      currentIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === currentIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === currentIndex);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(currentIndex + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startTimer();
      });
    });

    if (previousButton) {
      previousButton.addEventListener('click', function () {
        showSlide(currentIndex - 1);
        startTimer();
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', function () {
        showSlide(currentIndex + 1);
        startTimer();
      });
    }

    hero.addEventListener('mouseenter', stopTimer);
    hero.addEventListener('mouseleave', startTimer);
    startTimer();
  }

  var filterPanel = document.querySelector('[data-filter-panel]');

  if (filterPanel) {
    var keywordInput = filterPanel.querySelector('[data-filter-keyword]');
    var yearSelect = filterPanel.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-list] .movie-card'));
    var emptyState = document.querySelector('[data-empty-state]');

    function applyFilters() {
      var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = [card.dataset.title, card.dataset.region, card.dataset.genre].join(' ').toLowerCase();
        var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchesYear = !year || card.dataset.year === year;
        var show = matchesKeyword && matchesYear;
        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    }

    if (keywordInput) {
      keywordInput.addEventListener('input', applyFilters);
    }

    if (yearSelect) {
      yearSelect.addEventListener('change', applyFilters);
    }
  }

  var searchForm = document.querySelector('[data-search-page-form]');
  var searchInput = document.querySelector('[data-search-page-input]');
  var resultsBlock = document.querySelector('[data-search-results-block]');
  var resultsGrid = document.querySelector('[data-search-results]');
  var defaultBlock = document.querySelector('[data-search-default]');
  var searchTitle = document.querySelector('[data-search-title]');

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderMovieCard(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '<a class="poster-link" href="./' + escapeHtml(movie.file) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="poster-gradient"></span>',
      '<span class="year-badge">' + escapeHtml(movie.year) + '</span>',
      '<span class="play-badge">播放</span>',
      '</a>',
      '<div class="movie-card-body">',
      '<div class="movie-meta-row"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
      '<h3><a href="./' + escapeHtml(movie.file) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="tag-row">' + tags + '</div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function runSearch(query) {
    if (!resultsBlock || !resultsGrid || !window.MOVIE_INDEX) {
      return;
    }

    var normalized = query.trim().toLowerCase();
    if (!normalized) {
      resultsBlock.hidden = true;
      if (defaultBlock) {
        defaultBlock.hidden = false;
      }
      return;
    }

    var matches = window.MOVIE_INDEX.filter(function (movie) {
      return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags.join(' '), movie.oneLine].join(' ').toLowerCase().indexOf(normalized) !== -1;
    }).slice(0, 120);

    resultsBlock.hidden = false;
    if (defaultBlock) {
      defaultBlock.hidden = true;
    }
    if (searchTitle) {
      searchTitle.textContent = '“' + query + '”相关影片';
    }
    if (matches.length) {
      resultsGrid.innerHTML = matches.map(renderMovieCard).join('');
    } else {
      resultsGrid.innerHTML = '<p class="empty-state">没有找到匹配影片。</p>';
    }
  }

  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    searchInput.value = initialQuery;
    runSearch(initialQuery);
  }

  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = searchInput.value.trim();
      var url = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
      window.history.replaceState(null, '', url);
      runSearch(query);
    });
  }
}());

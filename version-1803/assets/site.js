(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function escapeHtml(value) {
    return (value || "").toString().replace(/[&<>"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  function cardTemplate(movie) {
    return "<article class=\"poster-card movie-card\">" +
      "<a class=\"poster-link\" href=\"" + escapeHtml(movie.url) + "\">" +
      "<span class=\"poster-img\"><img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\"></span>" +
      "<span class=\"poster-shade\"></span>" +
      "<span class=\"poster-info\">" +
      "<span class=\"badge\">" + escapeHtml(movie.region) + " · " + escapeHtml(movie.type) + "</span>" +
      "<strong>" + escapeHtml(movie.title) + "</strong>" +
      "<em>" + escapeHtml(movie.oneLine) + "</em>" +
      "<span class=\"card-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.genre) + "</span></span>" +
      "</span></a></article>";
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
      });
    }

    var slider = document.querySelector("[data-hero-slider]");
    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
      var index = 0;
      var show = function (next) {
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      };
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
        });
      });
      if (slides.length > 1) {
        window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }
    }

    var pageFilter = document.querySelector("[data-page-filter]");
    if (pageFilter) {
      var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-search]"));
      pageFilter.addEventListener("input", function () {
        var query = normalize(pageFilter.value);
        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute("data-search"));
          card.classList.toggle("is-hidden", query && haystack.indexOf(query) === -1);
        });
      });
    }

    var searchInput = document.getElementById("search-input");
    var searchResults = document.getElementById("search-results");
    if (searchInput && searchResults && window.SEARCH_MOVIES) {
      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q") || "";
      searchInput.value = initial;
      var render = function () {
        var query = normalize(searchInput.value);
        var words = query.split(/\s+/).filter(Boolean);
        var results = window.SEARCH_MOVIES.filter(function (movie) {
          if (!words.length) {
            return true;
          }
          var haystack = normalize([
            movie.title,
            movie.region,
            movie.type,
            movie.year,
            movie.genre,
            movie.tags,
            movie.oneLine
          ].join(" "));
          return words.every(function (word) {
            return haystack.indexOf(word) !== -1;
          });
        }).slice(0, 120);
        searchResults.innerHTML = results.map(cardTemplate).join("");
      };
      searchInput.addEventListener("input", render);
      render();
    }
  });
})();

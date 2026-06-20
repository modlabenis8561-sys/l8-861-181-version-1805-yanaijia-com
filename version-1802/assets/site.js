(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");
    if (menuButton && mobileMenu) {
      menuButton.addEventListener("click", function () {
        mobileMenu.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (slides.length > 1) {
      var activeIndex = 0;
      var showSlide = function (index) {
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === activeIndex);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === activeIndex);
        });
      };
      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          showSlide(dotIndex);
        });
      });
      window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5600);
    }

    var filterPanels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    filterPanels.forEach(function (panel) {
      var scopeSelector = panel.getAttribute("data-filter-panel");
      var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
      if (!scope) {
        return;
      }
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
      var searchInput = panel.querySelector("[data-filter-search]");
      var regionSelect = panel.querySelector("[data-filter-region]");
      var yearSelect = panel.querySelector("[data-filter-year]");
      var typeSelect = panel.querySelector("[data-filter-type]");
      var emptyState = scope.querySelector("[data-empty-state]");
      var applyFilters = function () {
        var keyword = normalize(searchInput && searchInput.value);
        var region = normalize(regionSelect && regionSelect.value);
        var year = normalize(yearSelect && yearSelect.value);
        var type = normalize(typeSelect && typeSelect.value);
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" "));
          var matched = true;
          if (keyword && haystack.indexOf(keyword) === -1) {
            matched = false;
          }
          if (region && normalize(card.getAttribute("data-region")).indexOf(region) === -1) {
            matched = false;
          }
          if (year && normalize(card.getAttribute("data-year")) !== year) {
            matched = false;
          }
          if (type && normalize(card.getAttribute("data-type")).indexOf(type) === -1) {
            matched = false;
          }
          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });
        if (emptyState) {
          emptyState.style.display = visible ? "none" : "block";
        }
      };
      [searchInput, regionSelect, yearSelect, typeSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilters);
          control.addEventListener("change", applyFilters);
        }
      });
      applyFilters();
    });

    var heroSearch = document.querySelector("[data-hero-search]");
    if (heroSearch) {
      heroSearch.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = heroSearch.querySelector("input");
        var query = input ? input.value.trim() : "";
        var target = heroSearch.getAttribute("action") || "search.html";
        window.location.href = query ? target + "?q=" + encodeURIComponent(query) : target;
      });
    }

    var searchPageInput = document.querySelector("[data-search-page-input]");
    if (searchPageInput) {
      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q");
      if (initial) {
        searchPageInput.value = initial;
        searchPageInput.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }
  });
})();

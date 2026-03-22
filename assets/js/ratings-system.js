'use strict';

/**
 * ratings-system.js — Standalone Rating Module
 *
 * Handles fetching, submitting, and rendering course ratings.
 * Communicates with the Cloudflare Worker proxy at /api/ratings.
 * Uses in-memory cache (Map) with 5-minute TTL.
 * Supports half-star display and interactive star input with keyboard navigation.
 *
 * IP detection is handled server-side by the Worker (CF-Connecting-IP).
 *
 * Dependencies: Utils (window.Utils)
 * Exports: window.RatingSystem (frozen) or null if Utils is missing
 */

var RatingSystem = (function () {

  var U = window.Utils;
  if (!U) {
    console.error('RatingSystem: Utils not found.');
    return null;
  }

  /* ── Configuration ── */

  var CONFIG = Object.freeze({
    API_ENDPOINT: '/api/ratings',
    CACHE_TTL:    5 * 60 * 1000,
    MAX_RETRIES:  3,
    TIMEOUT:      8000,
    RETRY_DELAYS: [1000, 2000, 4000],
    MAX_RATING:   5,
    MIN_RATING:   1
  });

  /* ── Cache ── */

  var _cache = new Map();

  function _getCached(courseId) {
    var key = 'ratings_' + courseId;
    if (!_cache.has(key)) return null;
    var entry = _cache.get(key);
    if (Date.now() - entry.timestamp > CONFIG.CACHE_TTL) {
      _cache.delete(key);
      return null;
    }
    return entry.data;
  }

  function _setCache(courseId, data) {
    _cache.set('ratings_' + courseId, {
      data: data,
      timestamp: Date.now()
    });
  }

  function _clearCache(courseId) {
    _cache.delete('ratings_' + courseId);
  }

  /* ── Fetch with Retry & Timeout ── */

  function _fetchWithRetry(url, options, attempt, maxRetries) {
    attempt = attempt || 0;
    maxRetries = (maxRetries !== undefined) ? maxRetries : CONFIG.MAX_RETRIES;

    return new Promise(function (resolve, reject) {
      var controller = new AbortController();
      var timeoutId = setTimeout(function () {
        controller.abort();
      }, CONFIG.TIMEOUT);

      var fetchOptions = Object.assign({}, options || {}, {
        signal: controller.signal
      });

      fetch(url, fetchOptions)
        .then(function (response) {
          clearTimeout(timeoutId);
          if (!response.ok) {
            throw new Error('HTTP ' + response.status);
          }
          return response.json();
        })
        .then(resolve)
        .catch(function (err) {
          clearTimeout(timeoutId);
          if (attempt < maxRetries - 1) {
            var delay = CONFIG.RETRY_DELAYS[attempt] || 4000;
            setTimeout(function () {
              _fetchWithRetry(url, options, attempt + 1, maxRetries).then(resolve).catch(reject);
            }, delay);
          } else {
            reject(err);
          }
        });
    });
  }

  /* ── API Methods ── */

  function fetchRatings(courseId) {
    var cached = _getCached(courseId);
    if (cached) return Promise.resolve(cached);

    var url = CONFIG.API_ENDPOINT + '?courseId=' + encodeURIComponent(courseId);

    return _fetchWithRetry(url, { method: 'GET' })
      .then(function (data) {
        var result = {
          average: parseFloat(data.average) || 0,
          count: parseInt(data.count, 10) || 0
        };
        _setCache(courseId, result);
        return result;
      })
      .catch(function (err) {
        console.warn('RatingSystem: Failed to fetch ratings for course ' + courseId, err);
        return { average: 0, count: 0, error: true };
      });
  }

  function submitRating(courseId, ratingValue) {
    ratingValue = parseInt(ratingValue, 10);
    if (isNaN(ratingValue) || ratingValue < CONFIG.MIN_RATING || ratingValue > CONFIG.MAX_RATING) {
      return Promise.resolve({
        status: 'error',
        message: 'Invalid rating value: must be between 1 and 5'
      });
    }

    var body = JSON.stringify({
      courseId: courseId,
      rating: ratingValue
    });

    return _fetchWithRetry(CONFIG.API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body
    }, 0, 1).then(function (data) {
      if (data.status === 'success') {
        _clearCache(courseId);
      }
      return data;
    }).catch(function (err) {
      console.warn('RatingSystem: Failed to submit rating', err);
      return { status: 'error', message: err.message || 'Failed to submit rating' };
    });
  }

  /* ── Star Rendering ── */

  function renderStars(rating, isInteractive) {
    rating = parseFloat(rating) || 0;

    var lang = U.getLang();
    var displayAriaLabel = lang === 'ar'
      ? '\u0627\u0644\u062a\u0642\u064a\u064a\u0645: ' + rating.toFixed(1) + ' \u0645\u0646 5'
      : 'Rating: ' + rating.toFixed(1) + ' out of 5 stars';
    var interactiveAriaLabel = lang === 'ar'
      ? '\u0642\u064a\u0651\u0645 \u0647\u0630\u0627 \u0627\u0644\u0643\u0648\u0631\u0633 \u0645\u0646 1 \u0625\u0644\u0649 5 \u0646\u062c\u0648\u0645'
      : 'Rate this course from 1 to 5 stars';

    var container = U.el('div', {
      className: 'stars-container' + (isInteractive ? ' stars-interactive' : ' stars-display'),
      role: isInteractive ? 'radiogroup' : 'img',
      aria: { label: isInteractive ? interactiveAriaLabel : displayAriaLabel }
    });

    for (var i = 1; i <= CONFIG.MAX_RATING; i++) {
      var starEl;

      if (isInteractive) {
        var starAriaLabel = lang === 'ar'
          ? i + ' ' + (i === 1 ? '\u0646\u062c\u0645\u0629' : '\u0646\u062c\u0648\u0645')
          : i + ' star' + (i > 1 ? 's' : '');

        starEl = U.el('button', {
          type: 'button',
          className: 'star-btn',
          data: { value: String(i) },
          aria: { label: starAriaLabel, checked: 'false' },
          role: 'radio',
          tabindex: i === 1 ? '0' : '-1'
        }, [
          U.el('i', { className: 'bi bi-star', aria: { hidden: 'true' } })
        ]);
      } else {
        var iconClass;
        if (rating >= i) {
          iconClass = 'bi bi-star-fill';
        } else if (rating >= i - 0.5) {
          iconClass = 'bi bi-star-half';
        } else {
          iconClass = 'bi bi-star';
        }
        starEl = U.el('span', { className: 'star-display', aria: { hidden: 'true' } }, [
          U.el('i', { className: iconClass })
        ]);
      }
      container.appendChild(starEl);
    }

    return container;
  }

  function initializeStarEvents(container, onClickCallback) {
    if (!container) return;

    var stars = Array.from(container.querySelectorAll('.star-btn'));
    if (!stars.length) return;

    function highlightUpTo(value) {
      stars.forEach(function (s) {
        var v = parseInt(s.dataset.value, 10);
        var icon = s.querySelector('i');
        if (!icon) return;
        if (v <= value) {
          icon.className = 'bi bi-star-fill';
          s.classList.add('star-active');
        } else {
          icon.className = 'bi bi-star';
          s.classList.remove('star-active');
        }
      });
    }

    function resetHighlight() {
      var selected = container.dataset.selectedValue;
      if (selected) {
        highlightUpTo(parseInt(selected, 10));
      } else {
        stars.forEach(function (s) {
          var icon = s.querySelector('i');
          if (icon) icon.className = 'bi bi-star';
          s.classList.remove('star-active');
        });
      }
    }

    stars.forEach(function (star) {
      star.addEventListener('mouseenter', function () {
        if (container.classList.contains('stars-disabled')) return;
        highlightUpTo(parseInt(star.dataset.value, 10));
      });

      star.addEventListener('mouseleave', function () {
        if (container.classList.contains('stars-disabled')) return;
        resetHighlight();
      });

      star.addEventListener('click', function () {
        if (container.classList.contains('stars-disabled')) return;
        var value = parseInt(star.dataset.value, 10);
        container.dataset.selectedValue = String(value);
        highlightUpTo(value);

        stars.forEach(function (s) {
          s.setAttribute('aria-checked', s.dataset.value === String(value) ? 'true' : 'false');
        });

        if (typeof onClickCallback === 'function') {
          onClickCallback(value);
        }
      });
    });

    container.addEventListener('keydown', function (e) {
      if (container.classList.contains('stars-disabled')) return;

      var focused = document.activeElement;
      var idx = stars.indexOf(focused);
      if (idx === -1) return;

      var newIdx = idx;
      var isRtl = document.documentElement.dir === 'rtl';

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          newIdx = isRtl ? Math.max(idx - 1, 0) : Math.min(idx + 1, stars.length - 1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          newIdx = Math.min(idx + 1, stars.length - 1);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          newIdx = isRtl ? Math.min(idx + 1, stars.length - 1) : Math.max(idx - 1, 0);
          break;
        case 'ArrowDown':
          e.preventDefault();
          newIdx = Math.max(idx - 1, 0);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          focused.click();
          return;
        default:
          return;
      }

      stars[idx].setAttribute('tabindex', '-1');
      stars[newIdx].setAttribute('tabindex', '0');
      stars[newIdx].focus();
      highlightUpTo(parseInt(stars[newIdx].dataset.value, 10));
    });
  }

  function disableStars(container) {
    if (!container) return;
    container.classList.add('stars-disabled');
    var stars = container.querySelectorAll('.star-btn');
    stars.forEach(function (s) {
      s.disabled = true;
      s.setAttribute('tabindex', '-1');
    });
  }

  /* ── Public API ── */

  return Object.freeze({
    fetchRatings:         fetchRatings,
    submitRating:         submitRating,
    renderStars:          renderStars,
    initializeStarEvents: initializeStarEvents,
    disableStars:         disableStars
  });

})();

if (typeof window !== 'undefined' && RatingSystem) window.RatingSystem = RatingSystem;

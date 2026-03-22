'use strict';

/* ═══════════════════════════════════════════════════════════════
   utils.js — Shared Utility Library
   Exposes: window.Utils (frozen)
   No dependencies.
   ═══════════════════════════════════════════════════════════════ */

window.Utils = (function () {

  /* ─────────────────────────────────────────
     LANG DETECTION (cached)
  ───────────────────────────────────────── */

  var cachedLang = null;

  function getLang() {
    if (cachedLang !== null) return cachedLang;
    var p = window.location.pathname;
    cachedLang = (p === '/ar' || p.indexOf('/ar/') === 0) ? 'ar' : 'en';
    return cachedLang;
  }

  function t(bilingual) {
    if (bilingual === null || bilingual === undefined) return '';
    if (typeof bilingual === 'string') return bilingual;
    if (typeof bilingual === 'object' && bilingual.en !== undefined && bilingual.ar !== undefined) {
      return bilingual[getLang()] || '';
    }
    return '';
  }

  function getDir() {
    return getLang() === 'ar' ? 'rtl' : 'ltr';
  }

  /* ─────────────────────────────────────────
     SECURITY — escaping + URL sanitization
  ───────────────────────────────────────── */

  function escapeHtml(s) {
    if (typeof s !== 'string') return '';
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttr(s) {
    if (typeof s !== 'string') return '';
    return s
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function sanitizeUrl(url) {
    if (typeof url !== 'string') return '';
    var trimmed = url.trim();
    if (trimmed === '') return '';
    try {
      var parsed = new URL(trimmed, window.location.origin);
      var allowed = ['http:', 'https:', 'mailto:', 'tel:'];
      if (allowed.indexOf(parsed.protocol) === -1) return '';
      return trimmed;
    } catch (e) {
      if (/^[.\/]/.test(trimmed) || /^#/.test(trimmed) || /^\?/.test(trimmed)) return trimmed;
      return '';
    }
  }

  /* ─────────────────────────────────────────
     DOM — element factory
  ───────────────────────────────────────── */

  function el(tag, attrs, children) {
    var node = document.createElement(tag);

    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        if (key === 'innerHTML') {
          console.warn('el: innerHTML blocked');
          return;
        }
        if (key === 'textContent') {
          node.textContent = attrs[key];
        } else if (key === 'className') {
          node.className = attrs[key];
        } else if (key === 'style' && typeof attrs[key] === 'object') {
          Object.keys(attrs[key]).forEach(function (prop) {
            node.style[prop] = attrs[key][prop];
          });
        } else if (key === 'aria') {
          Object.keys(attrs[key]).forEach(function (aKey) {
            node.setAttribute('aria-' + aKey, attrs[key][aKey]);
          });
        } else if (key === 'data') {
          Object.keys(attrs[key]).forEach(function (dKey) {
            var kebab = dKey.replace(/([A-Z])/g, function (m) { return '-' + m.toLowerCase(); });
            node.setAttribute('data-' + kebab, attrs[key][dKey]);
          });
        } else if (key === 'role' || key === 'tabindex' || key === 'dir' || key === 'lang') {
          node.setAttribute(key, attrs[key]);
        } else if (key === 'for') {
          node.setAttribute('for', attrs[key]);
        } else {
          node[key] = attrs[key];
        }
      });
    }

    if (children) {
      if (!Array.isArray(children)) children = [children];
      children.forEach(function (child) {
        if (child === null || child === undefined) return;
        if (typeof child === 'string') {
          node.appendChild(document.createTextNode(child));
        } else if (child.nodeType) {
          node.appendChild(child);
        }
      });
    }

    return node;
  }

  /* ─────────────────────────────────────────
     DOM — safe link builder
  ───────────────────────────────────────── */

  function buildSafeLink(href, text, attrs) {
    var safeHref = sanitizeUrl(href);
    var props = { href: safeHref || '#', textContent: text || '' };
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        props[k] = attrs[k];
      });
    }
    return el('a', props);
  }

  /* ─────────────────────────────────────────
     UI — toast notifications
  ───────────────────────────────────────── */

  var activeToasts = [];
  var MAX_TOASTS = 3;

  function showToast(msg, type) {
    type = type || 'info';

    var isDuplicate = activeToasts.some(function (t) {
      return t.msg === msg && t.type === type;
    });
    if (isDuplicate) return;

    var container = document.querySelector('.toast-container');
    if (!container) return;

    var toastEl = el('div', {
      className: 'toast align-items-center border-0 show',
      role: 'alert',
      aria: { live: 'assertive', atomic: 'true' }
    }, [
      el('div', { className: 'd-flex' }, [
        el('div', { className: 'toast-body', textContent: msg }),
        el('button', {
          type: 'button',
          className: 'btn-close btn-close-white me-2 m-auto',
          aria: { label: getLang() === 'ar' ? 'إغلاق' : 'Close' }
        })
      ])
    ]);

    var record = { msg: msg, type: type, el: toastEl };
    activeToasts.push(record);

    if (activeToasts.length > MAX_TOASTS) {
      var oldest = activeToasts.shift();
      if (oldest.el.parentNode) oldest.el.parentNode.removeChild(oldest.el);
    }

    container.appendChild(toastEl);

    var closeBtn = toastEl.querySelector('.btn-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        if (toastEl.parentNode) toastEl.parentNode.removeChild(toastEl);
        activeToasts = activeToasts.filter(function (r) { return r !== record; });
      });
    }

    setTimeout(function () {
      if (toastEl.parentNode) toastEl.parentNode.removeChild(toastEl);
      activeToasts = activeToasts.filter(function (r) { return r !== record; });
    }, 5000);
  }

  /* ─────────────────────────────────────────
     DOM — query helpers
  ───────────────────────────────────────── */

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  /* ─────────────────────────────────────────
     PERFORMANCE — debounce / throttle
  ───────────────────────────────────────── */

  function debounce(fn, delay) {
    var timer;
    return function () {
      var ctx = this;
      var args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () { fn.apply(ctx, args); }, delay);
    };
  }

  function throttle(fn, limit) {
    var waiting = false;
    return function () {
      if (waiting) return;
      waiting = true;
      fn.apply(this, arguments);
      setTimeout(function () { waiting = false; }, limit);
    };
  }

  /* ─────────────────────────────────────────
     ACCESSIBILITY — screen reader announcements
  ───────────────────────────────────────── */

  var liveRegion = null;

  function announce(text, priority) {
    var level = priority || 'polite';
    if (!liveRegion) {
      liveRegion = el('div', {
        aria: { live: level, atomic: 'true' },
        role: level === 'assertive' ? 'alert' : 'status',
        className: 'visually-hidden'
      });
      document.body.appendChild(liveRegion);
    }
    liveRegion.textContent = '';
    setTimeout(function () { liveRegion.textContent = text; }, 100);
  }

  /* ─────────────────────────────────────────
     FORMATTING — numbers
  ───────────────────────────────────────── */

  function formatNumber(n) {
    if (typeof n !== 'number') n = Number(n) || 0;
    try { return n.toLocaleString('en-US'); } catch (e) { return String(n); }
  }

  function formatNumberAr(n) {
    if (typeof n !== 'number') n = Number(n) || 0;
    try { return n.toLocaleString('ar-EG'); } catch (e) { return String(n); }
  }

  function formatNumberByLang(n) {
    return getLang() === 'ar' ? formatNumberAr(n) : formatNumber(n);
  }

  /* ─────────────────────────────────────────
     FORMATTING — year
  ───────────────────────────────────────── */

  function formatYear(y) {
    var s = String(y);
    var eastern = ['\u0660','\u0661','\u0662','\u0663','\u0664','\u0665','\u0666','\u0667','\u0668','\u0669'];
    return s.replace(/\d/g, function (d) { return eastern[parseInt(d, 10)]; });
  }

  function formatYearByLang(y) {
    return getLang() === 'ar' ? formatYear(y) : String(y);
  }

  /* ─────────────────────────────────────────
     EXPORT (frozen)
  ───────────────────────────────────────── */

  return Object.freeze({
    getLang:           getLang,
    t:                 t,
    getDir:            getDir,
    escapeHtml:        escapeHtml,
    escapeAttr:        escapeAttr,
    sanitizeUrl:       sanitizeUrl,
    el:                el,
    buildSafeLink:     buildSafeLink,
    showToast:         showToast,
    qs:                qs,
    qsa:               qsa,
    debounce:          debounce,
    throttle:          throttle,
    announce:          announce,
    formatNumber:      formatNumber,
    formatNumberAr:    formatNumberAr,
    formatNumberByLang:formatNumberByLang,
    formatYear:        formatYear,
    formatYearByLang:  formatYearByLang
  });

})();

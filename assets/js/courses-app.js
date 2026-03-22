'use strict';

/* ═══════════════════════════════════════════════════════════════
   courses-app.js — Logic for course/index.html (Catalog)
   Depends on: Utils (utils.js), COURSE_DATA (courses-data.js),
               SharedPage (shared-page.js)
   NO innerHTML for dynamic content — DOM API only.
   ═══════════════════════════════════════════════════════════════ */

(function () {

  var U    = window.Utils;
  var DATA = window.COURSE_DATA;
  var SP   = window.SharedPage;

  if (!U || !DATA || !SP) {
    console.error('courses-app: dependencies missing.');
    return;
  }

  var META = DATA.META;

  /* ─────────────────────────────────────────
     CONFIGURATION
  ───────────────────────────────────────── */

  var CONFIG = Object.freeze({
    CARDS_PER_PAGE:  6,
    DEBOUNCE_DELAY:  300,
    SCROLL_THROTTLE: 150
  });

  var VALID_LEVELS     = ['All', 'Beginner', 'Intermediate', 'Advanced'];
  var VALID_RATINGS    = [0, 1, 2, 3, 4];
  var VALID_CATEGORIES = Object.keys(DATA.categories);

  /* Sort options: keyed by index for URL persistence */
  var SORT_KEYS = [
    'average ratings',
    'newly published',
    'title a-z',
    'title z-a',
    'price high to low',
    'price low to high',
    'popular'
  ];

  var state = {
    currentPage:     1,
    currentSortIdx:  0,
    filteredCourses: [],
    filtersEl:       null
  };

  var DOM = {};

  /* ─────────────────────────────────────────
     SORT LABEL HELPER
  ───────────────────────────────────────── */

  function getSortLabel(idx) {
    var labels = U.t(META.sortOptions);
    if (labels && Array.isArray(labels) && labels[idx] !== undefined) {
      return labels[idx];
    }
    return SORT_KEYS[idx] || '';
  }

  function getCurrentSortKey() {
    return SORT_KEYS[state.currentSortIdx] || 'average ratings';
  }

  /* ─────────────────────────────────────────
     SEO INJECTION
  ───────────────────────────────────────── */

  function injectSEO() {
    var brand     = DATA.BRAND_NAME;
    var base      = 'https://' + DATA.DOMAIN;
    var pageTitle = brand + ' \u2014 ' + U.t(META.catalogPageTitle);
    var pageDesc  = U.t(META.descriptionShort);

    SP.injectBaseSEO({
      title:       pageTitle,
      description: pageDesc,
      url:         SP.getCurrentAbsoluteUrl(),
      image:       base + META.ogImage
    });

    var schema = {
      '@context':    'https://schema.org',
      '@type':       'CollectionPage',
      'name':        pageTitle,
      'description': pageDesc,
      'url':         SP.getCurrentAbsoluteUrl(),
      'publisher': {
        '@type': 'Organization',
        'name':  brand,
        'url':   base
      },
      'inLanguage': U.getLang() === 'ar' ? 'ar' : 'en'
    };

    SP.injectJsonLd(schema);
    SP.injectOrganizationSchema();
  }

  /* ─────────────────────────────────────────
     DOM CACHE
  ───────────────────────────────────────── */

  function cacheDom() {
    DOM.grid        = U.qs('#courses-grid');
    DOM.pagination  = U.qs('#pagination-bar');
    DOM.results     = U.qs('#results-text');
    DOM.search      = U.qs('#search-input');
    DOM.sortBtn     = U.qs('#sort-dropdown');
    DOM.sortMenu    = U.qs('#sort-dropdown-menu');
    DOM.desktopSlot = U.qs('#desktop-filters-slot');
    DOM.mobileSlot  = U.qs('#mobile-filters-slot');
    DOM.offcanvas   = U.qs('#offcanvas-filters');
    DOM.fab         = U.qs('#floating-filter-btn');
    DOM.contentArea = U.qs('#content-area');
  }

  /* ─────────────────────────────────────────
     PAGE HEADER — set bilingual text + lang switcher
  ───────────────────────────────────────── */

  function setupPageHeader() {
    var titleEl = U.qs('.page-title');
    if (titleEl) titleEl.textContent = U.t(META.catalogPageTitle);

    var breadcrumbHome = U.qs('#breadcrumb-home');
    if (breadcrumbHome) {
      while (breadcrumbHome.firstChild) breadcrumbHome.removeChild(breadcrumbHome.firstChild);
      var homeIcon = U.el('i', { className: 'bi bi-house-fill', aria: { hidden: 'true' } });
      breadcrumbHome.appendChild(homeIcon);
      breadcrumbHome.appendChild(document.createTextNode(' ' + U.t(META.breadcrumbHome)));
    }

    var breadcrumbCurrent = U.qs('#breadcrumb-current');
    if (breadcrumbCurrent) breadcrumbCurrent.textContent = U.t(META.catalogBreadcrumbCourses);

    var searchInput = U.qs('#search-input');
    if (searchInput) {
      searchInput.setAttribute('placeholder', U.t(META.searchPlaceholder));
    }

    var searchLabel = U.qs('#search-label');
    if (searchLabel) searchLabel.textContent = U.t(META.searchLabel);

    var listHeading = U.qs('#courses-list-heading');
    if (listHeading) listHeading.textContent = U.t(META.coursesListHeading);

    var langSlot = U.qs('#page-header-lang-slot');
    if (langSlot) {
      while (langSlot.firstChild) langSlot.removeChild(langSlot.firstChild);
      langSlot.appendChild(SP.buildLangSwitcher());
    }
  }

  /* ─────────────────────────────────────────
     FILTERS ENGINE
  ───────────────────────────────────────── */

  function readFilters() {
    if (!state.filtersEl) return { categories: [], level: 'All', minRating: 0, search: '' };
    var cats = U.qsa('input[data-filter="category"]:checked', state.filtersEl).map(function (e) { return e.value; });
    var lv   = (U.qs('input[name="level-filter"]:checked', state.filtersEl) || {}).value || 'All';
    var rt   = parseInt((U.qs('input[name="rating-filter"]:checked', state.filtersEl) || {}).value || '0', 10);
    var s    = DOM.search ? DOM.search.value.toLowerCase().trim() : '';
    return { categories: cats, level: lv, minRating: rt, search: s };
  }

  function filterExceptCategory(courses, f) {
    return courses.filter(function (c) {
      if (c.rating < f.minRating) return false;
      if (f.level && f.level !== 'All' && c.level !== f.level) return false;
      if (f.search) {
        var s = f.search;
        var title = SP.getCourseField(c, 'title').toLowerCase();
        var desc  = SP.getCourseField(c, 'description').toLowerCase();
        var instr = SP.getCourseField(c, 'instructor').toLowerCase();
        if (title.indexOf(s) === -1 &&
            !(Array.isArray(c.tags) && c.tags.some(function (t) { return t.toLowerCase().indexOf(s) !== -1; })) &&
            desc.indexOf(s) === -1 &&
            instr.indexOf(s) === -1) return false;
      }
      return true;
    });
  }

  function filterByCategory(courses, cats) {
    return (!cats || !cats.length) ? courses : courses.filter(function (c) { return cats.indexOf(c.category) !== -1; });
  }

  function countCategories(courses) {
    var m = {};
    courses.forEach(function (c) { m[c.category] = (m[c.category] || 0) + 1; });
    return m;
  }

  function sortCourses(courses) {
    var l   = courses.slice();
    var key = getCurrentSortKey();
    switch (key) {
      case 'title a-z':         return l.sort(function (a, b) { return SP.getCourseField(a, 'title').localeCompare(SP.getCourseField(b, 'title')); });
      case 'title z-a':         return l.sort(function (a, b) { return SP.getCourseField(b, 'title').localeCompare(SP.getCourseField(a, 'title')); });
      case 'price low to high': return l.sort(function (a, b) { return a.price - b.price; });
      case 'price high to low': return l.sort(function (a, b) { return b.price - a.price; });
      case 'popular':           return l.sort(function (a, b) { return b.students - a.students; });
      case 'newly published':   return l.sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
      default:                  return l.sort(function (a, b) { return b.rating - a.rating; });
    }
  }

  /* ─────────────────────────────────────────
     CARD BUILDER
  ───────────────────────────────────────── */

  function buildCard(course, idx) {
    var title       = SP.getCourseField(course, 'title');
    var description = SP.getCourseField(course, 'description');
    var instructor  = SP.getCourseField(course, 'instructor');
    var priceText   = SP.formatPrice(course.price, course.originalPrice);
    var href        = U.sanitizeUrl(SP.buildCourseUrl(course.id));

    var img = U.el('img', {
      className: 'card-img-top course-card-img',
      src:       '/assets/img/' + course.image,
      alt:       title,
      loading:   idx < 3 ? 'eager' : 'lazy',
      decoding:  'async',
      width:     '400',
      height:    '225'
    });

    var badgeColor = (DATA.categories[course.category] || {}).color || 'emerald';
    var badge = U.el('span', { className: 'course-card-category course-card-category--' + badgeColor, textContent: SP.getCategoryLabel(course.category) });
    var imgWrap = U.el('div', { className: 'position-relative' }, [img, badge]);

    var titleEl = U.el('h3', { className: 'course-card-title', textContent: title });
    var descEl  = U.el('p',  { className: 'course-card-desc',  textContent: description });

    var instructorEl = U.el('span', { className: 'course-card-meta-item' }, [
      U.el('i', { className: 'bi bi-person-fill me-1', aria: { hidden: 'true' } }),
      instructor
    ]);

    var lessonsText = U.t(META.lessonsLabel).replace('{n}', String(course.lessons));
    var statsRow = U.el('div', { className: 'course-card-meta' }, [
      U.el('span', { className: 'course-card-meta-item' }, [U.el('i', { className: 'bi bi-people-fill me-1', aria: { hidden: 'true' } }), U.formatNumberByLang(course.students)]),
      U.el('span', { className: 'course-card-meta-item' }, [U.el('i', { className: 'bi bi-book-fill me-1',   aria: { hidden: 'true' } }), lessonsText]),
      U.el('span', { className: 'course-card-meta-item' }, [U.el('i', { className: 'bi bi-star-fill me-1',   aria: { hidden: 'true' } }), String(course.rating)])
    ]);

    var priceEl = U.el('span', {
      className:   'course-card-price' + (course.price === 0 ? ' course-card-price--free' : ''),
      textContent: priceText
    });

    var viewLabel = U.t(META.viewCourse);
    var btn = U.el('a', { className: 'course-card-btn', href: href, textContent: viewLabel });
    var footer = U.el('div', { className: 'course-card-footer' }, [priceEl, btn]);

    var body = U.el('div', { className: 'course-card-body' }, [titleEl, descEl, instructorEl, statsRow, footer]);

    var delayClass = idx < 6 ? ' course-card-delay-' + idx : '';
    var card = U.el('div', {
      className: 'course-card' + delayClass
    }, [imgWrap, body]);

    return U.el('div', { className: 'col-12 col-md-6 col-xl-4' }, [card]);
  }

  function buildEmpty() {
    var resetBtn = U.el('button', {
      className: 'empty-state-btn',
      type: 'button',
      textContent: U.t(META.resetFiltersLabel)
    });
    resetBtn.addEventListener('click', resetAll);

    return U.el('div', { className: 'col-12 empty-state' }, [
      U.el('i',  { className: 'bi bi-search empty-state-icon', aria: { hidden: 'true' } }),
      U.el('h3', { className: 'empty-state-title', textContent: U.t(META.emptyStateTitle) }),
      U.el('p',  { className: 'empty-state-text',  textContent: U.t(META.emptyStateText) }),
      resetBtn
    ]);
  }

  /* ─────────────────────────────────────────
     FILTER UI BUILDER
  ───────────────────────────────────────── */

  function buildFiltersDOM() {
    var root = U.el('div', { id: 'filters-root', className: 'filters-panel' });

    root.appendChild(U.el('h2', { className: 'filters-title', textContent: U.t(META.filtersTitle) }));

    /* Categories */
    var catSection = U.el('div', { className: 'filter-section' });
    catSection.appendChild(U.el('h3', { textContent: U.t(META.categoryLabel) }));
    var catList   = U.el('div', { id: 'category-filter-list' });
    var allCounts = countCategories(DATA.courses);

    VALID_CATEGORIES.forEach(function (cat) {
      var count = allCounts[cat] || 0;
      var id    = 'cat-' + cat.replace(/\s+/g, '-').toLowerCase();
      var cb    = U.el('input', { className: 'filter-checkbox', type: 'checkbox', id: id, value: cat, data: { filter: 'category' } });
      var label = U.el('label', { className: 'filter-label', textContent: SP.getCategoryLabel(cat) });
      label.setAttribute('for', id);
      var countEl = U.el('span', { className: 'filter-count', textContent: String(count) });
      catList.appendChild(U.el('div', { className: 'filter-item' }, [cb, label, countEl]));
    });
    catSection.appendChild(catList);
    root.appendChild(catSection);

    /* Levels */
    var levelSection = U.el('div', { className: 'filter-section' });
    levelSection.appendChild(U.el('h3', { textContent: U.t(META.levelLabel) }));
    var levelGroup = U.el('div');
    VALID_LEVELS.forEach(function (lv) {
      var id        = 'level-' + lv.toLowerCase();
      var r         = U.el('input', { className: 'filter-radio', type: 'radio', id: id, name: 'level-filter', value: lv });
      if (lv === 'All') r.checked = true;
      var labelText = lv === 'All'
        ? (U.getLang() === 'ar' ? '\u0643\u0644 \u0627\u0644\u0645\u0633\u062a\u0648\u064a\u0627\u062a' : 'All Levels')
        : SP.getLevelLabel(lv);
      var label = U.el('label', { className: 'filter-label', textContent: labelText });
      label.setAttribute('for', id);
      levelGroup.appendChild(U.el('div', { className: 'filter-item' }, [r, label]));
    });
    levelSection.appendChild(levelGroup);
    root.appendChild(levelSection);

    /* Ratings */
    var ratingSection = U.el('div', { className: 'filter-section' });
    ratingSection.appendChild(U.el('h3', { textContent: U.t(META.ratingLabel) }));
    var ratingGroup = U.el('div');
    var upText = U.getLang() === 'ar' ? ' وأعلى' : ' & up';
    var allText = U.getLang() === 'ar' ? '\u0643\u0644 \u0627\u0644\u062a\u0642\u064a\u064a\u0645\u0627\u062a' : 'All Ratings';

    for (var rv = 0; rv <= 4; rv++) {
      var rid   = 'rating-' + rv;
      var radio = U.el('input', { className: 'filter-radio', type: 'radio', id: rid, name: 'rating-filter', value: String(rv) });
      if (rv === 0) radio.checked = true;

      var lbl = U.el('label', { className: 'filter-label' + (rv > 0 ? ' rating-label' : '') });
      lbl.setAttribute('for', rid);

      if (rv === 0) {
        lbl.textContent = allText;
      } else {
        for (var si = 1; si <= 4; si++) {
          lbl.appendChild(U.el('i', {
            className: si <= rv ? 'bi bi-star-fill' : 'bi bi-star',
            aria: { hidden: 'true' }
          }));
        }
        lbl.appendChild(document.createTextNode(upText));
      }

      ratingGroup.appendChild(U.el('div', { className: 'filter-item' }, [radio, lbl]));
    }
    ratingSection.appendChild(ratingGroup);
    root.appendChild(ratingSection);

    /* Action buttons */
    var applyBtn = U.el('button', {
      className: 'course-card-btn',
      type: 'button',
      textContent: U.getLang() === 'ar' ? '\u062a\u0637\u0628\u064a\u0642' : 'Apply Filters'
    });
    applyBtn.addEventListener('click', function () { closeMobile(); render(true); });

    var resetBtn = U.el('button', {
      className: 'filter-reset-btn',
      type: 'button',
      textContent: U.t(META.resetFiltersLabel)
    });
    resetBtn.addEventListener('click', function () { resetAll(); closeMobile(); });

    root.appendChild(U.el('div', { className: 'filter-actions' }, [applyBtn, resetBtn]));

    return root;
  }

  function updateCategoryCounts(counts) {
    if (!state.filtersEl) return;
    U.qsa('#category-filter-list .filter-item', state.filtersEl).forEach(function (item) {
      var cb = U.qs('.filter-checkbox', item);
      var ct = U.qs('.filter-count',    item);
      if (!cb || !ct) return;
      var n = counts[cb.value] || 0;
      ct.textContent = String(n);
      item.classList.toggle('disabled', n === 0);
      cb.disabled = n === 0;
      if (n === 0 && cb.checked) {
        cb.checked = false;
      }
    });
  }

  /* ─────────────────────────────────────────
     FILTER TRANSFER
  ───────────────────────────────────────── */

  function toDesktop() { if (state.filtersEl && DOM.desktopSlot && !DOM.desktopSlot.contains(state.filtersEl)) DOM.desktopSlot.appendChild(state.filtersEl); }
  function toMobile()  { if (state.filtersEl && DOM.mobileSlot  && !DOM.mobileSlot.contains(state.filtersEl))  DOM.mobileSlot.appendChild(state.filtersEl);  }
  function closeMobile() {
    if (!DOM.offcanvas) return;
    try { var i = bootstrap.Offcanvas.getInstance(DOM.offcanvas); if (i) i.hide(); } catch (e) {}
  }

  function setupTransfer() {
    if (!DOM.offcanvas) return;
    DOM.offcanvas.addEventListener('show.bs.offcanvas',   toMobile);
    DOM.offcanvas.addEventListener('hidden.bs.offcanvas', toDesktop);
    var mq = window.matchMedia('(min-width: 992px)');
    mq.addEventListener('change', function (e) { if (e.matches) { closeMobile(); toDesktop(); } });
  }

  /* ─────────────────────────────────────────
     PAGINATION
  ───────────────────────────────────────── */

  function buildPagination(total) {
    if (!DOM.pagination) return;
    while (DOM.pagination.firstChild) DOM.pagination.removeChild(DOM.pagination.firstChild);
    var pages = Math.ceil(total / CONFIG.CARDS_PER_PAGE);
    if (pages <= 1) return;
    if (state.currentPage > pages) state.currentPage = pages;
    if (state.currentPage < 1)     state.currentPage = 1;

    var frag = document.createDocumentFragment();
    var prevLabel = U.getLang() === 'ar' ? '\u203A' : '\u2039';
    var nextLabel = U.getLang() === 'ar' ? '\u2039' : '\u203A';

    function mkPage(label, page, opts) {
      opts = opts || {};
      var li = U.el('li', { className: 'page-item' + (opts.disabled ? ' disabled' : '') + (opts.active ? ' active' : '') });
      var a  = U.el('a',  {
        className: 'page-link',
        href: '#',
        textContent: String(label),
        aria: { label: opts.ariaLabel || (U.t(META.paginationPage).replace('{n}', String(page))) }
      });
      if (opts.active) a.setAttribute('aria-current', 'page');
      a.addEventListener('click', function (e) {
        e.preventDefault();
        if (!opts.disabled && state.currentPage !== page) {
          state.currentPage = page;
          render(false);
          if (DOM.grid) DOM.grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
      li.appendChild(a);
      return li;
    }

    frag.appendChild(mkPage(prevLabel, state.currentPage - 1, { disabled: state.currentPage === 1, ariaLabel: U.t(META.paginationPrev) }));

    var d = 2;
    var range = [];
    for (var i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || (i >= state.currentPage - d && i <= state.currentPage + d)) range.push(i);
    }
    var last = 0;
    range.forEach(function (p) {
      if (p - last > 1) {
        var ell = U.el('li', { className: 'page-item disabled' });
        ell.appendChild(U.el('span', { className: 'page-link', textContent: '\u2026', aria: { hidden: 'true' } }));
        frag.appendChild(ell);
      }
      frag.appendChild(mkPage(U.formatNumberByLang(p), p, { active: p === state.currentPage }));
      last = p;
    });

    frag.appendChild(mkPage(nextLabel, state.currentPage + 1, { disabled: state.currentPage === pages, ariaLabel: U.t(META.paginationNext) }));
    DOM.pagination.appendChild(frag);
  }

  /* ─────────────────────────────────────────
     SORT
  ───────────────────────────────────────── */

  function buildSort() {
    if (!DOM.sortMenu) return;
    while (DOM.sortMenu.firstChild) DOM.sortMenu.removeChild(DOM.sortMenu.firstChild);

    SORT_KEYS.forEach(function (key, idx) {
      var a = U.el('a', {
        className: 'dropdown-item' + (idx === state.currentSortIdx ? ' active' : ''),
        href:      '#',
        textContent: getSortLabel(idx),
        data:      { sortIdx: String(idx) }
      });
      a.setAttribute('role', 'menuitem');
      a.addEventListener('click', function (e) {
        e.preventDefault();
        state.currentSortIdx = idx;
        updateSortLabel();
        highlightSort();
        render(true);
      });
      DOM.sortMenu.appendChild(U.el('li', null, [a]));
    });
    updateSortLabel();
  }

  function updateSortLabel() {
    if (!DOM.sortBtn) return;
    var lbl = U.qs('.sort-label', DOM.sortBtn);
    if (lbl) lbl.textContent = getSortLabel(state.currentSortIdx);
  }

  function highlightSort() {
    if (!DOM.sortMenu) return;
    U.qsa('.dropdown-item', DOM.sortMenu).forEach(function (item) {
      item.classList.toggle('active', item.getAttribute('data-sort-idx') === String(state.currentSortIdx));
    });
  }

  /* ─────────────────────────────────────────
     URL PERSISTENCE
  ───────────────────────────────────────── */

  function writeURL() {
    var f = readFilters();
    var p = new URLSearchParams();
    if (f.categories.length)           p.set('categories', f.categories.join(','));
    if (f.minRating > 0)               p.set('rating',     String(f.minRating));
    if (f.level !== 'All')             p.set('level',      f.level);
    if (f.search)                      p.set('search',     f.search);
    if (state.currentSortIdx !== 0)    p.set('sort',       String(state.currentSortIdx));
    if (state.currentPage > 1)         p.set('page',       String(state.currentPage));
    history.replaceState(null, '', p.toString() ? location.pathname + '?' + p : location.pathname);
  }

  function readURL() {
    var p = new URLSearchParams(location.search);
    if (!p.toString()) return;

    var cats = (p.get('categories') || '').split(',').filter(function (c) { return VALID_CATEGORIES.indexOf(c) !== -1; });
    if (cats.length && state.filtersEl) {
      U.qsa('input[data-filter="category"]', state.filtersEl).forEach(function (cb) { cb.checked = cats.indexOf(cb.value) !== -1; });
    }

    var rt = parseInt(p.get('rating'), 10);
    if (VALID_RATINGS.indexOf(rt) !== -1 && state.filtersEl) {
      var ri = U.qs('input[name="rating-filter"][value="' + rt + '"]', state.filtersEl);
      if (ri) ri.checked = true;
    }

    var lv = p.get('level');
    if (VALID_LEVELS.indexOf(lv) !== -1 && state.filtersEl) {
      var li = U.qs('input[name="level-filter"][value="' + lv + '"]', state.filtersEl);
      if (li) li.checked = true;
    }

    if (p.get('search') && DOM.search) DOM.search.value = p.get('search');

    var sortParam = parseInt(p.get('sort'), 10);
    if (!isNaN(sortParam) && sortParam >= 0 && sortParam < SORT_KEYS.length) {
      state.currentSortIdx = sortParam;
    }

    var pg = parseInt(p.get('page'), 10);
    if (!isNaN(pg) && pg >= 1) state.currentPage = pg;
  }

  /* ─────────────────────────────────────────
     SCHEMA
  ───────────────────────────────────────── */

  function updateSchema(courses) {
    var el = document.getElementById('jsonld-courses');
    if (el) el.remove();
    if (!courses.length) return;

    var base = 'https://' + DATA.DOMAIN;
    var schema = {
      '@context':      'https://schema.org',
      '@type':         'ItemList',
      'name':          DATA.BRAND_NAME + ' \u2014 ' + U.t(META.catalogPageTitle),
      'numberOfItems': courses.length,
      'itemListElement': courses.map(function (c, i) {
        return {
          '@type':    'ListItem',
          'position': i + 1,
          'item': {
            '@type':       'Course',
            'url':         base + SP.buildCourseUrl(c.id).replace(/^\/ar/, ''),
            'name':        SP.getCourseField(c, 'title'),
            'description': SP.getCourseField(c, 'description'),
            'provider': {
              '@type': 'Organization',
              'name':  DATA.BRAND_NAME
            }
          }
        };
      })
    };

    var s       = document.createElement('script');
    s.type      = 'application/ld+json';
    s.id        = 'jsonld-courses';
    s.textContent = JSON.stringify(schema);
    document.head.appendChild(s);
  }

  /* ─────────────────────────────────────────
     MAIN RENDER
  ───────────────────────────────────────── */

  function render(resetPage) {
    if (resetPage) state.currentPage = 1;
    var f        = readFilters();
    var pre      = filterExceptCategory(DATA.courses, f);
    updateCategoryCounts(countCategories(pre));
    var filtered = filterByCategory(pre, f.categories);
    var sorted   = sortCourses(filtered);
    state.filteredCourses = sorted;

    var total = sorted.length;
    var start = (state.currentPage - 1) * CONFIG.CARDS_PER_PAGE;
    var end   = Math.min(start + CONFIG.CARDS_PER_PAGE, total);
    var page  = sorted.slice(start, end);

    if (DOM.grid) {
      while (DOM.grid.firstChild) DOM.grid.removeChild(DOM.grid.firstChild);
      if (!page.length) {
        DOM.grid.appendChild(buildEmpty());
      } else {
        var frag = document.createDocumentFragment();
        page.forEach(function (c, i) { frag.appendChild(buildCard(c, i)); });
        DOM.grid.appendChild(frag);
      }
    }

    if (DOM.results) {
      var showing = total
        ? (U.formatNumberByLang(start + 1) + '\u2013' + U.formatNumberByLang(end))
        : '0';
      var resultsText = U.t(META.resultsTemplate).replace('{count}', U.formatNumberByLang(total));
      DOM.results.textContent = showing + ' / ' + resultsText;
    }

    buildPagination(total);
    updateSchema(state.filteredCourses);
    writeURL();

    var announceText = U.formatNumberByLang(total) + ' ' + (U.getLang() === 'ar' ? '\u0643\u0648\u0631\u0633' : 'courses found');
    U.announce(announceText);
  }

  /* ─────────────────────────────────────────
     RESET
  ───────────────────────────────────────── */

  function resetAll() {
    if (DOM.search) DOM.search.value = '';
    if (state.filtersEl) {
      U.qsa('input[data-filter="category"]', state.filtersEl).forEach(function (c) { c.checked = false; });
      var al = U.qs('input[name="level-filter"][value="All"]', state.filtersEl); if (al) al.checked = true;
      var ar = U.qs('input[name="rating-filter"][value="0"]',  state.filtersEl); if (ar) ar.checked = true;
    }
    state.currentSortIdx = 0;
    updateSortLabel();
    highlightSort();
    render(true);
  }

  /* ─────────────────────────────────────────
     EVENTS
  ───────────────────────────────────────── */

  function bindEvents() {
    if (DOM.search) {
      DOM.search.addEventListener('input', U.debounce(function () { render(true); }, CONFIG.DEBOUNCE_DELAY));
    }
    if (state.filtersEl) {
      state.filtersEl.addEventListener('change', function (e) {
        if (e.target.matches('input[data-filter="category"], input[name="level-filter"], input[name="rating-filter"]')) render(true);
      });
    }
    if (DOM.fab) {
      var lastY = window.scrollY;
      window.addEventListener('scroll', U.throttle(function () {
        var y = window.scrollY;
        DOM.fab.classList.toggle('is-hidden', y > 100 && y > lastY);
        lastY = y;
      }, CONFIG.SCROLL_THROTTLE));
    }
    setupTransfer();
  }

  /* ─────────────────────────────────────────
     INIT
  ───────────────────────────────────────── */

  function init() {
    injectSEO();
    cacheDom();
    setupPageHeader();
    if (DOM.contentArea) DOM.contentArea.classList.add('position-relative');
    state.filtersEl = buildFiltersDOM();
    toDesktop();
    buildSort();
    readURL();
    bindEvents();
    render(false);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();

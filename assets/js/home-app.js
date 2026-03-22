'use strict';

/* ═══════════════════════════════════════════════════════════════
   home-app.js — Logic for index.html
   Depends on: Utils (utils.js), COURSE_DATA (courses-data.js),
               SharedPage (shared-page.js)
   Uses Utils (aliased U) for all DOM construction and security.
   NO innerHTML for dynamic content — DOM API only.
   ═══════════════════════════════════════════════════════════════ */

(function () {

  /* ─────────────────────────────────────────
     GUARD CLAUSE & ALIASES
  ───────────────────────────────────────── */

  var U    = window.Utils;
  var DATA = window.COURSE_DATA;
  var SP   = window.SharedPage;

  if (!U || !DATA || !SP) {
    console.error('home-app: dependencies missing.');
    return;
  }

  var META = DATA.META;

  /* ─────────────────────────────────────────
     CONSTANTS
  ───────────────────────────────────────── */

  var FEATURED_COUNT = 3;

  var CATEGORY_ICONS = {
    'Development': 'bi-code-slash',
    'Business':    'bi-briefcase-fill',
    'Health':      'bi-heart-pulse-fill',
    'IT':          'bi-hdd-network-fill',
    'Marketing':   'bi-megaphone-fill',
    'Photography': 'bi-camera-fill',
    'Design':      'bi-palette-fill',
    'Developer':   'bi-code-slash'
  };

  /* ─────────────────────────────────────────
     COMPUTED STATS
  ───────────────────────────────────────── */

  var courseCount   = DATA.courses.length;
  var totalStudents = DATA.courses.reduce(function (s, c) { return s + c.students; }, 0);
  var ratedCourses  = DATA.courses.filter(function (c) { return c.rating > 0; });
  var avgRating     = ratedCourses.length > 0
    ? (ratedCourses.reduce(function (s, c) { return s + c.rating; }, 0) / ratedCourses.length)
    : 0;

  /* ─────────────────────────────────────────
     HELPERS
  ───────────────────────────────────────── */

  function getFeaturedCourses() {
    return DATA.courses.slice().sort(function (a, b) {
      return new Date(b.date) - new Date(a.date);
    }).slice(0, FEATURED_COUNT);
  }

  /* ─────────────────────────────────────────
     SEO INJECTION
  ───────────────────────────────────────── */

  function injectSEO() {
    var brand = DATA.BRAND_NAME;
    var base  = 'https://' + DATA.DOMAIN;

    var pageTitle = brand + ' \u2014 ' + U.t(META.tagline);
    var pageDesc  = U.t(META.description);

    SP.injectBaseSEO({
      title:       pageTitle,
      description: pageDesc,
      url:         SP.getCurrentAbsoluteUrl(),
      image:       base + META.ogImage
    });

    var schema = {
      '@context': 'https://schema.org',
      '@type':    'WebSite',
      '@id':      base + '/#website',
      'name':     brand,
      'url':      base,
      'description': U.t(META.description),
      'inLanguage': U.getLang() === 'ar' ? 'ar' : 'en',
      'potentialAction': {
        '@type':  'SearchAction',
        'target': {
          '@type':       'EntryPoint',
          'urlTemplate': base + '/course/?search={search_term_string}'
        },
        'query-input': 'required name=search_term_string'
      }
    };

    SP.injectJsonLd(schema);
    SP.injectOrganizationSchema();

    SP.markCurrentNavLink('home');
  }

  /* ─────────────────────────────────────────
     BUILDERS
  ───────────────────────────────────────── */

  function buildHero() {
    var line1    = document.getElementById('hero-title-line1');
    var gradient = document.getElementById('hero-title-gradient');
    var subtitle = document.getElementById('hero-subtitle');
    var badge    = document.getElementById('hero-badge-text');

    SP.buildNavBrand();

    if (line1)    line1.textContent    = U.t(META.heroLine1);
    if (gradient) gradient.textContent = U.t(META.heroLine2);
    if (subtitle) subtitle.textContent = U.t(META.heroSubtitle);
    if (badge)    badge.textContent    = U.t(META.heroBadge);
  }

  function buildStats() {
    var container = document.getElementById('stats-bar');
    if (!container) return;

    var STATS = [
      { icon: 'bi-journal-bookmark-fill', number: U.formatNumberByLang(courseCount),   label: U.t(META.statCourses) },
      { icon: 'bi-people-fill',           number: U.formatNumberByLang(totalStudents), label: U.t(META.statStudents) },
      { icon: 'bi-star-fill',             number: avgRating > 0 ? avgRating.toFixed(1) : '0', label: U.t(META.statRating) },
      { icon: 'bi-award-fill',            number: ratedCourses.length > 0 ? '100%' : '0%',    label: U.t(META.statSatisfaction) }
    ];

    var frag = document.createDocumentFragment();

    STATS.forEach(function (stat) {
      var item = U.el('div', { className: 'stat-item', role: 'listitem' }, [
        U.el('i', { className: 'bi ' + stat.icon + ' stat-icon', aria: { hidden: 'true' } }),
        U.el('div', { className: 'stat-number', textContent: stat.number }),
        U.el('div', { className: 'stat-label',  textContent: stat.label })
      ]);
      frag.appendChild(item);
    });

    container.appendChild(frag);
  }

  function buildFeaturedCard(course) {
    var col = U.el('div', { className: 'col-12 col-md-6 col-lg-4' });

    var card = U.el('div', { className: 'featured-card' });

    var img = U.el('img', {
      className: 'featured-card-img',
      alt:       SP.getCourseField(course, 'title'),
      loading:   'eager',
      decoding:  'async',
      width:     '400',
      height:    '225',
      src:       '/assets/img/' + course.image
    });
    card.appendChild(img);

    var body = U.el('div', { className: 'featured-card-body' });

    body.appendChild(U.el('div', { className: 'featured-card-category', textContent: SP.getCategoryLabel(course.category) }));
    body.appendChild(U.el('h3',  { className: 'featured-card-title',    textContent: SP.getCourseField(course, 'title') }));

    var descText = SP.getCourseField(course, 'description');
    body.appendChild(U.el('p', { className: 'featured-card-desc', textContent: descText }));

    var metaRow = U.el('div', { className: 'featured-card-meta' });

    var starsAriaText = U.t(META.starsAria).replace('{rating}', String(course.rating));
    var starsWrap = U.el('div', {
      className: 'featured-stars',
      role:      'img',
      aria:      { label: starsAriaText }
    });
    starsWrap.appendChild(SP.buildStarFragment(course.rating));
    metaRow.appendChild(starsWrap);

    var lessonsText = U.t(META.lessonsLabel).replace('{n}', String(course.lessons));
    var lessonsItem = U.el('span', { className: 'featured-meta-item' }, [
      U.el('i', { className: 'bi bi-play-circle', aria: { hidden: 'true' } }),
      ' ' + lessonsText
    ]);
    metaRow.appendChild(lessonsItem);

    var levelItem = U.el('span', { className: 'featured-meta-item' }, [
      U.el('i', { className: 'bi bi-bar-chart-fill', aria: { hidden: 'true' } }),
      ' ' + SP.getLevelLabel(course.level)
    ]);
    metaRow.appendChild(levelItem);

    body.appendChild(metaRow);

    var footer = U.el('div', { className: 'featured-card-footer' });

    var priceText = SP.formatPrice(course.price, course.originalPrice);
    var priceEl = U.el('span', {
      className:   'featured-card-price' + (course.price === 0 ? ' featured-card-price--free' : ''),
      textContent: priceText
    });
    footer.appendChild(priceEl);

    var courseTitle = SP.getCourseField(course, 'title');
    var viewLabel  = U.t(META.viewCourse);
    var cardAriaText = U.t(META.courseCardAria).replace('{title}', courseTitle);

    var btn = U.el('a', {
      className:   'featured-card-btn',
      href:        U.sanitizeUrl(SP.buildCourseUrl(course.id)),
      textContent: viewLabel,
      aria:        { label: cardAriaText }
    });
    footer.appendChild(btn);

    body.appendChild(footer);
    card.appendChild(body);
    col.appendChild(card);
    return col;
  }

  function buildFeaturedCourses() {
    var grid = document.getElementById('featured-courses-grid');
    if (!grid) return;

    var heading = document.getElementById('featured-heading');
    if (heading) heading.textContent = U.t(META.featuredHeading);

    var frag = document.createDocumentFragment();
    getFeaturedCourses().forEach(function (c) {
      frag.appendChild(buildFeaturedCard(c));
    });
    grid.appendChild(frag);
  }

  function buildCategoryCard(name, count, colorKey) {
    var col = U.el('div', { className: 'col-6 col-sm-4 col-md-3 col-lg-2' });

    var label = SP.getCategoryLabel(name);
    var countText = U.t(META.coursesLabel).replace('{n}', String(count));
    var ariaText = U.t(META.categoryCardAria)
      .replace('{name}', label)
      .replace('{count}', String(count));

    var anchor = U.el('a', {
      className: 'category-card category-card--' + colorKey,
      href:      U.sanitizeUrl(SP.buildCatalogUrl(name)),
      aria:      { label: ariaText }
    });

    var iconWrap = U.el('div', { className: 'category-icon category-icon--' + colorKey }, [
      U.el('i', {
        className: 'bi ' + (CATEGORY_ICONS[name] || 'bi-bookmark-fill'),
        aria:      { hidden: 'true' }
      })
    ]);
    anchor.appendChild(iconWrap);

    anchor.appendChild(U.el('span', { className: 'category-name',  textContent: label }));
    anchor.appendChild(U.el('span', { className: 'category-count', textContent: countText }));

    col.appendChild(anchor);
    return col;
  }

  function buildCategories() {
    var grid = document.getElementById('categories-grid');
    if (!grid) return;

    var heading = document.getElementById('categories-heading');
    if (heading) heading.textContent = U.t(META.categoriesHeading);

    var catMap = SP.getCategoriesWithCount();
    var frag   = document.createDocumentFragment();
    Object.keys(catMap).forEach(function (name) {
      var colorKey = (DATA.categories[name] || {}).color || 'emerald';
      frag.appendChild(buildCategoryCard(name, catMap[name], colorKey));
    });
    grid.appendChild(frag);
  }

  function buildHowSection() {
    var heading = document.getElementById('how-heading');
    if (heading) heading.textContent = U.t(META.howHeading);

    var steps = U.t(META.howSteps);
    if (!steps || !Array.isArray(steps)) return;

    for (var i = 0; i < steps.length; i++) {
      var titleEl = document.getElementById('how-step-title-' + (i + 1));
      var descEl  = document.getElementById('how-step-desc-' + (i + 1));
      if (titleEl) titleEl.textContent = steps[i].title;
      if (descEl)  descEl.textContent  = steps[i].desc;
    }
  }

  function buildCTA() {
    var ctaHeading  = document.getElementById('cta-heading');
    var ctaSubtitle = document.getElementById('cta-subtitle');
    if (ctaHeading)  ctaHeading.textContent  = U.t(META.ctaTitle);
    if (ctaSubtitle) ctaSubtitle.textContent = U.t(META.ctaSubtitle);
  }

  /* ─────────────────────────────────────────
     INIT
  ───────────────────────────────────────── */

  function init() {
    injectSEO();
    buildHero();
    buildStats();
    buildFeaturedCourses();
    buildCategories();
    buildHowSection();
    buildCTA();
    SP.buildFooterCategories();
    SP.buildWhatsAppLinks();
    SP.buildFooter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

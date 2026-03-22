'use strict';

/* ═══════════════════════════════════════════════════════════════
   services-app.js — Logic for services.html & /ar/services.html
   Depends on: Utils (utils.js), COURSE_DATA (courses-data.js),
               SharedPage (shared-page.js)
   NO innerHTML for dynamic content — DOM API only.
   ═══════════════════════════════════════════════════════════════ */

(function () {

  /* ─────────────────────────────────────────
     GUARD CLAUSE + ALIASES
  ───────────────────────────────────────── */

  var U    = window.Utils;
  var DATA = window.COURSE_DATA;
  var SP   = window.SharedPage;

  if (!U || !DATA || !SP) {
    console.error('services-app: dependencies missing.');
    return;
  }

  var META = DATA.META;

  /* ─────────────────────────────────────────
     SEO INJECTION
  ───────────────────────────────────────── */

  function injectSEO() {
    var brand = DATA.BRAND_NAME;
    var base  = 'https://' + DATA.DOMAIN;

    var pageTitle = U.t(META.servicesSeoTitle);
    var pageDesc  = U.t(META.servicesPageDescription);

    SP.injectBaseSEO({
      title:       pageTitle,
      description: pageDesc,
      url:         SP.getCurrentAbsoluteUrl(),
      image:       base + META.ogImage
    });

    var cards = U.t(META.servicesCards);
    var itemList = [];
    if (cards && Array.isArray(cards)) {
      cards.forEach(function (card) {
        itemList.push({
          '@type':       'Offer',
          'name':        card.title,
          'description': card.description
        });
      });
    }

    var schema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type':       'WebPage',
          '@id':         SP.getCurrentAbsoluteUrl() + '#webpage',
          'url':         SP.getCurrentAbsoluteUrl(),
          'name':        pageTitle,
          'description': pageDesc,
          'inLanguage':  U.getLang() === 'ar' ? 'ar' : 'en',
          'isPartOf':    { '@id': base + '/#website' }
        },
        {
          '@type':       'OfferCatalog',
          '@id':         SP.getCurrentAbsoluteUrl() + '#services',
          'name':        U.t(META.servicesHeroTitle),
          'description': U.t(META.servicesHeroSubtitle),
          'provider': {
            '@type': 'Organization',
            'name':  brand,
            'url':   base,
            'availableLanguage': ['English', 'Arabic']
          },
          'itemListElement': itemList
        }
      ]
    };

    SP.injectJsonLd(schema);
    SP.injectOrganizationSchema();

    SP.markCurrentNavLink('services');
  }

  /* ─────────────────────────────────────────
     HERO — #services-hero
  ───────────────────────────────────────── */

  function buildHero() {
    var heading  = document.getElementById('services-hero-heading');
    var subtitle = document.getElementById('services-hero-subtitle');

    if (heading)  heading.textContent  = U.t(META.servicesHeroTitle);
    if (subtitle) subtitle.textContent = U.t(META.servicesHeroSubtitle);
  }

  /* ─────────────────────────────────────────
     SERVICE CARDS — #services-grid
  ───────────────────────────────────────── */

  function buildServiceCards() {
    var container = document.getElementById('services-grid');
    if (!container) return;

    while (container.firstChild) container.removeChild(container.firstChild);

    var cards = U.t(META.servicesCards);
    if (!cards || !Array.isArray(cards)) return;

    var iconColors = ['', '--teal', '--cyan'];
    var frag = document.createDocumentFragment();

    cards.forEach(function (card, idx) {
      var isHighlight = idx === 2;
      var iconColor   = iconColors[idx] || '';

      var col = U.el('div', { className: 'col-12 col-md-6 col-lg-4' });

      var cardEl = U.el('div', {
        className: 'service-card' + (isHighlight ? ' service-card--highlight' : '')
      });

      if (isHighlight) {
        var badgeText = U.getLang() === 'ar' ? 'الأكثر طلباً' : 'Most Popular';
        cardEl.appendChild(U.el('span', { className: 'service-card__badge', textContent: badgeText }));
      }

      cardEl.appendChild(U.el('div', {
        className: 'service-card__icon' + (iconColor ? ' service-card__icon' + iconColor : '')
      }, [
        U.el('i', { className: 'bi ' + card.icon, aria: { hidden: 'true' } })
      ]));

      cardEl.appendChild(U.el('h3', { className: 'service-card__title', textContent: card.title }));
      cardEl.appendChild(U.el('p',  { className: 'service-card__subtitle', textContent: card.subtitle }));
      cardEl.appendChild(U.el('p',  {
        className: 'service-card__desc',
        textContent: card.description
      }));

      col.appendChild(cardEl);
      frag.appendChild(col);
    });

    container.appendChild(frag);
  }

  /* ─────────────────────────────────────────
     HOW IT WORKS — #services-how
  ───────────────────────────────────────── */

  function buildHow() {
    var heading = document.getElementById('services-how-heading');
    if (heading) heading.textContent = U.t(META.servicesHowTitle);

    var container = document.getElementById('services-how-grid');
    if (!container) return;

    while (container.firstChild) container.removeChild(container.firstChild);

    var steps = U.t(META.servicesHowSteps);
    if (!steps || !Array.isArray(steps)) return;

    var icons = ['bi-ui-radios-grid', 'bi-gear-wide-connected', 'bi-rocket-takeoff'];
    var frag  = document.createDocumentFragment();

    steps.forEach(function (step, idx) {
      var col = U.el('div', { className: 'col-12 col-md-4' });

      var card = U.el('div', {
        className: 'services-how-card' + (idx === 1 ? ' services-how-card--accent' : '')
      });

      card.appendChild(U.el('span', {
        className: 'services-how-step',
        textContent: (U.getLang() === 'ar' ? 'خطوة ' : 'Step ') + U.formatNumberByLang(idx + 1)
      }));

      card.appendChild(U.el('div', {
        className: 'services-how-icon' + (idx === 1 ? ' services-how-icon--teal' : '')
      }, [
        U.el('i', { className: 'bi ' + (icons[idx] || 'bi-check-circle'), aria: { hidden: 'true' } })
      ]));

      card.appendChild(U.el('h3', { className: 'services-how-title', textContent: step.title }));
      card.appendChild(U.el('p',  { className: 'services-how-text',  textContent: step.description }));

      col.appendChild(card);
      frag.appendChild(col);
    });

    container.appendChild(frag);
  }

  /* ─────────────────────────────────────────
     VALUES — #services-values
  ───────────────────────────────────────── */

  function buildValues() {
    var heading = document.getElementById('services-values-heading');
    if (heading) heading.textContent = U.t(META.servicesValuesTitle);

    var container = document.getElementById('services-values-grid');
    if (!container) return;

    while (container.firstChild) container.removeChild(container.firstChild);

    var values = U.t(META.servicesValues);
    if (!values || !Array.isArray(values)) return;

    var iconClasses = [
      'bi-person-badge',
      'bi-cash-stack',
      'bi-credit-card-2-front',
      'bi-cpu',
      'bi-sliders',
      'bi-globe-central-south-asia'
    ];
    var colorClasses = [
      'services-value-icon--em',
      'services-value-icon--teal',
      'services-value-icon--cyan',
      'services-value-icon--gold',
      'services-value-icon--em',
      'services-value-icon--teal'
    ];

    var frag = document.createDocumentFragment();

    values.forEach(function (val, idx) {
      var col = U.el('div', { className: 'col-6 col-md-4 col-lg-2' });

      var card = U.el('div', { className: 'services-value-card' });

      card.appendChild(U.el('div', {
        className: 'services-value-icon ' + (colorClasses[idx] || 'services-value-icon--em')
      }, [
        U.el('i', { className: 'bi ' + (iconClasses[idx] || 'bi-check-circle'), aria: { hidden: 'true' } })
      ]));

      card.appendChild(U.el('h3', { className: 'services-value-title', textContent: val.title }));
      card.appendChild(U.el('p',  { className: 'services-value-text',  textContent: val.description }));

      col.appendChild(card);
      frag.appendChild(col);
    });

    container.appendChild(frag);
  }

  /* ─────────────────────────────────────────
     CTA — #services-cta
  ───────────────────────────────────────── */

  function buildCTA() {
    var heading  = document.getElementById('services-cta-heading');
    var subtitle = document.getElementById('services-cta-subtitle');

    if (heading)  heading.textContent  = U.t(META.servicesCtaTitle);
    if (subtitle) subtitle.textContent = U.t(META.servicesCtaSubtitle);
  }

  /* ─────────────────────────────────────────
     BREADCRUMB
  ───────────────────────────────────────── */

  function buildBreadcrumb() {
    var home = document.getElementById('services-breadcrumb-home');
    var current = document.getElementById('services-breadcrumb-current');

    if (home) {
      var icon = home.querySelector('i');
      while (home.firstChild) home.removeChild(home.firstChild);
      if (icon) home.appendChild(icon);
      home.appendChild(document.createTextNode(U.t(META.breadcrumbHome)));
      home.href = U.sanitizeUrl(SP.buildHomeUrl());
    }
    if (current) current.textContent = U.t(META.servicesPageTitle);
  }

  /* ─────────────────────────────────────────
     INIT
  ───────────────────────────────────────── */

  function init() {
    injectSEO();
    SP.buildNavBrand();
    buildBreadcrumb();
    buildHero();
    buildServiceCards();
    buildHow();
    buildValues();
    buildCTA();
    SP.buildWhatsAppLinks();
    SP.buildEmailLinks();
    SP.buildFooter();
    SP.buildFooterCategories();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

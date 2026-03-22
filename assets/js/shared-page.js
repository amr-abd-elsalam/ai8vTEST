'use strict';

/* ═══════════════════════════════════════════════════════════════
   shared-page.js — Shared page chrome & SEO for all pages
   Depends on: Utils (utils.js), COURSE_DATA (courses-data.js)
   Exposes: window.SharedPage (frozen)
   ═══════════════════════════════════════════════════════════════ */

window.SharedPage = (function () {

  /* ─────────────────────────────────────────
     GUARD & ALIASES
  ───────────────────────────────────────── */

  var U    = window.Utils;
  var DATA = window.COURSE_DATA;

  if (!U || !DATA) {
    console.error('SharedPage: Utils or COURSE_DATA missing.');
    return null;
  }

  var META   = DATA.META;
  var LANG   = U.getLang();
  var IS_AR  = LANG === 'ar';
  var PREFIX = IS_AR ? '/ar' : '';
  var BASE   = 'https://' + DATA.DOMAIN;

  /* ─────────────────────────────────────────
     DOM HELPERS
  ───────────────────────────────────────── */

  function setTextById(id, text) {
    var node = document.getElementById(id);
    if (node) node.textContent = text;
  }

  function setHrefById(id, href) {
    var node = document.getElementById(id);
    if (node) node.setAttribute('href', href);
  }

  function setAttrById(id, attr, value) {
    var node = document.getElementById(id);
    if (node) node.setAttribute(attr, value);
  }

  /* ─────────────────────────────────────────
     URL BUILDERS
  ───────────────────────────────────────── */

  function buildWhatsAppUrl(phone, message) {
    var url = 'https://wa.me/' + encodeURIComponent(phone);
    if (message) url += '?text=' + encodeURIComponent(message);
    return url;
  }

  function buildCatalogUrl(category) {
    var base = PREFIX + '/course/';
    if (!category) return base;
    return base + '?categories=' + encodeURIComponent(category);
  }

  function buildCourseUrl(id) {
    return PREFIX + '/course/course-details/?id=' + encodeURIComponent(id);
  }

  function buildHomeUrl() {
    return PREFIX + '/';
  }

  function buildAboutUrl() {
    return PREFIX + '/about.html';
  }

  function buildServicesUrl() {
    return PREFIX + '/services.html';
  }

  function buildPrivacyUrl() {
    return PREFIX + '/legal/privacy.html';
  }

  function buildTermsUrl() {
    return PREFIX + '/legal/terms.html';
  }

  function getDefaultWhatsAppUrl() {
    return buildWhatsAppUrl(DATA.WHATSAPP_NUMBER, U.t(META.whatsappDefaultMessage));
  }

  function getWhatsAppMessage() {
    return U.t(META.whatsappDefaultMessage);
  }

  /* ─────────────────────────────────────────
     LANGUAGE SWITCHER
  ───────────────────────────────────────── */

  function getAlternateUrl() {
    var path = window.location.pathname;
    var search = window.location.search;
    var alt;
    if (IS_AR) {
      alt = path.replace(/^\/ar(\/|$)/, '/');
      if (alt === '') alt = '/';
    } else {
      alt = '/ar' + (path === '/' ? '/' : path);
    }
    return alt + search;
  }

  function getAlternateAbsoluteUrl() {
    return BASE + getAlternateUrl();
  }

  function getCurrentAbsoluteUrl() {
    return BASE + window.location.pathname + window.location.search;
  }

  function buildLangSwitcher() {
    var altUrl = getAlternateUrl();
    var label = U.t(META.langSwitchLabel);
    var targetLang = IS_AR ? 'en' : 'ar';

    var link = U.el('a', {
      className: 'lang-switcher',
      href: U.sanitizeUrl(altUrl),
      textContent: label,
      lang: targetLang,
      aria: { label: IS_AR ? 'Switch to English' : 'التبديل إلى العربية' }
    });
    link.setAttribute('hreflang', targetLang);

    return link;
  }

  /* ─────────────────────────────────────────
     PAGE LANG HELPER
  ───────────────────────────────────────── */

  function getPageLang() {
    return LANG;
  }

  /* ─────────────────────────────────────────
     FORMATTING
  ───────────────────────────────────────── */

  function formatPrice(price, originalPrice) {
    if (price === 0) return U.t(META.freeLabel);
    var symbol = U.t(META.currencyLabel);
    var rate   = U.t(META.currencyRate) || 1;
    var converted = Math.round(price * rate);
    return U.formatNumberByLang(converted) + ' ' + symbol;
  }

  function buildCopyrightText() {
    var template = U.t(META.copyrightTemplate);
    var year = U.formatYearByLang(new Date().getFullYear());
    return template
      .replace('{year}', year)
      .replace('{brand}', DATA.BRAND_NAME);
  }

  /* ─────────────────────────────────────────
     COURSE DATA HELPERS
  ───────────────────────────────────────── */

  function getCourseField(course, field) {
    if (!course) return '';
    var langObj = course[LANG];
    if (langObj && langObj[field] !== undefined) return langObj[field];
    var fallback = course[IS_AR ? 'en' : 'ar'];
    if (fallback && fallback[field] !== undefined) return fallback[field];
    return course[field] || '';
  }

  function getCategoriesWithCount() {
    var map = {};
    DATA.courses.forEach(function (c) {
      map[c.category] = (map[c.category] || 0) + 1;
    });
    return map;
  }

  function getCategoryLabel(categoryKey) {
    var cat = DATA.categories[categoryKey];
    if (!cat) return categoryKey;
    if (cat.label) return U.t(cat.label);
    return categoryKey;
  }

  function getLevelLabel(levelEn) {
    var levels = META.levels;
    if (!levels) return levelEn;
    var enLevels = levels.en;
    var idx = enLevels.indexOf(levelEn);
    if (idx === -1) return levelEn;
    return U.t(levels)[idx] || levelEn;
  }

  /* ─────────────────────────────────────────
     STARS
  ───────────────────────────────────────── */

  function buildStarFragment(rating) {
    var frag = document.createDocumentFragment();
    for (var i = 1; i <= 5; i++) {
      var cls;
      if (rating >= i) {
        cls = 'bi bi-star-fill';
      } else if (rating >= i - 0.5) {
        cls = 'bi bi-star-half';
      } else {
        cls = 'bi bi-star';
      }
      frag.appendChild(U.el('i', { className: cls, aria: { hidden: 'true' } }));
    }
    return frag;
  }

  /* ─────────────────────────────────────────
     NAV BRAND
  ───────────────────────────────────────── */

  function buildNavBrand() {
    var brandEl = document.getElementById('nav-brand-name');
    if (brandEl) brandEl.textContent = DATA.BRAND_NAME;

    var navBrandLink = document.getElementById('nav-brand-link');
    if (navBrandLink) navBrandLink.setAttribute('href', U.sanitizeUrl(buildHomeUrl()));

    var switcherSlot = document.getElementById('lang-switcher-slot');
    if (switcherSlot) {
      while (switcherSlot.firstChild) switcherSlot.removeChild(switcherSlot.firstChild);
      switcherSlot.appendChild(buildLangSwitcher());
    }
  }

  /* ─────────────────────────────────────────
     NAV CURRENT LINK
  ───────────────────────────────────────── */

  function markCurrentNavLink(identifier) {
    if (!identifier) return;
    U.qsa('.nav-link').forEach(function (link) {
      link.removeAttribute('aria-current');
      link.classList.remove('site-nav-active');
    });
    U.qsa('.nav-link').forEach(function (link) {
      var href = link.getAttribute('href') || '';
      var match = false;
      if (identifier === 'home') {
        match = href === buildHomeUrl() ||
                href === PREFIX + '/index.html' ||
                href === '/' ||
                href === './' ||
                href === './index.html' ||
                href === PREFIX + '/';
      } else if (identifier === 'services') {
        match = href.indexOf('services') !== -1;
      } else if (identifier === 'courses') {
        match = href.indexOf('/course') !== -1 && href.indexOf('course-details') === -1;
      } else if (identifier === 'about') {
        match = href.indexOf('about') !== -1;
      }
      if (match) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('site-nav-active');
      }
    });
  }

  /* ─────────────────────────────────────────
     FOOTER
  ───────────────────────────────────────── */

  function buildFooter() {
    var brandEl = document.getElementById('footer-brand-name');
    if (brandEl) brandEl.textContent = DATA.BRAND_NAME;

    var taglineEl = document.getElementById('footer-tagline');
    if (taglineEl) taglineEl.textContent = U.t(META.footerTagline);

    var copyrEl = document.getElementById('footer-copyright');
    if (copyrEl) copyrEl.textContent = buildCopyrightText();

    /* Social media icons */
    buildSocialLinks();

    /* Google Maps embed */
    var mapSlot = document.getElementById('footer-map-slot');
    if (mapSlot && DATA.GOOGLE_MAPS_EMBED) {
      var mapTitle = U.t(META.footerMapTitle) || 'Our Location';
      var mapHeading = U.el('p', {
        className: mapSlot.getAttribute('data-heading-class') || 'footer-col-title',
        textContent: mapTitle
      });

      var mapWrap = U.el('div', {
        className: 'footer-map-wrap'
      });

      var iframe = U.el('iframe', {
        src:       DATA.GOOGLE_MAPS_EMBED,
        className: 'footer-map-iframe',
        width:     '100%',
        height:    '180',
        loading:   'lazy',
        aria:      { hidden: 'true' },
        title:     mapTitle,
        tabindex:  '-1'
      });
      iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
      iframe.setAttribute('allowfullscreen', '');

      var directUrl = U.sanitizeUrl(DATA.GOOGLE_MAPS_DIRECT || DATA.GOOGLE_MAPS_URL || '');
      var mapOverlay = U.el('a', {
        href:      directUrl,
        target:    '_blank',
        rel:       'noopener noreferrer',
        className: 'footer-map-overlay',
        aria:      { label: mapTitle + ' — ' + (IS_AR ? 'افتح في خرائط جوجل' : 'Open in Google Maps') }
      });

      mapWrap.appendChild(iframe);
      mapWrap.appendChild(mapOverlay);
      mapSlot.appendChild(mapHeading);
      mapSlot.appendChild(mapWrap);
    }

    var qlHeading = document.getElementById('footer-heading-quicklinks');
    if (qlHeading) qlHeading.textContent = U.t(META.footerQuickLinks);

    var prodHeading = document.getElementById('footer-heading-products');
    if (prodHeading) prodHeading.textContent = U.t(META.footerProducts);

    var legalHeading = document.getElementById('footer-heading-legal');
    if (legalHeading) legalHeading.textContent = U.t(META.footerLegal);

    var contactHeading = document.getElementById('footer-heading-contact');
    if (contactHeading) contactHeading.textContent = U.t(META.footerContact);

    setTextById('footer-link-home-text', U.t(META.navHome));
    setHrefById('footer-link-home', U.sanitizeUrl(buildHomeUrl()));

    setTextById('footer-link-services-text', U.t(META.navServices));
    setHrefById('footer-link-services', U.sanitizeUrl(buildServicesUrl()));

    setTextById('footer-link-courses-text', U.t(META.navCourses));
    setHrefById('footer-link-courses', U.sanitizeUrl(buildCatalogUrl()));

    setTextById('footer-link-about-text', U.t(META.navAbout));
    setHrefById('footer-link-about', U.sanitizeUrl(buildAboutUrl()));

    setHrefById('footer-link-privacy', U.sanitizeUrl(buildPrivacyUrl()));
    setHrefById('footer-link-terms', U.sanitizeUrl(buildTermsUrl()));

    var privacyLink = document.getElementById('footer-link-privacy');
    if (privacyLink) {
      var pText = privacyLink.querySelector('.footer-link-text');
      if (pText) pText.textContent = U.t(META.privacyPageTitle);
    }

    var termsLink = document.getElementById('footer-link-terms');
    if (termsLink) {
      var tText = termsLink.querySelector('.footer-link-text');
      if (tText) tText.textContent = U.t(META.termsPageTitle);
    }
  }

  function buildFooterCategories() {
    var list = document.getElementById('footer-categories');
    if (!list) return;
    while (list.firstChild) list.removeChild(list.firstChild);
    var catMap = getCategoriesWithCount();
    var frag = document.createDocumentFragment();
    Object.keys(catMap).forEach(function (key) {
      var label = getCategoryLabel(key);
      var li = U.el('li', null, [
        U.el('a', {
          href: U.sanitizeUrl(buildCatalogUrl(key)),
          textContent: label
        })
      ]);
      frag.appendChild(li);
    });
    list.appendChild(frag);
  }

  /* ─────────────────────────────────────────
     WHATSAPP / EMAIL LINKS
  ───────────────────────────────────────── */

  function buildWhatsAppLinks() {
    var url = U.sanitizeUrl(getDefaultWhatsAppUrl());
    var ids = ['cta-whatsapp-btn', 'footer-whatsapp-link', 'footer-whatsapp-link-2', 'contact-whatsapp-link'];
    ids.forEach(function (id) {
      var node = document.getElementById(id);
      if (node) node.href = url;
    });
  }

  function buildSocialLinks() {
    var slot = document.getElementById('footer-social-links');
    if (!slot) return;

    var links = [
      { url: 'https://www.youtube.com/@ai8vcom',    icon: 'bi-youtube',   label: 'YouTube' },
      { url: 'https://www.facebook.com/ai8vcom/',   icon: 'bi-facebook',  label: 'Facebook' },
      { url: 'https://www.instagram.com/ai8vcom/',  icon: 'bi-instagram', label: 'Instagram' }
    ];

    var frag = document.createDocumentFragment();
    links.forEach(function (item) {
      var a = U.el('a', {
        href:      U.sanitizeUrl(item.url),
        target:    '_blank',
        rel:       'noopener noreferrer',
        className: 'footer-social-icon',
        aria:      { label: item.label }
      }, [
        U.el('i', { className: 'bi ' + item.icon, aria: { hidden: 'true' } })
      ]);
      frag.appendChild(a);
    });
    slot.appendChild(frag);
  }

  function buildEmailLinks() {
    var email = META.supportEmail;
    var mailto = U.sanitizeUrl('mailto:' + email);
    var ids = ['footer-email-link', 'contact-email-link'];
    ids.forEach(function (id) {
      var node = document.getElementById(id);
      if (node) {
        node.href = mailto;
        var textEl = node.querySelector('.email-text');
        if (textEl) textEl.textContent = email;
      }
    });
  }

  function buildInlineBrandDomain() {
    var count = 10;
    for (var i = 1; i <= count; i++) {
      var brandNode = document.getElementById('brand-inline-' + i);
      if (brandNode) brandNode.textContent = DATA.BRAND_NAME;
      var domainNode = document.getElementById('domain-inline-' + i);
      if (domainNode) domainNode.textContent = DATA.DOMAIN;
    }
  }

  /* ─────────────────────────────────────────
     SEO INJECTION
  ───────────────────────────────────────── */

  function injectBaseSEO(config) {
    var title       = config.title || '';
    var description = config.description || '';
    var url         = config.url || getCurrentAbsoluteUrl();
    var image       = config.image || (BASE + META.ogImage);
    var siteName    = DATA.BRAND_NAME;

    document.title = title;

    setAttrById('page-desc', 'content', description);
    setAttrById('page-canonical', 'href', url);

    setAttrById('og-url',       'content', url);
    setAttrById('og-title',     'content', title);
    setAttrById('og-desc',      'content', description);
    setAttrById('og-image',     'content', image);
    setAttrById('og-site-name', 'content', siteName);

    setAttrById('tw-title', 'content', title);
    setAttrById('tw-desc',  'content', description);
    setAttrById('tw-image', 'content', image);

    var currentAbsolute = getCurrentAbsoluteUrl();
    var altAbsolute = getAlternateAbsoluteUrl();

    var enUrl = IS_AR ? altAbsolute : currentAbsolute;
    var arUrl = IS_AR ? currentAbsolute : altAbsolute;

    setAttrById('hreflang-en', 'href', enUrl);
    setAttrById('hreflang-ar', 'href', arUrl);
    setAttrById('hreflang-default', 'href', enUrl);
  }

  function injectJsonLd(schema) {
    if (!schema) return;
    var script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema, null, 2);
    document.head.appendChild(script);
  }

  function injectOrganizationSchema() {
    var schema = {
      '@context': 'https://schema.org',
      '@type':    ['Organization', 'SoftwareCompany'],
      '@id':      BASE + '/#organization',
      'name':     'Ai8V',
      'alternateName': 'Artificial Intelligence Eight Vectors',
      'url':      BASE,
      'logo':     BASE + (META.logoPath || '/assets/img/fav180.png'),
      'description': U.t(META.description),
      'foundingDate': META.foundingYear,
      'sameAs':   DATA.SOCIAL_LINKS || [],
      'contactPoint': {
        '@type':             'ContactPoint',
        'contactType':       'customer support',
        'telephone':         '+' + DATA.WHATSAPP_NUMBER,
        'email':             META.supportEmail,
        'availableLanguage': ['English', 'Arabic']
      },
      'address': {
        '@type':          'PostalAddress',
        'addressCountry': 'EG'
      },
      'geo': {
        '@type':     'GeoCoordinates',
        'latitude':  '30.7798632',
        'longitude': '30.9936147'
      },
      'hasMap': DATA.GOOGLE_MAPS_URL || ''
    };
    injectJsonLd(schema);
  }

  function setNoIndex() {
    var robots = document.querySelector('meta[name="robots"]');
    if (robots) {
      robots.setAttribute('content', 'noindex, nofollow');
    }
  }

  /* ─────────────────────────────────────────
     TOC SCROLL (legal pages)
  ───────────────────────────────────────── */

  function initTocScroll(tocSelector) {
    var tocNav = U.qs(tocSelector);
    if (!tocNav) return;

    var links = U.qsa('a', tocNav);
    if (!links.length) return;

    links.forEach(function (link) {
      link.addEventListener('click', function (e) {
        var href = link.getAttribute('href');
        if (!href || href.charAt(0) !== '#') return;
        e.preventDefault();
        var target = document.getElementById(href.substring(1));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
        }
      });
    });

    var sections = links.map(function (link) {
      var href = link.getAttribute('href');
      if (!href || href.charAt(0) !== '#') return null;
      return document.getElementById(href.substring(1));
    }).filter(Boolean);

    var onScroll = U.throttle(function () {
      var scrollY = window.scrollY || window.pageYOffset;
      var active = null;

      for (var i = sections.length - 1; i >= 0; i--) {
        if (sections[i].offsetTop <= scrollY + 120) {
          active = sections[i];
          break;
        }
      }

      links.forEach(function (link) {
        link.classList.remove('legal-toc-active');
        link.removeAttribute('aria-current');
      });

      if (active) {
        var activeLink = tocNav.querySelector('a[href="#' + active.id + '"]');
        if (activeLink) {
          activeLink.classList.add('legal-toc-active');
          activeLink.setAttribute('aria-current', 'true');
        }
      }
    }, 150);

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ─────────────────────────────────────────
     EXPORT (frozen)
  ───────────────────────────────────────── */

  return Object.freeze({
    setTextById:           setTextById,
    setHrefById:           setHrefById,
    setAttrById:           setAttrById,

    buildWhatsAppUrl:      buildWhatsAppUrl,
    buildCatalogUrl:       buildCatalogUrl,
    buildCourseUrl:        buildCourseUrl,
    buildHomeUrl:          buildHomeUrl,
    buildAboutUrl:         buildAboutUrl,
    buildServicesUrl:      buildServicesUrl,
    buildPrivacyUrl:       buildPrivacyUrl,
    buildTermsUrl:         buildTermsUrl,
    getDefaultWhatsAppUrl: getDefaultWhatsAppUrl,
    getWhatsAppMessage:    getWhatsAppMessage,

    getAlternateUrl:       getAlternateUrl,
    getAlternateAbsoluteUrl: getAlternateAbsoluteUrl,
    getCurrentAbsoluteUrl: getCurrentAbsoluteUrl,
    buildLangSwitcher:     buildLangSwitcher,
    getPageLang:           getPageLang,

    formatPrice:           formatPrice,
    buildCopyrightText:    buildCopyrightText,

    getCourseField:        getCourseField,
    getCategoriesWithCount:getCategoriesWithCount,
    getCategoryLabel:      getCategoryLabel,
    getLevelLabel:          getLevelLabel,

    buildStarFragment:     buildStarFragment,

    buildNavBrand:         buildNavBrand,
    markCurrentNavLink:    markCurrentNavLink,
    buildFooter:           buildFooter,
    buildFooterCategories: buildFooterCategories,
    buildWhatsAppLinks:    buildWhatsAppLinks,
    buildSocialLinks:      buildSocialLinks,
    buildEmailLinks:       buildEmailLinks,
    buildInlineBrandDomain:buildInlineBrandDomain,

    injectBaseSEO:              injectBaseSEO,
    injectJsonLd:               injectJsonLd,
    injectOrganizationSchema:   injectOrganizationSchema,
    setNoIndex:                 setNoIndex,

    initTocScroll:         initTocScroll
  });

})();

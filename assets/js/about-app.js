'use strict';

/* ═══════════════════════════════════════════════════════════════
   about-app.js — Logic for about.html
   Depends on: Utils (utils.js), COURSE_DATA (courses-data.js),
               SharedPage (shared-page.js)
   NO innerHTML for dynamic content — DOM API only.
   ═══════════════════════════════════════════════════════════════ */

(function () {

  /* ─────────────────────────────────────────
     ALIASES + GUARD CLAUSE
  ───────────────────────────────────────── */

  var U    = window.Utils;
  var DATA = window.COURSE_DATA;
  var SP   = window.SharedPage;

  if (!U || !DATA || !SP) {
    console.error('about-app: dependencies missing.');
    return;
  }

  var META = DATA.META;

  /* ─────────────────────────────────────────
     SEO INJECTION
  ───────────────────────────────────────── */

  function injectSEO() {
    var brand   = DATA.BRAND_NAME;
    var base    = 'https://' + DATA.DOMAIN;

    var pageTitle = U.t(META.aboutPageTitle) + ' \u2014 ' + brand;
    var pageDesc  = U.t(META.descriptionShort) + ' \u2014 ' + brand;

    SP.injectBaseSEO({
      title:       pageTitle,
      description: pageDesc,
      url:         SP.getCurrentAbsoluteUrl(),
      image:       base + META.ogImage
    });

    var schema = {
      '@context': 'https://schema.org',
      '@type':       'WebPage',
      '@id':         SP.getCurrentAbsoluteUrl() + '#webpage',
      'url':         SP.getCurrentAbsoluteUrl(),
      'name':        pageTitle,
      'description': pageDesc,
      'isPartOf':    { '@id': base + '/#website' },
      'about':       { '@id': base + '/#organization' },
      'inLanguage':  U.getLang() === 'ar' ? 'ar' : 'en'
    };

    SP.injectJsonLd(schema);
    SP.injectOrganizationSchema();

    SP.markCurrentNavLink('about');
  }

  /* ─────────────────────────────────────────
     BUILDERS
  ───────────────────────────────────────── */

  function buildInlineBrands() {
    SP.buildInlineBrandDomain();
  }

  /* ─────────────────────────────────────────
     INIT
  ───────────────────────────────────────── */

  function init() {
    injectSEO();
    SP.buildNavBrand();
    buildInlineBrands();
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

'use strict';

/* ═══════════════════════════════════════════════════════════════
   legal-app.js — Shared logic for legal/privacy.html
                  and legal/terms.html
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
    console.error('legal-app: dependencies missing.');
    return;
  }

  var META = DATA.META;

  /* ─────────────────────────────────────────
     PAGE DETECTION
  ───────────────────────────────────────── */

  var isTerms = window.location.pathname.indexOf('terms') !== -1;

  /* ─────────────────────────────────────────
     SEO INJECTION
  ───────────────────────────────────────── */

  function injectSEO() {
    var brand = DATA.BRAND_NAME;
    var base  = 'https://' + DATA.DOMAIN;

    var pageTitle, pageDesc;

    if (isTerms) {
      pageTitle = U.t(META.termsPageTitle) + ' \u2014 ' + brand;
      pageDesc  = U.t(META.descriptionShort) + ' \u2014 ' + U.t(META.termsPageTitle);
    } else {
      pageTitle = U.t(META.privacyPageTitle) + ' \u2014 ' + brand;
      pageDesc  = U.t(META.descriptionShort) + ' \u2014 ' + U.t(META.privacyPageTitle);
    }

    SP.injectBaseSEO({
      title:       pageTitle,
      description: pageDesc,
      url:         SP.getCurrentAbsoluteUrl(),
      image:       base + META.ogImage
    });

    var schema = {
      '@context':     'https://schema.org',
      '@type':        'WebPage',
      '@id':          SP.getCurrentAbsoluteUrl() + '#webpage',
      'url':          SP.getCurrentAbsoluteUrl(),
      'name':         pageTitle,
      'description':  pageDesc,
      'isPartOf':     { '@id': base + '/#website' },
      'inLanguage':   U.getLang() === 'ar' ? 'ar' : 'en',
      'dateModified': META.legalLastUpdated || '2026-02-20'
    };

    SP.injectJsonLd(schema);
    SP.injectOrganizationSchema();
  }

  /* ─────────────────────────────────────────
     FOOTER ACTIVE STATE
  ───────────────────────────────────────── */

  function markFooterActive() {
    var linkId = isTerms ? 'footer-link-terms' : 'footer-link-privacy';
    var el = document.getElementById(linkId);
    if (el) {
      el.setAttribute('aria-current', 'page');
      el.classList.add('footer-link-active');
    }
  }

  /* ─────────────────────────────────────────
     INIT
  ───────────────────────────────────────── */

  function populateLegalInlines() {
    var domain = DATA.DOMAIN;
    var base   = 'https://' + domain;

    var domainInline = document.getElementById('legal-domain-inline');
    if (domainInline) domainInline.textContent = domain;

    var domainLink = document.getElementById('domain-link');
    if (domainLink) {
      domainLink.href = U.sanitizeUrl(base);
      domainLink.textContent = domain;
    }

    var termsUrlLink = document.getElementById('terms-url-link');
    if (termsUrlLink) {
      var termsUrl = base + SP.buildTermsUrl();
      termsUrlLink.href = U.sanitizeUrl(termsUrl);
      termsUrlLink.textContent = termsUrl;
    }
  }

  function init() {
    injectSEO();
    SP.buildNavBrand();
    SP.buildInlineBrandDomain();
    populateLegalInlines();
    SP.buildEmailLinks();
    SP.buildWhatsAppLinks();
    SP.buildFooter();
    SP.buildFooterCategories();
    markFooterActive();
    SP.initTocScroll('.legal-toc');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

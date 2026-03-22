'use strict';

/* ═══════════════════════════════════════════════════════════════
   course-details-app.js — Logic for course/course-details/index.html
   Depends on: Utils, COURSE_DATA, SharedPage, RatingSystem (optional)
   Fully JS-rendered page. NO innerHTML except clearing containers.
   ═══════════════════════════════════════════════════════════════ */

(function () {

  var U    = window.Utils;
  var DATA = window.COURSE_DATA;
  var SP   = window.SharedPage;

  if (!U || !DATA || !SP) {
    console.error('course-details-app: dependencies missing.');
    return;
  }

  var RS   = window.RatingSystem || null;
  var META = DATA.META;

  /* ── Chat Config (bilingual via U.t) ── */

  var CHAT_CONFIG = {
    maxMessageLen: 500,
    maxHistory:    20,
    storagePrefix: 'ai8v_chat_'
  };

  /* ── Chat State ── */

  var chatState = {
    isOpen:  false,
    sending: false
  };

  /* ── Course Lookup ── */

  function getCourseIdFromURL() {
    var params  = new URLSearchParams(window.location.search);
    var raw     = params.get('id');
    if (!raw) return null;
    var trimmed = raw.trim();
    if (!trimmed || !/^\d+$/.test(trimmed)) return null;
    var id = parseInt(trimmed, 10);
    return id >= 1 ? id : null;
  }

  function findCourse(id) {
    for (var i = 0; i < DATA.courses.length; i++) {
      if (DATA.courses[i].id === id) return DATA.courses[i];
    }
    return null;
  }

  /* ── SEO Injection ── */

  function injectSEO(course) {
    var brand     = DATA.BRAND_NAME;
    var base      = 'https://' + DATA.DOMAIN;
    var title     = SP.getCourseField(course, 'title');
    var desc      = SP.getCourseField(course, 'description');
    var pageTitle = title + ' \u2014 ' + brand;
    var pageDesc  = desc + ' ' + U.t(META.descriptionShort);
    var pageImage = base + '/assets/img/' + course.image;

    SP.injectBaseSEO({
      title:       pageTitle,
      description: pageDesc,
      url:         SP.getCurrentAbsoluteUrl(),
      image:       pageImage
    });

    var schema = {
      '@context': 'https://schema.org',
      '@type':    'Course',
      'name':     title,
      'description': desc,
      'url':      SP.getCurrentAbsoluteUrl(),
      'provider': {
        '@type': 'Organization',
        'name':  brand,
        'url':   base
      },
      'educationalLevel': course.level,
      'inLanguage':       U.getLang() === 'ar' ? 'ar' : 'en',
      'offers': {
        '@type':         'Offer',
        'price':         course.price,
        'priceCurrency': 'USD',
        'availability':  'https://schema.org/InStock'
      }
    };

    var script       = document.createElement('script');
    script.type      = 'application/ld+json';
    script.id        = 'jsonld-seo-course';
    script.textContent = JSON.stringify(schema, null, 2);
    document.head.appendChild(script);

    SP.injectOrganizationSchema();
  }


  /* ── JSON-LD (BreadcrumbList + FAQPage) ── */

  function buildSchema(course) {
    var base    = 'https://' + DATA.DOMAIN;
    var title   = SP.getCourseField(course, 'title');
    var faq     = SP.getCourseField(course, 'faq');
    var schemas = [];

    schemas.push({
      '@context':   'https://schema.org',
      '@type':      'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1,
          'name': U.t(META.breadcrumbHome), 'item': base + SP.buildHomeUrl() },
        { '@type': 'ListItem', 'position': 2,
          'name': U.t(META.breadcrumbCourses), 'item': base + SP.buildCatalogUrl() },
        { '@type': 'ListItem', 'position': 3,
          'name': title, 'item': SP.getCurrentAbsoluteUrl() }
      ]
    });

    if (faq && faq.length > 0) {
      schemas.push({
        '@context':   'https://schema.org',
        '@type':      'FAQPage',
        'mainEntity': faq.map(function (item) {
          return {
            '@type': 'Question',
            'name':  item.question,
            'acceptedAnswer': { '@type': 'Answer', 'text': item.answer }
          };
        })
      });
    }

    schemas.forEach(function (schema, idx) {
      var el         = document.createElement('script');
      el.type        = 'application/ld+json';
      el.id          = 'jsonld-details-' + idx;
      el.textContent = JSON.stringify(schema);
      document.head.appendChild(el);
    });
  }

  function addRatingToSchema(average, count) {
    var el = document.getElementById('jsonld-seo-course');
    if (!el) return;
    try {
      var schema = JSON.parse(el.textContent);
      schema.aggregateRating = {
        '@type':       'AggregateRating',
        'ratingValue': average.toFixed(1),
        'bestRating':  '5',
        'worstRating': '1',
        'ratingCount': String(count)
      };
      el.textContent = JSON.stringify(schema);
    } catch (e) {}
  }

  /* ── WhatsApp Link ── */

  function buildWhatsAppLink(course) {
    var phone   = DATA.WHATSAPP_NUMBER || '';
    var title   = SP.getCourseField(course, 'title');
    var converted = Math.round(course.price * (U.t(META.currencyRate) || 1));
    var symbol  = U.t(META.currencyLabel);
    var price   = course.price > 0
      ? (U.getLang() === 'ar' ? U.formatNumberByLang(converted) + ' ' + symbol : '$' + course.price.toFixed(2))
      : U.t(META.freeLabel);
    var template = U.t(META.whatsappBuyTemplate);
    var message  = template.replace('{title}', title).replace('{price}', price);
    return 'https://wa.me/' + phone + '?text=' + encodeURIComponent(message);
  }

  /* ── Error Page ── */

  function renderError(container) {
    document.title = U.t(META.errorTitle) + ' | ' + DATA.BRAND_NAME;
    SP.setNoIndex();
    container.appendChild(
      U.el('div', { className: 'error-container' }, [
        U.el('i',  { className: 'bi bi-exclamation-triangle error-icon', aria: { hidden: 'true' } }),
        U.el('h1', { className: 'error-title', textContent: U.t(META.errorTitle) }),
        U.el('p',  { className: 'error-text',  textContent: U.t(META.errorText) }),
        U.el('a',  { className: 'error-btn', href: U.sanitizeUrl(SP.buildCatalogUrl()) }, [
          U.el('i', { className: U.getLang() === 'ar' ? 'bi bi-arrow-right' : 'bi bi-arrow-left', aria: { hidden: 'true' } }),
          U.t(META.errorBrowse)
        ])
      ])
    );
  }

  /* ── Breadcrumb ── */

  function buildBreadcrumb(course) {
    var title = SP.getCourseField(course, 'title');
    var ol = U.el('ol', { className: 'breadcrumb' });

    var li1 = U.el('li', { className: 'breadcrumb-item' });
    li1.appendChild(U.el('a', { href: U.sanitizeUrl(SP.buildHomeUrl()), textContent: U.t(META.breadcrumbHome) }));
    ol.appendChild(li1);

    var li2 = U.el('li', { className: 'breadcrumb-item' });
    li2.appendChild(U.el('a', { href: U.sanitizeUrl(SP.buildCatalogUrl()), textContent: U.t(META.breadcrumbCourses) }));
    ol.appendChild(li2);

    var li3 = U.el('li', { className: 'breadcrumb-item active', aria: { current: 'page' } });
    li3.appendChild(U.el('span', { textContent: title }));
    ol.appendChild(li3);

    return U.el('nav', { className: 'breadcrumb-nav', aria: { label: U.getLang() === 'ar' ? '\u0645\u0633\u0627\u0631 \u0627\u0644\u062a\u0646\u0642\u0644' : 'Breadcrumb' } }, [ol]);
  }

  /* ── Header ── */

  function buildHeader(course) {
    var title = SP.getCourseField(course, 'title');

    var backArrow = U.getLang() === 'ar' ? 'bi bi-arrow-right' : 'bi bi-arrow-left';
    var headerInner = U.el('div', { className: 'page-container' }, [
      U.el('a', { className: 'back-link', href: U.sanitizeUrl(SP.buildCatalogUrl()) }, [
        U.el('i', { className: backArrow, aria: { hidden: 'true' } }),
        U.t(META.backToCourses)
      ]),
      buildBreadcrumb(course),
      U.el('h1', { className: 'page-title', textContent: title })
    ]);

    var langSlot = U.el('div', { className: 'page-header-lang' });
    langSlot.appendChild(SP.buildLangSwitcher());
    headerInner.insertBefore(langSlot, headerInner.lastChild);

    return U.el('header', { className: 'details-header' }, [headerInner]);
  }

  /* ── Section Title Helper ── */

  function _buildSectionTitle(iconClass, titleText) {
    return U.el('h2', { className: 'details-section-title' }, [
      U.el('i', { className: iconClass, aria: { hidden: 'true' } }),
      titleText
    ]);
  }

  /* ── Learning Objectives ── */

  function buildObjectives(course) {
    var objectives = SP.getCourseField(course, 'learningObjectives');
    if (!objectives || !objectives.length) return null;

    var list = U.el('ul', { className: 'objectives-list' });
    objectives.forEach(function (obj) {
      list.appendChild(U.el('li', null, [
        U.el('i',    { className: 'bi bi-check-circle-fill obj-icon', aria: { hidden: 'true' } }),
        U.el('span', { textContent: obj })
      ]));
    });

    return U.el('section', { className: 'details-section', aria: { label: U.t(META.sectionObjectives) } }, [
      _buildSectionTitle('bi bi-lightbulb', U.t(META.sectionObjectives)),
      list
    ]);
  }

  /* ── Curriculum ── */

  function buildCurriculum(course) {
    var curriculum = SP.getCourseField(course, 'curriculum');
    if (!curriculum || !curriculum.length) return null;

    var totalLessons     = 0;
    var totalDurationSec = 0;

    curriculum.forEach(function (section) {
      if (!section.lessons) return;
      totalLessons += section.lessons.length;
      section.lessons.forEach(function (lesson) {
        if (!lesson.duration) return;
        var parts = lesson.duration.split(':');
        totalDurationSec += (parseInt(parts[0], 10) || 0) * 60 + (parseInt(parts[1], 10) || 0);
      });
    });

    var totalHours   = Math.floor(totalDurationSec / 3600);
    var totalMins    = Math.ceil((totalDurationSec % 3600) / 60);
    var durationText = (totalHours > 0 ? totalHours + 'h ' : '') + totalMins + 'm';
    var lessonsText  = U.t(META.lessonsLabel).replace('{n}', String(totalLessons));

    var sectionsWord = U.getLang() === 'ar' ? '\u0623\u0642\u0633\u0627\u0645' : 'sections';
    var summaryLine = U.el('p', {
      className:   'curriculum-summary mb-3',
      textContent: U.formatNumberByLang(curriculum.length) + ' ' + sectionsWord + ' \u2022 ' + lessonsText + ' \u2022 ' + durationText
    });

    var accordion = U.el('div', { className: 'accordion curriculum-accordion', id: 'curriculum-accordion' });

    curriculum.forEach(function (section, sIdx) {
      var headerId = 'curr-head-' + sIdx;
      var bodyId   = 'curr-body-' + sIdx;

      var sectionLessons = section.lessons ? section.lessons.length : 0;
      var sectionDurSec  = 0;
      if (section.lessons) {
        section.lessons.forEach(function (l) {
          if (!l.duration) return;
          var p = l.duration.split(':');
          sectionDurSec += (parseInt(p[0], 10) || 0) * 60 + (parseInt(p[1], 10) || 0);
        });
      }
      var sectionDurMin   = Math.ceil(sectionDurSec / 60);
      var minWord = U.getLang() === 'ar' ? '\u062f\u0642\u064a\u0642\u0629' : 'min';
      var sectionMetaText = U.t(META.lessonsLabel).replace('{n}', String(sectionLessons)) + ' \u2022 ' + U.formatNumberByLang(sectionDurMin) + ' ' + minWord;

      var btn = U.el('button', {
        className: 'accordion-button' + (sIdx === 0 ? '' : ' collapsed'),
        type:      'button',
        data:      { bsToggle: 'collapse', bsTarget: '#' + bodyId },
        aria:      { expanded: sIdx === 0 ? 'true' : 'false', controls: bodyId }
      });
      btn.appendChild(U.el('span', { className: 'curriculum-section-title', textContent: section.title }));
      btn.appendChild(U.el('span', { className: 'curriculum-section-meta', textContent: sectionMetaText }));

      var header = U.el('h3', { className: 'accordion-header', id: headerId });
      header.appendChild(btn);

      var lessonList = U.el('ul', { className: 'lesson-list' });

      if (section.lessons) {
        section.lessons.forEach(function (lesson) {
          var iconClass = lesson.preview ? 'bi bi-play-circle-fill' : 'bi bi-lock-fill';
          var metaEl    = U.el('div', { className: 'lesson-meta' });
          if (lesson.duration) {
            metaEl.appendChild(U.el('span', { className: 'lesson-duration', textContent: lesson.duration }));
          }
          if (lesson.preview) {
            metaEl.appendChild(U.el('span', { className: 'lesson-preview-badge', textContent: U.t(META.previewLabel) }));
          }
          lessonList.appendChild(U.el('li', { className: 'lesson-item' }, [
            U.el('i',    { className: iconClass + ' lesson-icon', aria: { hidden: 'true' } }),
            U.el('span', { className: 'lesson-title', textContent: lesson.title }),
            metaEl
          ]));
        });
      }

      var bodyContent = U.el('div', {
        className: 'accordion-collapse collapse' + (sIdx === 0 ? ' show' : ''),
        id:        bodyId,
        aria:      { labelledby: headerId },
        data:      { bsParent: '#curriculum-accordion' }
      });
      bodyContent.appendChild(U.el('div', { className: 'accordion-body' }, [lessonList]));

      var item = U.el('div', { className: 'accordion-item' });
      item.appendChild(header);
      item.appendChild(bodyContent);
      accordion.appendChild(item);
    });

    return U.el('section', { className: 'details-section', aria: { label: U.t(META.sectionCurriculum) } }, [
      _buildSectionTitle('bi bi-journal-text', U.t(META.sectionCurriculum)),
      summaryLine,
      accordion
    ]);
  }

  /* ── FAQ ── */

  function buildFAQ(course) {
    var faq = SP.getCourseField(course, 'faq');
    if (!faq || !faq.length) return null;

    var accordion = U.el('div', { className: 'accordion faq-accordion', id: 'faq-accordion' });

    faq.forEach(function (item, idx) {
      var headerId = 'faq-head-' + idx;
      var bodyId   = 'faq-body-' + idx;

      var btn = U.el('button', {
        className:   'accordion-button collapsed',
        type:        'button',
        textContent: item.question,
        data:        { bsToggle: 'collapse', bsTarget: '#' + bodyId },
        aria:        { expanded: 'false', controls: bodyId }
      });

      var hdr = U.el('h3', { className: 'accordion-header', id: headerId });
      hdr.appendChild(btn);

      var body = U.el('div', {
        className: 'accordion-collapse collapse',
        id:        bodyId,
        aria:      { labelledby: headerId },
        data:      { bsParent: '#faq-accordion' }
      });
      body.appendChild(U.el('div', { className: 'accordion-body', textContent: item.answer }));

      var accItem = U.el('div', { className: 'accordion-item' });
      accItem.appendChild(hdr);
      accItem.appendChild(body);
      accordion.appendChild(accItem);
    });

    return U.el('section', { className: 'details-section', aria: { label: U.t(META.sectionFaq) } }, [
      _buildSectionTitle('bi bi-question-circle', U.t(META.sectionFaq)),
      accordion
    ]);
  }

  /* ── Price Display Builder ── */

  function _convertPrice(usdPrice) {
    var rate = U.t(META.currencyRate) || 1;
    return Math.round(usdPrice * rate);
  }

  function _formatPriceWithSymbol(amount) {
    var symbol = U.t(META.currencyLabel);
    var formatted = U.formatNumberByLang(amount);
    if (U.getLang() === 'ar') {
      return formatted + ' ' + symbol;
    }
    return symbol + formatted;
  }

  function _buildPriceDisplay(course) {
    var isFree = parseFloat(course.price) === 0;

    if (isFree) {
      return U.el('div', { className: 'price-display' }, [
        U.el('span', { className: 'price-current free', textContent: U.t(META.freeLabel) })
      ]);
    }

    var currentUSD    = parseFloat(course.price);
    var originalUSD   = parseFloat(course.originalPrice) || 0;
    var currentPrice  = _convertPrice(currentUSD);
    var originalPrice = _convertPrice(originalUSD);
    var hasDiscount   = originalPrice > currentPrice && currentPrice > 0;
    var symbol        = U.t(META.currencyLabel);

    if (!hasDiscount) {
      var priceText = _formatPriceWithSymbol(currentPrice);
      return U.el('div', {
        className: 'price-display',
        aria:      { label: (U.getLang() === 'ar' ? '\u0627\u0644\u0633\u0639\u0631: ' : 'Price: ') + priceText }
      }, [
        U.el('span', { className: 'price-current', textContent: priceText, aria: { hidden: 'true' } })
      ]);
    }

    var discountPercent = Math.round((1 - currentPrice / originalPrice) * 100);
    var savedAmount     = originalPrice - currentPrice;
    var savedText       = _formatPriceWithSymbol(savedAmount);
    var discountText    = U.t(META.discountLabel)
      .replace('{pct}', String(discountPercent))
      .replace('{amount}', savedText);

    var currentText  = _formatPriceWithSymbol(currentPrice);
    var originalText = _formatPriceWithSymbol(originalPrice);

    var ariaText = (U.getLang() === 'ar' ? '\u0627\u0644\u0633\u0639\u0631 \u0627\u0644\u0623\u0635\u0644\u064a ' : 'Original price ') +
                   originalText +
                   (U.getLang() === 'ar' ? '\u060c \u0627\u0644\u0622\u0646 ' : ', now ') +
                   currentText;

    return U.el('div', { className: 'price-display', aria: { label: ariaText } }, [
      U.el('span', { className: 'price-original', textContent: originalText, aria: { hidden: 'true' } }),
      U.el('span', { className: 'price-current',  textContent: currentText,  aria: { hidden: 'true' } }),
      U.el('span', { className: 'price-discount', aria: { hidden: 'true' } }, [
        discountText
      ])
    ]);
  }

  /* ── Sidebar Card ── */

  function buildSidebarCard(course) {
    var title = SP.getCourseField(course, 'title');

    var img = U.el('img', {
      className: 'sidebar-course-img',
      src:       '/assets/img/' + course.image,
      alt:       title,
      loading:   'eager',
      decoding:  'async',
      width:     '400',
      height:    '225'
    });

    var priceEl = _buildPriceDisplay(course);
    var isFree  = parseFloat(course.price) === 0;
    var buttonsWrapper = U.el('div', { className: 'sidebar-buttons' });

    if (isFree) {
      var driveUrl = U.sanitizeUrl(course.driveUrl || '');
      buttonsWrapper.appendChild(
        U.el('a', {
          className: 'btn-buy',
          href:      driveUrl || '#',
          target:    driveUrl ? '_blank' : '_self',
          rel:       'noopener noreferrer',
          aria:      { label: U.t(META.startLearning) + ' ' + title }
        }, [
          U.el('i', { className: 'bi bi-play-circle-fill', aria: { hidden: 'true' } }),
          ' ' + U.t(META.startLearning)
        ])
      );
    } else {
      var waLink = U.sanitizeUrl(buildWhatsAppLink(course));
      var btnPrice = _formatPriceWithSymbol(_convertPrice(parseFloat(course.price)));
      buttonsWrapper.appendChild(
        U.el('a', {
          className: 'btn-buy',
          href:      waLink,
          target:    '_blank',
          rel:       'noopener noreferrer',
          aria:      { label: U.t(META.buyCourse) + ' ' + title + ' ' + btnPrice }
        }, [
          U.el('i', { className: 'bi bi-whatsapp', aria: { hidden: 'true' } }),
          ' ' + U.t(META.buyCourse) + ' \u2014 ' + btnPrice
        ])
      );

      buttonsWrapper.appendChild(
        U.el('a', {
          className: 'btn-enter-course',
          href:      U.sanitizeUrl('/course/paid/' + course.id),
          aria:      { label: U.t(META.enterCourse) }
        }, [
          U.el('i', { className: 'bi bi-box-arrow-in-right', aria: { hidden: 'true' } }),
          ' ' + U.t(META.enterCourse)
        ])
      );
    }

    var metaList = U.el('ul', { className: 'course-meta-list' });
    metaList.appendChild(_buildMetaItem('bi-person-fill',    U.getLang() === 'ar' ? '\u0627\u0644\u0645\u062f\u0631\u0633' : 'Instructor', SP.getCourseField(course, 'instructor')));
    metaList.appendChild(_buildMetaItem('bi-tag-fill',       U.t(META.categoryLabel), SP.getCategoryLabel(course.category)));
    metaList.appendChild(_buildMetaItem('bi-bar-chart-fill', U.t(META.metaLevel),     SP.getLevelLabel(course.level)));
    metaList.appendChild(_buildMetaItem('bi-people-fill',    U.t(META.metaStudents),  U.formatNumberByLang(course.students)));
    metaList.appendChild(_buildMetaItem('bi-book-fill',      U.t(META.metaLessons),   String(course.lessons)));

    var ratingMetaValue = U.el('span', { className: 'meta-value', id: 'meta-rating-value' });
    var ratingInline    = U.el('span', { className: 'meta-rating-inline' });
    if (RS) ratingInline.appendChild(RS.renderStars(course.rating, false));
    ratingInline.appendChild(U.el('span', { textContent: ' ' + (course.rating || 0).toFixed(1) }));
    ratingMetaValue.appendChild(ratingInline);

    metaList.appendChild(U.el('li', { className: 'course-meta-item' }, [
      U.el('span', { className: 'meta-label' }, [
        U.el('i', { className: 'bi bi-star-fill', aria: { hidden: 'true' } }),
        U.t(META.ratingLabel)
      ]),
      ratingMetaValue
    ]));

    metaList.appendChild(_buildMetaItem('bi-calendar3', U.getLang() === 'ar' ? '\u0622\u062e\u0631 \u062a\u062d\u062f\u064a\u062b' : 'Updated', _formatDate(course.date)));

    var content = U.el('div', { className: 'sidebar-content' }, [priceEl, buttonsWrapper, metaList]);
    return U.el('div', { className: 'sidebar-card' }, [img, content]);
  }

  function _buildMetaItem(icon, label, value) {
    return U.el('li', { className: 'course-meta-item' }, [
      U.el('span', { className: 'meta-label' }, [
        U.el('i', { className: 'bi ' + icon, aria: { hidden: 'true' } }),
        label
      ]),
      U.el('span', { className: 'meta-value', textContent: value })
    ]);
  }

  function _formatDate(dateStr) {
    try {
      var locale = U.getLang() === 'ar' ? 'ar-EG' : 'en-US';
      return new Date(dateStr).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) { return dateStr; }
  }

  /* ── Rating Card ── */

  function buildRatingCard(course) {
    var card = U.el('div', { className: 'rating-card', id: 'rating-card' });

    card.appendChild(U.el('h3', { className: 'rating-card-title',    textContent: U.t(META.ratingTitle) }));
    card.appendChild(U.el('p',  { className: 'rating-card-subtitle', textContent: U.getLang() === 'ar' ? '\u0634\u0627\u0631\u0643 \u062a\u062c\u0631\u0628\u062a\u0643 \u0645\u0639 \u0627\u0644\u0637\u0644\u0627\u0628 \u0627\u0644\u0622\u062e\u0631\u064a\u0646' : 'Share your experience with other students' }));

    card.appendChild(U.el('div', { className: 'rating-big-number', id: 'rating-big-number', textContent: '\u2014' }));

    var displayStarsContainer = U.el('div', { id: 'rating-display-stars' });
    if (RS) displayStarsContainer.appendChild(RS.renderStars(0, false));
    card.appendChild(displayStarsContainer);

    card.appendChild(U.el('p', { className: 'rating-count', id: 'rating-count-text', textContent: U.getLang() === 'ar' ? '\u062c\u0627\u0631\u064a \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u062a\u0642\u064a\u064a\u0645\u0627\u062a...' : 'Loading ratings...' }));

    var interactiveContainer = U.el('div', { id: 'rating-interactive-stars' });
    if (RS) {
      var interactiveStars = RS.renderStars(0, true);
      interactiveContainer.appendChild(interactiveStars);
      RS.initializeStarEvents(interactiveStars, function (value) {
        _handleRatingSubmit(course.id, value);
      });
    } else {
      interactiveContainer.appendChild(U.el('p', { className: 'rating-status', textContent: U.t(META.ratingUnavailable) }));
    }
    card.appendChild(interactiveContainer);
    card.appendChild(U.el('p', { className: 'rating-status', id: 'rating-status-msg' }));

    return card;
  }

  function _handleRatingSubmit(courseId, value) {
    var statusEl             = U.qs('#rating-status-msg');
    var interactiveContainer = U.qs('#rating-interactive-stars .stars-interactive');

    if (statusEl) { statusEl.textContent = U.getLang() === 'ar' ? '\u062c\u0627\u0631\u064a \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u062a\u0642\u064a\u064a\u0645...' : 'Submitting your rating...'; statusEl.className = 'rating-status'; }
    if (RS && interactiveContainer) RS.disableStars(interactiveContainer);

    RS.submitRating(courseId, value).then(function (result) {
      if (result.status === 'success') {
        if (statusEl) { statusEl.textContent = U.t(META.ratingThanks); statusEl.className = 'rating-status success'; }
        U.showToast(U.t(META.ratingThanks), 'success');
        U.announce(U.t(META.ratingThanks));
        _loadAndDisplayRatings(courseId);
      } else {
        if (statusEl) {
          statusEl.textContent = result.message || U.t(META.ratingError);
          statusEl.className   = 'rating-status error';
        }
        if (interactiveContainer) {
          interactiveContainer.classList.remove('stars-disabled');
          interactiveContainer.querySelectorAll('.star-btn').forEach(function (s) { s.disabled = false; });
          var firstStar = interactiveContainer.querySelector('.star-btn');
          if (firstStar) firstStar.setAttribute('tabindex', '0');
        }
      }
    }).catch(function () {
      if (statusEl) {
        statusEl.textContent = U.t(META.ratingError);
        statusEl.className   = 'rating-status error';
      }
      if (interactiveContainer) {
        interactiveContainer.classList.remove('stars-disabled');
        interactiveContainer.querySelectorAll('.star-btn').forEach(function (s) { s.disabled = false; });
        var firstStar = interactiveContainer.querySelector('.star-btn');
        if (firstStar) firstStar.setAttribute('tabindex', '0');
      }
    });
  }

  function _loadAndDisplayRatings(courseId) {
    if (!RS) return;
    RS.fetchRatings(courseId).then(function (data) {
      var avg   = data.average || 0;
      var count = data.count   || 0;

      var bigNum = U.qs('#rating-big-number');
      if (bigNum) bigNum.textContent = avg > 0 ? avg.toFixed(1) : '\u2014';

      var displayContainer = U.qs('#rating-display-stars');
      if (displayContainer && RS) {
        clearElement(displayContainer);
        displayContainer.appendChild(RS.renderStars(avg, false));
      }

      var countText = U.qs('#rating-count-text');
      if (countText) {
        if (count > 0) {
          countText.textContent = U.t(META.ratingCount).replace('{count}', U.formatNumberByLang(count));
        } else {
          countText.textContent = U.getLang() === 'ar' ? '\u0644\u0627 \u062a\u0648\u062c\u062f \u062a\u0642\u064a\u064a\u0645\u0627\u062a \u0628\u0639\u062f \u2014 \u0643\u0646 \u0623\u0648\u0644 \u0645\u0646 \u064a\u0642\u064a\u0651\u0645!' : 'No ratings yet \u2014 be the first!';
        }
      }

      var metaRating = U.qs('#meta-rating-value');
      if (metaRating && RS) {
        clearElement(metaRating);
        var inline = U.el('span', { className: 'meta-rating-inline' });
        inline.appendChild(RS.renderStars(avg, false));
        inline.appendChild(U.el('span', { textContent: ' ' + (avg > 0 ? avg.toFixed(1) : '\u2014') }));
        metaRating.appendChild(inline);
      }

      if (count > 0 && !data.error) addRatingToSchema(avg, count);
    });
  }

  /* ── Utilities ── */

  function clearElement(el) {
    if (!el) return;
    while (el.firstChild) el.removeChild(el.firstChild);
  }

  /* ── Page Builder ── */

  function buildPage(course, container) {
    buildSchema(course);

    var frag          = document.createDocumentFragment();
    var mainContainer = U.el('div', { className: 'page-container' });
    var row           = U.el('div', { className: 'row g-4' });
    var leftCol       = U.el('div', { className: 'col-lg-8' });
    var rightCol      = U.el('div', { className: 'col-lg-4' });
    var sidebar       = U.el('div', { className: 'details-sidebar' });

    var objectives = buildObjectives(course);
    if (objectives) leftCol.appendChild(objectives);

    var curriculum = buildCurriculum(course);
    if (curriculum) leftCol.appendChild(curriculum);

    var faqSection = buildFAQ(course);
    if (faqSection) leftCol.appendChild(faqSection);

    sidebar.appendChild(buildSidebarCard(course));
    sidebar.appendChild(buildRatingCard(course));
    rightCol.appendChild(sidebar);

    row.appendChild(leftCol);
    row.appendChild(rightCol);
    mainContainer.appendChild(row);

    frag.appendChild(buildHeader(course));
    frag.appendChild(mainContainer);
    container.appendChild(frag);

    _loadAndDisplayRatings(course.id);
  }

  /* ============================================================
     AI COURSE ASSISTANT — Chat Widget
     ============================================================ */

  function buildChatFab() {
    return U.el('button', {
      className: 'chat-fab chat-fab--pulse',
      id:        'chat-fab',
      type:      'button',
      aria:      { expanded: 'false', label: U.getLang() === 'ar' ? '\u0641\u062a\u062d \u0645\u0633\u0627\u0639\u062f \u0627\u0644\u0643\u0648\u0631\u0633' : 'Open course assistant' }
    }, [
      U.el('i', { className: 'bi bi-chat-dots-fill chat-fab-icon chat-fab-icon--open',  aria: { hidden: 'true' } }),
      U.el('i', { className: 'bi bi-x-lg chat-fab-icon chat-fab-icon--close', aria: { hidden: 'true' } })
    ]);
  }

  function buildChatWidget(course) {
    var title = SP.getCourseField(course, 'title');

    var header = U.el('div', { className: 'chat-header', id: 'chat-header' }, [
      U.el('div', { className: 'chat-header-info' }, [
        U.el('div', { className: 'chat-header-avatar' }, [
          U.el('i', { className: 'bi bi-robot', aria: { hidden: 'true' } })
        ]),
        U.el('div', null, [
          U.el('div', { className: 'chat-header-name', textContent: U.t(META.chatBotName) }),
          U.el('div', { className: 'chat-header-status', textContent: title })
        ])
      ]),
      U.el('button', {
        className: 'chat-header-close',
        type:      'button',
        aria:      { label: U.getLang() === 'ar' ? '\u0625\u063a\u0644\u0627\u0642 \u0645\u0633\u0627\u0639\u062f \u0627\u0644\u0643\u0648\u0631\u0633' : 'Close course assistant' }
      }, [
        U.el('i', { className: 'bi bi-x-lg', aria: { hidden: 'true' } })
      ])
    ]);

    var messages = U.el('div', {
      className: 'chat-messages',
      id:        'chat-messages',
      role:      'log',
      aria:      { live: 'polite', label: U.getLang() === 'ar' ? '\u0645\u062d\u0627\u062f\u062b\u0629 \u0645\u0633\u0627\u0639\u062f \u0627\u0644\u0643\u0648\u0631\u0633' : 'Course assistant conversation' }
    });

    var typing = U.el('div', { className: 'chat-typing', id: 'chat-typing', aria: { hidden: 'true' } }, [
      U.el('div', { className: 'chat-typing-dots' }, [
        U.el('span', { className: 'chat-typing-dot' }),
        U.el('span', { className: 'chat-typing-dot' }),
        U.el('span', { className: 'chat-typing-dot' })
      ])
    ]);

    var placeholderText = U.t(META.chatPlaceholder);
    var textarea = U.el('textarea', {
      className:   'chat-input',
      id:          'chat-input',
      placeholder: placeholderText,
      rows:        '1',
      aria:        { label: placeholderText }
    });
    textarea.setAttribute('maxlength', String(CHAT_CONFIG.maxMessageLen));

    var sendBtn = U.el('button', {
      className: 'chat-send-btn',
      id:        'chat-send-btn',
      type:      'button',
      disabled:  'true',
      aria:      { label: U.getLang() === 'ar' ? '\u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0631\u0633\u0627\u0644\u0629' : 'Send message' }
    }, [
      U.el('i', { className: 'bi bi-send-fill', aria: { hidden: 'true' } })
    ]);

    var inputArea = U.el('div', { className: 'chat-input-area' }, [textarea, sendBtn]);

    return U.el('div', { className: 'chat-widget', id: 'chat-widget', role: 'dialog', aria: { label: U.getLang() === 'ar' ? '\u0645\u0633\u0627\u0639\u062f \u0627\u0644\u0643\u0648\u0631\u0633' : 'Course assistant', modal: 'false' } }, [header, messages, typing, inputArea]);
  }

  function _buildMessageBubble(role, text) {
    var bubbleClass = 'chat-bubble';
    if (role === 'user')  bubbleClass += ' chat-bubble--user';
    if (role === 'model') bubbleClass += ' chat-bubble--bot';
    if (role === 'error') bubbleClass += ' chat-bubble--error';

    var bubble = U.el('div', { className: bubbleClass });
    var paragraphs = text.split(/\n+/);
    for (var i = 0; i < paragraphs.length; i++) {
      var line = paragraphs[i].trim();
      if (line.length > 0) {
        bubble.appendChild(U.el('p', { className: 'chat-bubble-text', textContent: line }));
      }
    }
    return bubble;
  }

  function _addChatMessage(role, text) {
    var container = U.qs('#chat-messages');
    if (!container) return;
    container.appendChild(_buildMessageBubble(role, text));
    _scrollChatToBottom();
  }

  function _showChatTyping() {
    var typing = U.qs('#chat-typing');
    if (typing) typing.classList.add('chat-typing--visible');
    _scrollChatToBottom();
  }

  function _hideChatTyping() {
    var typing = U.qs('#chat-typing');
    if (typing) typing.classList.remove('chat-typing--visible');
  }

  function _scrollChatToBottom() {
    var container = U.qs('#chat-messages');
    if (!container) return;
    requestAnimationFrame(function () { container.scrollTop = container.scrollHeight; });
  }

  function _chatStorageKey(courseId) {
    return CHAT_CONFIG.storagePrefix + courseId;
  }

  function _getChatHistory(courseId) {
    try {
      var raw = sessionStorage.getItem(_chatStorageKey(courseId));
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch (e) { return []; }
  }

  function _saveChatMessage(courseId, role, text) {
    try {
      var history = _getChatHistory(courseId);
      history.push({ role: role, text: text });
      while (history.length > CHAT_CONFIG.maxHistory) {
        history.shift();
        if (history.length > 0 && history[0].role === 'model') history.shift();
      }
      sessionStorage.setItem(_chatStorageKey(courseId), JSON.stringify(history));
    } catch (e) {}
  }

  function _loadChatHistory(courseId) {
    var history = _getChatHistory(courseId);
    if (history.length === 0) return;
    for (var i = 0; i < history.length; i++) {
      _addChatMessage(history[i].role, history[i].text);
    }
  }

  function _toggleChat() {
    var fab    = U.qs('#chat-fab');
    var widget = U.qs('#chat-widget');
    if (!fab || !widget) return;

    chatState.isOpen = !chatState.isOpen;

    if (chatState.isOpen) {
      widget.classList.add('chat-widget--open');
      fab.classList.add('chat-fab--active');
      fab.setAttribute('aria-expanded', 'true');
      fab.setAttribute('aria-label', U.getLang() === 'ar' ? '\u0625\u063a\u0644\u0627\u0642 \u0645\u0633\u0627\u0639\u062f \u0627\u0644\u0643\u0648\u0631\u0633' : 'Close course assistant');
      fab.classList.remove('chat-fab--pulse');
      var input = U.qs('#chat-input');
      if (input) setTimeout(function () { input.focus(); }, 100);
      _scrollChatToBottom();
    } else {
      widget.classList.remove('chat-widget--open');
      fab.classList.remove('chat-fab--active');
      fab.setAttribute('aria-expanded', 'false');
      fab.setAttribute('aria-label', U.getLang() === 'ar' ? '\u0641\u062a\u062d \u0645\u0633\u0627\u0639\u062f \u0627\u0644\u0643\u0648\u0631\u0633' : 'Open course assistant');
      fab.focus();
    }
  }

  function _handleChatSubmit(courseId) {
    if (chatState.sending) return;
    var input   = U.qs('#chat-input');
    var sendBtn = U.qs('#chat-send-btn');
    if (!input) return;

    var message = input.value.trim();
    if (message.length === 0) return;
    if (message.length > CHAT_CONFIG.maxMessageLen) message = message.substring(0, CHAT_CONFIG.maxMessageLen);

    _addChatMessage('user', message);
    _saveChatMessage(courseId, 'user', message);

    input.value = '';
    _resizeChatInput(input);
    if (sendBtn) sendBtn.disabled = true;

    chatState.sending = true;
    _showChatTyping();
    input.disabled = true;

    var history = _getChatHistory(courseId);
    if (history.length > 0 && history[history.length - 1].role === 'user') {
      history = history.slice(0, history.length - 1);
    }

    var controller = new AbortController();
    var timer      = setTimeout(function () { controller.abort(); }, 35000);

    fetch('/api/chat', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ courseId: courseId, message: message, history: history }),
      signal:  controller.signal
    })
    .then(function (res) { return res.json(); })
    .then(function (data) {
      clearTimeout(timer);
      _hideChatTyping();
      if (data.status === 'success' && data.reply) {
        _addChatMessage('model', data.reply);
        _saveChatMessage(courseId, 'model', data.reply);
      } else {
        _addChatMessage('error', data.message || U.t(META.chatErrorMessage));
      }
      _enableChatInput();
    })
    .catch(function () {
      clearTimeout(timer);
      _hideChatTyping();
      _addChatMessage('error', U.t(META.chatErrorMessage));
      _enableChatInput();
    });
  }

  function _enableChatInput() {
    chatState.sending = false;
    var input   = U.qs('#chat-input');
    var sendBtn = U.qs('#chat-send-btn');
    if (input) { input.disabled = false; input.focus(); }
    if (sendBtn) sendBtn.disabled = !(input && input.value.trim().length > 0);
  }

  function _resizeChatInput(textarea) {
    textarea.style.height = 'auto';
    var maxHeight = 72;
    textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + 'px';
  }

  function initChatEvents(courseId) {
    var fab      = U.qs('#chat-fab');
    var closeBtn = U.qs('.chat-header-close');
    var input    = U.qs('#chat-input');
    var sendBtn  = U.qs('#chat-send-btn');

    if (fab) fab.addEventListener('click', function () { _toggleChat(); });
    if (closeBtn) closeBtn.addEventListener('click', function () { if (chatState.isOpen) _toggleChat(); });

    if (input) {
      input.addEventListener('input', function () {
        _resizeChatInput(input);
        if (sendBtn) sendBtn.disabled = chatState.sending || input.value.trim().length === 0;
      });
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); _handleChatSubmit(courseId); }
      });
    }

    if (sendBtn) sendBtn.addEventListener('click', function () { _handleChatSubmit(courseId); });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && chatState.isOpen) _toggleChat();
    });
  }

  /* ── Init ── */

  function init() {
    var app      = U.qs('#app') || document.body;
    var courseId = getCourseIdFromURL();

    if (!courseId) { renderError(app); return; }
    var course = findCourse(courseId);
    if (!course) { renderError(app); return; }

    injectSEO(course);
    buildPage(course, app);

    requestAnimationFrame(function () {
      var titleEl = U.qs('.page-title');
      if (titleEl) titleEl.scrollIntoView({ behavior: 'instant', block: 'start' });
    });

    document.body.appendChild(buildChatFab());
    document.body.appendChild(buildChatWidget(course));
    initChatEvents(course.id);

    var messagesContainer = U.qs('#chat-messages');
    if (messagesContainer) {
      var existingHistory = _getChatHistory(course.id);
      if (existingHistory.length > 0) {
        _loadChatHistory(course.id);
      } else {
        _addChatMessage('model', U.t(META.chatWelcomeMessage));
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

'use strict';

var COURSE_DATA = (function () {

  function deepFreeze(o) {
    if (o === null || typeof o !== 'object') return o;
    Object.freeze(o);
    Object.getOwnPropertyNames(o).forEach(function (p) {
      var v = o[p];
      if (v !== null && typeof v === 'object' && !Object.isFrozen(v)) deepFreeze(v);
    });
    return o;
  }

  var courses = [
    {
      id: 1,
      category: 'Development',
      level: 'Intermediate',
      price: 49.00,
      originalPrice: 99.00,
      students: 0,
      lessons: 1,
      rating: 0,
      date: '2025-02-21',
      image: 'dg-image.png',
      tags: ['data', 'business', 'google maps', 'excel', 'analytics'],
      driveUrl: '',

      en: {
        title: 'DataMap Pro — Business Data Intelligence',
        description: 'Extract, clean, and analyze business data from Google Maps directly. A smart tool that runs entirely in your browser — no servers needed. Clean data + smart analysis + ready-to-use Excel export. Lifetime access + continuous updates.',
        instructor: 'DataMap Team',
        learningObjectives: [
          'Extract business listing data from Google Maps directly',
          'Auto-detect and remove duplicate entries',
          'Analyze data with interactive charts and reports',
          'Export data in multiple formats (Excel/CSV)',
          'Use smart insights to understand market trends',
          'Build a qualified lead list ready for outreach'
        ],
        curriculum: [
          {
            title: 'Quick Start',
            lessons: [
              { title: 'Tool Introduction & Features', duration: '03:00', preview: true },
              { title: 'Your First Extraction', duration: '05:00', preview: true },
              { title: 'Basic Settings', duration: '04:00', preview: false }
            ]
          },
          {
            title: 'Cleaning & Analysis',
            lessons: [
              { title: 'Understanding Duplicates & Merging', duration: '08:00', preview: false },
              { title: 'Advanced Filters & Search', duration: '10:00', preview: false },
              { title: 'Charts & Reports', duration: '07:00', preview: false }
            ]
          },
          {
            title: 'Export & Usage',
            lessons: [
              { title: 'Excel/CSV Export', duration: '05:00', preview: false },
              { title: 'Using Data for Marketing', duration: '06:00', preview: false }
            ]
          }
        ],
        faq: [
          {
            question: 'Is the tool really free or are there hidden costs?',
            answer: '$49/year = everything. No additional costs. Lifetime access and continuous updates included.'
          },
          {
            question: 'How much data can I extract?',
            answer: 'No limit. The tool handles millions of records. The only constraint is the import file size (50MB max).'
          },
          {
            question: 'Is my data secure?',
            answer: '100% secure. The tool runs entirely in your browser. No servers, no cloud uploads. Sensitive data stays with you.'
          },
          {
            question: 'Can I use it offline?',
            answer: 'After the first load, yes. The tool is a PWA — it works fully offline via Service Worker.'
          },
          {
            question: 'Is there a free trial?',
            answer: 'Yes, try the tool free for your first city. No credit card required. Full functionality available.'
          },
          {
            question: 'How many customers have paid so far?',
            answer: 'You could be among the first! The tool is new and extremely valuable. Be an early adopter.'
          }
        ]
      },

      ar: {
        title: 'DataMap Pro — استخبارات بيانات الأعمال',
        description: 'استخراج وتنظيف وتحليل بيانات الأنشطة التجارية من جوجل ماب مباشرة. أداة ذكية تعمل بالكامل في متصفحك بدون خوادم. بيانات نظيفة + تحليل ذكي + تصدير Excel جاهز للاستخدام. وصول مدى الحياة + تحديثات مستمرة.',
        instructor: 'فريق DataMap',
        learningObjectives: [
          'استخراج بيانات أنشطة تجارية من جوجل ماب مباشرة',
          'تنظيف البيانات وكشف التكرارات تلقائياً',
          'تحليل البيانات مع رسوم بيانية وتقارير',
          'تصدير البيانات بصيغ متعددة (Excel/CSV)',
          'استخدام الاستنتاجات الذكية لفهم السوق',
          'بناء قائمة عملاء مؤهلين جاهزة للبيع'
        ],
        curriculum: [
          {
            title: 'البدء السريع',
            lessons: [
              { title: 'مقدمة الأداة والمميزات', duration: '03:00', preview: true },
              { title: 'خطوات الاستخراج الأول', duration: '05:00', preview: true },
              { title: 'الإعدادات الأساسية', duration: '04:00', preview: false }
            ]
          },
          {
            title: 'التنظيف والتحليل',
            lessons: [
              { title: 'فهم التكرارات والدمج', duration: '08:00', preview: false },
              { title: 'الفلاتر والبحث المتقدم', duration: '10:00', preview: false },
              { title: 'الرسوم البيانية والتقارير', duration: '07:00', preview: false }
            ]
          },
          {
            title: 'التصدير والاستخدام',
            lessons: [
              { title: 'تصدير Excel/CSV', duration: '05:00', preview: false },
              { title: 'استخدام البيانات في التسويق', duration: '06:00', preview: false }
            ]
          }
        ],
        faq: [
          {
            question: 'هل الأداة حقاً مجانية أم في تكاليف مخفية؟',
            answer: '49 دولار سنويا = كل شيء. لا تكاليف إضافية. الوصول مدى الحياة والتحديثات مستمرة.'
          },
          {
            question: 'كم بيانات أقدر أستخرج؟',
            answer: 'بدون حد. الأداة تحمل ملايين السجلات. الحد الوحيد هو حجم ملف الاستيراد (50MB أقصى).'
          },
          {
            question: 'البيانات آمنة؟',
            answer: '100% آمنة. الأداة تعمل بالكامل في متصفحك. لا خوادم، لا تحميل سحابي. بيانات حساسة تبقى عندك.'
          },
          {
            question: 'أقدر أستخدمها بدون إنترنت؟',
            answer: 'بعد التحميل الأول نعم. الأداة PWA — تعمل offline بالكامل عبر Service Worker.'
          },
          {
            question: 'في نسخة تجريبية؟',
            answer: 'نعم، جرّب الأداة مجاناً للمدينة الأولى. بدون بطاقة ائتمان. كل شيء متاح.'
          },
          {
            question: 'كام عميل دفع بالفعل؟',
            answer: 'أنت ممكن تكون من الأوائل! الأداة جديدة وقيمتها عالية جداً. كن من أول المستخدمين.'
          }
        ]
      }
    },

    {
      id: 2,
      category: 'Business',
      level: 'Beginner',
      price: 399.00,
      originalPrice: 0,
      students: 0,
      lessons: 1,
      rating: 0,
      date: '2026-02-23',
      image: 'co-image.png',
      tags: ['website', 'course platform', 'business', 'white-label', 'sell courses'],
      driveUrl: '',

      en: {
        title: 'CourseBase — Own Your Digital Academy',
        description: 'If you have knowledge, experience, or even a course idea — this is your chance to build a real business.\n\nYou won\'t start from scratch. No subscriptions, no revenue sharing.\n\nYou get a complete academy under your brand — a professional website, official pages that document your identity, and a course sales system that works for you 24/7.\n\nStudents come to you, see you as a real brand, buy from you, and learn from your content — all under your full control.\n\nNo complexity. No operating costs. No one takes a cut of your revenue.\n\nThis isn\'t a tool — it\'s the start of a business.',
        instructor: 'Ai8V Team',
        learningObjectives: [
          'Launch a complete educational business ready to operate immediately',
          'Own a real academy under your name — not just be a course seller',
          'Control everything — pricing, content, students, revenue',
          'Deliver a professional experience that earns student trust from the first visit',
          'Sell unlimited courses with zero restrictions',
          'Turn your expertise into continuous income instead of unused knowledge'
        ],
        curriculum: [
          {
            title: 'Project Kickoff — The Full Picture',
            lessons: [
              { title: 'What exactly are you getting into?', duration: '05:00', preview: true },
              { title: 'How this project can change your income', duration: '03:00', preview: true },
              { title: 'Understanding every part of the system', duration: '08:00', preview: false }
            ]
          },
          {
            title: 'Making It Your Brand',
            lessons: [
              { title: 'Making everything speak your name — identity & brand', duration: '10:00', preview: false },
              { title: 'The look that makes people take you seriously', duration: '07:00', preview: false },
              { title: 'Adding your courses your way', duration: '12:00', preview: false },
              { title: 'Presenting yourself professionally to convince clients', duration: '06:00', preview: false }
            ]
          },
          {
            title: 'The Sales System — Where the Money Comes From',
            lessons: [
              { title: 'Managing students easily without complexity', duration: '05:00', preview: false },
              { title: 'Organizing your data to stay in control', duration: '08:00', preview: false },
              { title: 'Protecting your content from theft', duration: '10:00', preview: false },
              { title: 'A student login experience that delivers value', duration: '06:00', preview: false }
            ]
          },
          {
            title: 'Launch Day — The Turning Point',
            lessons: [
              { title: 'Getting visible in the market', duration: '04:00', preview: false },
              { title: 'Connecting everything in one step', duration: '05:00', preview: false },
              { title: 'Going live with your project', duration: '06:00', preview: false },
              { title: 'Testing the experience as a customer', duration: '05:00', preview: false }
            ]
          },
          {
            title: 'After Launch — Growth',
            lessons: [
              { title: 'Adding clients easily', duration: '04:00', preview: false },
              { title: 'Adding more courses and growing your business', duration: '06:00', preview: false },
              { title: 'Solving any issue without getting stuck', duration: '05:00', preview: false }
            ]
          }
        ],
        faq: [
          {
            question: 'Is this suitable for me if I\'m a complete beginner?',
            answer: 'Yes. This is designed so you can start even if it\'s your first time doing something like this. You\'ll go step by step until you have a running business.'
          },
          {
            question: 'Will I actually make money from this?',
            answer: 'If you have something valuable to offer — yes. The platform gives you all the tools. The rest is up to you to sell effectively.'
          },
          {
            question: 'Are there ongoing costs after I start?',
            answer: 'No. No monthly subscriptions and no one takes a percentage. Everything you earn comes back to you.'
          },
          {
            question: 'Am I really the owner of the project?',
            answer: '100%. It\'s your work, under your name, under your full control.'
          },
          {
            question: 'Can I set any price I want?',
            answer: 'You decide everything — the price, the offer, even the selling method.'
          },
          {
            question: 'Is there a limit on courses?',
            answer: 'Add as many as you want. The more content you create, the more your income grows.'
          },
          {
            question: 'What if I get stuck on something?',
            answer: 'You\'ll find support to help you continue. The goal is for you to succeed, not to get blocked.'
          },
          {
            question: 'Can I work in Arabic?',
            answer: 'Of course. Arabic, English — work in whichever language suits your audience.'
          }
        ]
      },

      ar: {
        title: 'CourseBase — امتلك أكاديميتك الرقمية بالكامل',
        description: 'لو عندك علم… خبرة… أو حتى فكرة كورس — فدي فرصتك تبني مشروعك الحقيقي.\n\nمش هتبدأ من الصفر، ومش هتدفع اشتراكات، ومش هتسلم شغلك لحد ياخد منك نسبة.\n\nهنا أنت بتمتلك أكاديمية كاملة باسمك — موقع متكامل، صفحات رسمية توثق هويتك، ونظام بيع كورسات يشتغل لصالحك 24 ساعة.\n\nالطالب يدخل عندك، يشوفك كبراند حقيقي، يشتري منك، ويتعلم من محتواك… وكل ده تحت سيطرتك أنت.\n\nبدون تعقيد. بدون مصاريف تشغيل. بدون حد بيشاركك أرباحك.\n\nدي مش أداة… دي بداية مشروع.',
        instructor: 'فريق Ai8V',
        learningObjectives: [
          'تطلع بمشروع تعليمى كامل جاهز تشتغل بيه فوراً',
          'تبقى صاحب أكاديمية حقيقية باسمك مش مجرد بائع كورسات',
          'تتحكم فى كل حاجة — السعر، المحتوى، العملاء، الأرباح',
          'تقدم تجربة احترافية تخلى الطالب يثق فيك من أول زيارة',
          'تبيع عدد لا نهائى من الكورسات بدون أى قيود',
          'تحول خبرتك لدخل مستمر بدل ما تفضل مجرد معلومة عندك'
        ],
        curriculum: [
          {
            title: 'بداية المشروع — الصورة الكاملة',
            lessons: [
              { title: 'إنت داخل على إيه بالظبط؟', duration: '05:00', preview: true },
              { title: 'إزاى المشروع ده ممكن يغير دخلك', duration: '03:00', preview: true },
              { title: 'فهم كل جزء فى المنظومة ببساطة', duration: '08:00', preview: false }
            ]
          },
          {
            title: 'تحويله لبراند باسمك',
            lessons: [
              { title: 'خلى كل حاجة تتكلم عنك — الاسم والهوية', duration: '10:00', preview: false },
              { title: 'الشكل اللى يخلى الناس تاخدك بجد', duration: '07:00', preview: false },
              { title: 'إضافة كورساتك بطريقتك أنت', duration: '12:00', preview: false },
              { title: 'تقديم نفسك بشكل احترافى يقنع العميل', duration: '06:00', preview: false }
            ]
          },
          {
            title: 'نظام البيع — اللى بيجيب الفلوس',
            lessons: [
              { title: 'إدارة الطلبة بسهولة ومن غير تعقيد', duration: '05:00', preview: false },
              { title: 'تنظيم بياناتك بشكل يخليك مسيطر', duration: '08:00', preview: false },
              { title: 'حماية المحتوى بتاعك من السرقة', duration: '10:00', preview: false },
              { title: 'تجربة دخول للطالب تخليه يحس بالقيمة', duration: '06:00', preview: false }
            ]
          },
          {
            title: 'الإطلاق — لحظة التحول',
            lessons: [
              { title: 'إزاى تطلع للموجودين فى السوق', duration: '04:00', preview: false },
              { title: 'ربط كل حاجة ببعضها فى خطوة واحدة', duration: '05:00', preview: false },
              { title: 'تشغيل مشروعك بشكل فعلى', duration: '06:00', preview: false },
              { title: 'اختبار التجربة كأنك عميل', duration: '05:00', preview: false }
            ]
          },
          {
            title: 'بعد الإطلاق — التوسع',
            lessons: [
              { title: 'تضيف عملاء بسهولة', duration: '04:00', preview: false },
              { title: 'تزود كورسات وتكبر مشروعك', duration: '06:00', preview: false },
              { title: 'تحل أى مشكلة بدون ما تتعطل', duration: '05:00', preview: false }
            ]
          }
        ],
        faq: [
          {
            question: 'ده مناسب ليا لو أنا لسه مبتدئ؟',
            answer: 'أيوه. ده معمول عشان تبدأ حتى لو أول مرة تعمل حاجة زى كده. هتمشى خطوة خطوة لحد ما يبقى عندك مشروع شغال.'
          },
          {
            question: 'هكسب فعلاً من الموضوع ده؟',
            answer: 'لو عندك حاجة مفيدة تقدمها — أيوه. المنصة بتديلك كل الأدوات، والباقى عليك إنك تبيع صح.'
          },
          {
            question: 'هل فى مصاريف بعد ما أبدأ؟',
            answer: 'لا. مفيش التزامات شهرية ولا حد بياخد منك نسبة. كل اللى بتكسبه بيرجعلك.'
          },
          {
            question: 'هل أنا فعلاً صاحب المشروع؟',
            answer: '100%. ده شغلك، باسمك، وتحت سيطرتك الكاملة.'
          },
          {
            question: 'ينفع أبيع بأى سعر؟',
            answer: 'أنت اللى بتحدد كل حاجة — السعر، العرض، حتى طريقة البيع.'
          },
          {
            question: 'مفيش حد أقصى للكورسات؟',
            answer: 'ضيف براحتك. كل ما تكبر المحتوى… يكبر دخلك.'
          },
          {
            question: 'ولو وقفت فى حاجة؟',
            answer: 'هتلاقى دعم يساعدك تكمل — الهدف إنك توصل مش إنك تتعطل.'
          },
          {
            question: 'هل ينفع أشتغل بالعربى؟',
            answer: 'طبعاً. عربى، إنجليزى — اشتغل باللغة اللى تناسب جمهورك.'
          }
        ]
      }
    }
  ];

  var categories = {
    'Development': { color: 'teal',    label: { en: 'Development', ar: 'تطوير' } },
    'Business':    { color: 'emerald', label: { en: 'Business',    ar: 'أعمال' } }
  };

  var WHATSAPP_NUMBER = '201556450850';
  var BRAND_NAME      = 'Ai8V | Mind & Machine';
  var DOMAIN          = 'ai8v.com';

  var SOCIAL_LINKS = [
    'https://www.youtube.com/@ai8vcom',
    'https://www.facebook.com/ai8vcom/',
    'https://www.instagram.com/ai8vcom/',
    'https://maps.app.goo.gl/CTaRvK1ftGpdVqSd8'
  ];

  var GOOGLE_MAPS_EMBED = 'https://maps.google.com/maps?q=30.7798632,30.9936147&z=15&output=embed';
  var GOOGLE_MAPS_URL   = 'https://maps.app.goo.gl/CTaRvK1ftGpdVqSd8';
  var GOOGLE_MAPS_DIRECT = 'https://www.google.com/maps/place/Ai8V+-+Mind+%26+Machine/@30.7798632,30.9936147,17z/data=!4m6!3m5!1s0x14f7c9340a395837:0xe791ef680fb93b35!8m2!3d30.7798632!4d30.9936147!16s%2Fg%2F11kh_h6ty3';

  courses.forEach(function (c) {
    var enCount = 0;
    var arCount = 0;
    if (c.en && c.en.curriculum && c.en.curriculum.length) {
      enCount = c.en.curriculum.reduce(function (sum, section) {
        return sum + (section.lessons ? section.lessons.length : 0);
      }, 0);
    }
    if (c.ar && c.ar.curriculum && c.ar.curriculum.length) {
      arCount = c.ar.curriculum.reduce(function (sum, section) {
        return sum + (section.lessons ? section.lessons.length : 0);
      }, 0);
    }
    c.lessons = Math.max(enCount, arCount);
  });

  return deepFreeze({
    courses:          courses,
    categories:       categories,
    WHATSAPP_NUMBER:  WHATSAPP_NUMBER,
    BRAND_NAME:       BRAND_NAME,
    DOMAIN:           DOMAIN,
    SOCIAL_LINKS:     SOCIAL_LINKS,
    GOOGLE_MAPS_EMBED: GOOGLE_MAPS_EMBED,
    GOOGLE_MAPS_URL:   GOOGLE_MAPS_URL,
    GOOGLE_MAPS_DIRECT:GOOGLE_MAPS_DIRECT,

    META: {
      ogImage:          '/assets/img/og-image.png',
      supportEmail:     'amr.omar304@gmail.com',
      foundingYear:     '2025',
      logoPath:         '/assets/img/fav180.png',
      legalLastUpdated: '2026-02-20',

      tagline: {
        en: 'We Turn Your Knowledge Into AI That Works For You',
        ar: 'نحوّل معرفتك إلى ذكاء اصطناعي يعمل لصالحك'
      },
      description: {
        en: 'Ai8V is a Middle East-based AI startup that builds white-label digital platforms for educators, trainers, and institutions. Each client receives a fully branded course website with an AI-powered research assistant trained exclusively on their own content using Retrieval-Augmented Generation (RAG). We turn private knowledge into intelligent, conversational systems — no data leaves the client\'s control.',
        ar: 'Ai8V هي شركة ناشئة متخصصة في بناء منصات رقمية بالذكاء الاصطناعي للمحاضرين والمدربين والمؤسسات التعليمية في الشرق الأوسط. كل عميل يحصل على منصة كورسات كاملة بهويته الخاصة، مدعومة بمساعد بحثي ذكي يعمل حصرياً على محتوى العميل باستخدام تقنية RAG. نحوّل المعرفة الخاصة إلى أنظمة ذكية تفاعلية — بدون مشاركة البيانات مع أي جهة.'
      },
      descriptionShort: {
        en: 'White-label AI course platforms and RAG-powered research assistants for educators in the Middle East.',
        ar: 'منصات كورسات ذكية ومساعدات بحثية بتقنية RAG بهوية عملائنا — للمحاضرين والمؤسسات.'
      },

      heroLine1: {
        en: 'We Turn Your Knowledge',
        ar: 'نحوّل معرفتك'
      },
      heroLine2: {
        en: 'Into AI That Works For You.',
        ar: 'إلى ذكاء اصطناعي يعمل لصالحك.'
      },
      heroSubtitle: {
        en: 'White-label course platforms and AI research assistants — built for educators and institutions in the Middle East.',
        ar: 'منصات كورسات ومساعدات بحثية بالذكاء الاصطناعي — مصممة للمحاضرين والمؤسسات التعليمية.'
      },
      heroBadge: {
        en: 'AI-Powered Education',
        ar: 'تعليم مدعوم بالذكاء الاصطناعي'
      },

      ctaTitle: {
        en: 'Ready to Build Your Platform?',
        ar: 'جاهز تبني منصتك؟'
      },
      ctaSubtitle: {
        en: 'Let us turn your expertise into a branded AI-powered academy.',
        ar: 'خلّينا نحوّل خبرتك لأكاديمية ذكية بهويتك.'
      },

      navHome:     { en: 'Home',     ar: 'الرئيسية' },
      navServices: { en: 'Services', ar: 'الخدمات' },
      navCourses:  { en: 'Courses',  ar: 'الكورسات' },
      navAbout:    { en: 'About',    ar: 'من نحن' },
      navBrowseAll:{ en: 'Browse All', ar: 'تصفح الكل' },

      emptyStateTitle: {
        en: 'No courses found',
        ar: 'لا توجد كورسات'
      },
      emptyStateText: {
        en: 'Try adjusting your filters.',
        ar: 'جرّب تعديل الفلاتر.'
      },
      resetFiltersLabel: {
        en: 'Reset Filters',
        ar: 'إعادة تعيين'
      },
      resultsTemplate: {
        en: '{count} results',
        ar: '{count} نتيجة'
      },
      filtersTitle: {
        en: 'Filters',
        ar: 'الفلاتر'
      },

      sortOptions: {
        en: ['Top Rated', 'Newest', 'Title A\u2013Z', 'Title Z\u2013A', 'Price High\u2192Low', 'Price Low\u2192High', 'Popular'],
        ar: ['\u0627\u0644\u0623\u0639\u0644\u0649 \u062a\u0642\u064a\u064a\u0645\u0627\u064b', '\u0627\u0644\u0623\u062d\u062f\u062b', '\u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0623\u2013\u064a', '\u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u064a\u2013\u0623', '\u0627\u0644\u0633\u0639\u0631: \u0627\u0644\u0623\u0639\u0644\u0649', '\u0627\u0644\u0633\u0639\u0631: \u0627\u0644\u0623\u0642\u0644', '\u0627\u0644\u0623\u0643\u062b\u0631 \u0634\u0639\u0628\u064a\u0629']
      },

      levels: {
        en: ['Beginner', 'Intermediate', 'Advanced'],
        ar: ['\u0645\u0628\u062a\u062f\u0626', '\u0645\u062a\u0648\u0633\u0637', '\u0645\u062a\u0642\u062f\u0645']
      },

      viewCourse: {
        en: 'View Course',
        ar: 'عرض الكورس'
      },
      buyCourse: {
        en: 'Buy Now',
        ar: 'اشتري الآن'
      },
      startLearning: {
        en: 'Start Learning',
        ar: 'ابدأ التعلم'
      },
      enterCourse: {
        en: 'Enter Course',
        ar: 'ادخل الكورس'
      },
      backToCourses: {
        en: 'Back to Courses',
        ar: 'العودة للكورسات'
      },
      contactWhatsApp: {
        en: 'Contact on WhatsApp',
        ar: 'تواصل عبر واتساب'
      },

      sectionObjectives: {
        en: 'What You Will Learn',
        ar: 'ماذا ستتعلم'
      },
      sectionCurriculum: {
        en: 'Course Curriculum',
        ar: 'محتوى الكورس'
      },
      sectionFaq: {
        en: 'Frequently Asked Questions',
        ar: 'الأسئلة الشائعة'
      },

      metaLessons: {
        en: 'Lessons',
        ar: 'الدروس'
      },
      metaLevel: {
        en: 'Level',
        ar: 'المستوى'
      },
      metaLanguage: {
        en: 'Language',
        ar: 'اللغة'
      },
      metaStudents: {
        en: 'Students',
        ar: 'الطلاب'
      },
      metaAccess: {
        en: 'Lifetime Access',
        ar: 'وصول مدى الحياة'
      },
      metaCertificate: {
        en: 'Certificate',
        ar: 'شهادة'
      },
      metaUpdates: {
        en: 'Free Updates',
        ar: 'تحديثات مجانية'
      },

      ratingTitle: {
        en: 'Course Rating',
        ar: 'تقييم الكورس'
      },
      ratingSubmit: {
        en: 'Submit',
        ar: 'أرسل'
      },
      ratingThanks: {
        en: 'Thanks for your rating!',
        ar: 'شكراً لتقييمك!'
      },
      ratingError: {
        en: 'Error submitting rating.',
        ar: 'حصل خطأ في التقييم.'
      },
      ratingAlready: {
        en: 'You already rated this course.',
        ar: 'سبق وقيّمت هذا الكورس.'
      },
      ratingUnavailable: {
        en: 'Rating unavailable.',
        ar: 'التقييم غير متاح.'
      },
      ratingCount: {
        en: '{count} ratings',
        ar: '{count} تقييم'
      },
      ratingAvg: {
        en: 'Average: {avg}/5',
        ar: 'المتوسط: {avg}/5'
      },

      chatBotName: {
        en: 'Course Assistant',
        ar: 'مساعد الكورس'
      },
      chatWelcomeMessage: {
        en: 'Hello! I am here to help you with any question about the course. Ask me anything!',
        ar: 'مرحباً! أنا هنا عشان أساعدك بأي سؤال عن الكورس. اسألني أي حاجة!'
      },
      chatPlaceholder: {
        en: 'Type your question...',
        ar: 'اكتب سؤالك هنا...'
      },
      chatErrorMessage: {
        en: 'Connection error. Please try again.',
        ar: 'حصل مشكلة في الاتصال. جرّب تاني.'
      },

      whatsappDefaultMessage: {
        en: 'Hello! I have a question about your services.',
        ar: 'مرحباً! عندي سؤال عن خدماتكم.'
      },
      whatsappBuyTemplate: {
        en: 'Hello, I want to buy "{title}" \u2014 Price: {price}',
        ar: 'مرحباً، أريد شراء كورس "{title}" \u2014 السعر: {price}'
      },

      errorTitle: {
        en: 'Course Not Found',
        ar: 'الكورس غير موجود'
      },
      errorText: {
        en: 'This course does not exist.',
        ar: 'هذا الكورس غير موجود.'
      },
      errorBrowse: {
        en: 'Browse Courses',
        ar: 'تصفح الكورسات'
      },

      currencyLabel: {
        en: '$',
        ar: 'ج.م'
      },
      currencyRate: {
        en: 1,
        ar: 50
      },
      freeLabel: {
        en: 'Free',
        ar: 'مجاني'
      },
      discountLabel: {
        en: '{pct}% off \u00B7 Save {amount}',
        ar: 'خصم {pct}% \u00B7 وفّر {amount}'
      },

      copyrightTemplate: {
        en: '\u00A9 {year} {brand}. All rights reserved.',
        ar: '\u00A9 {year} {brand}. جميع الحقوق محفوظة.'
      },

      footerTagline: {
        en: 'Mind & Machine',
        ar: 'العقل والآلة'
      },
      footerQuickLinks: {
        en: 'Quick Links',
        ar: 'روابط سريعة'
      },
      footerProducts: {
        en: 'Courses',
        ar: 'الكورسات'
      },
      footerLegal: {
        en: 'Legal',
        ar: 'قانوني'
      },
      footerContact: {
        en: 'Contact',
        ar: 'تواصل'
      },
      footerMapTitle: {
        en: 'Our Location',
        ar: 'موقعنا'
      },

      statCourses: {
        en: 'Courses Available',
        ar: 'الكورسات المتاحة'
      },
      statStudents: {
        en: 'Students Enrolled',
        ar: 'الطلاب المسجلين'
      },
      statRating: {
        en: 'Average Rating',
        ar: 'متوسط التقييم'
      },
      statSatisfaction: {
        en: 'Satisfaction Rate',
        ar: 'نسبة الرضا'
      },

      featuredHeading: {
        en: 'Featured Courses',
        ar: 'كورسات مميزة'
      },
      categoriesHeading: {
        en: 'Browse by Category',
        ar: 'تصفح حسب التصنيف'
      },
      howHeading: {
        en: 'How It Works',
        ar: 'كيف يعمل؟'
      },

      howSteps: {
        en: [
          { title: 'Choose Your Platform',  desc: 'Pick CourseBase, Smart Library, or the Full System.' },
          { title: 'We Build It For You',   desc: 'Your brand, your domain, your content \u2014 fully customized.' },
          { title: 'Launch & Grow',          desc: 'Start selling courses and using AI \u2014 from day one.' }
        ],
        ar: [
          { title: 'اختار منصتك',  desc: 'CourseBase، المكتبة الذكية، أو النظام الكامل.' },
          { title: 'نبنيها لك',    desc: 'باسمك، بدومينك، بمحتواك \u2014 كل حاجة مخصصة.' },
          { title: 'أطلق واكبر',   desc: 'ابدأ تبيع كورسات واستخدم الذكاء الاصطناعي \u2014 من أول يوم.' }
        ]
      },

      lessonsLabel: {
        en: '{n} lessons',
        ar: '{n} درس'
      },
      coursesLabel: {
        en: '{n} courses',
        ar: '{n} كورس'
      },

      langSwitchLabel: {
        en: 'العربية',
        ar: 'English'
      },

      previewLabel: {
        en: 'Preview',
        ar: 'معاينة'
      },
      previewPlay: {
        en: 'Play Preview',
        ar: 'تشغيل المعاينة'
      },
      previewClose: {
        en: 'Close',
        ar: 'إغلاق'
      },
      previewFullscreen: {
        en: 'Fullscreen',
        ar: 'ملء الشاشة'
      },
      previewExitFullscreen: {
        en: 'Exit Fullscreen',
        ar: 'إنهاء ملء الشاشة'
      },

      catalogPageTitle: {
        en: 'Explore Courses',
        ar: 'تصفح الكورسات'
      },
      catalogBreadcrumbCourses: {
        en: 'Courses',
        ar: 'الكورسات'
      },
      coursesListHeading: {
        en: 'Course Results',
        ar: 'نتائج الكورسات'
      },

      aboutPageTitle: {
        en: 'About Us',
        ar: 'من نحن'
      },
      privacyPageTitle: {
        en: 'Privacy Policy',
        ar: 'سياسة الخصوصية'
      },
      termsPageTitle: {
        en: 'Terms of Use',
        ar: 'شروط الاستخدام'
      },
      servicesPageTitle: {
        en: 'Our Services',
        ar: 'خدماتنا'
      },

      categoryLabel: {
        en: 'Category',
        ar: 'التصنيف'
      },
      ratingLabel: {
        en: 'Rating',
        ar: 'التقييم'
      },
      levelLabel: {
        en: 'Level',
        ar: 'المستوى'
      },
      searchPlaceholder: {
        en: 'Search courses...',
        ar: 'ابحث عن كورس...'
      },
      searchLabel: {
        en: 'Search courses',
        ar: 'ابحث عن كورسات'
      },
      sortLabel: {
        en: 'Sort by',
        ar: 'ترتيب حسب'
      },

      paginationPrev: {
        en: 'Previous',
        ar: 'السابق'
      },
      paginationNext: {
        en: 'Next',
        ar: 'التالي'
      },
      paginationPage: {
        en: 'Page {n}',
        ar: 'صفحة {n}'
      },

      starsAria: {
        en: 'Rating: {rating} out of 5',
        ar: 'التقييم: {rating} من 5'
      },
      lessonsAria: {
        en: '{n} lessons',
        ar: '{n} درس'
      },
      levelAria: {
        en: 'Level: {level}',
        ar: 'المستوى: {level}'
      },
      courseCardAria: {
        en: 'View course: {title}',
        ar: 'عرض الكورس: {title}'
      },
      categoryCardAria: {
        en: '{name} \u2014 {count} courses',
        ar: '{name} \u2014 {count} كورس'
      },

      breadcrumbHome: {
        en: 'Home',
        ar: 'الرئيسية'
      },
      breadcrumbCourses: {
        en: 'Courses',
        ar: 'الكورسات'
      },

      noscriptMessage: {
        en: 'JavaScript is required to view this page.',
        ar: 'JavaScript مطلوب لعرض هذه الصفحة.'
      },

      toastFilterReset: {
        en: 'Filters reset',
        ar: 'تم إعادة تعيين الفلاتر'
      },
      toastSortChanged: {
        en: 'Sorted by {sort}',
        ar: 'تم الترتيب حسب {sort}'
      },

      servicesSeoTitle: {
        en: 'Our Services — Ai8V',
        ar: 'خدماتنا — Ai8V'
      },
      servicesPageDescription: {
        en: 'Ai8V builds white-label AI-powered course platforms, private research assistants, and full AI systems for educators and institutions in the Middle East.',
        ar: 'Ai8V تبني منصات كورسات ذكية بهوية عملائها ومساعدات بحثية خاصة وأنظمة ذكاء اصطناعي متكاملة للمحاضرين والمؤسسات التعليمية.'
      },
      servicesHeroTitle: {
        en: 'AI Infrastructure for Education',
        ar: 'بنية ذكاء اصطناعي للتعليم'
      },
      servicesHeroSubtitle: {
        en: 'We build white-label platforms and AI research tools — so you can focus on teaching.',
        ar: 'نبني منصات بهويتك وأدوات بحث بالذكاء الاصطناعي — عشان تركز على التعليم.'
      },
      servicesHeroCta: {
        en: 'Get Started',
        ar: 'ابدأ الآن'
      },
      servicesCards: {
        en: [
          {
            title: 'CourseBase',
            subtitle: 'White-Label Course Platform',
            description: 'A complete course-selling website under your brand. Your domain, your identity, your revenue — no subscriptions, no revenue sharing.',
            icon: 'bi-mortarboard'
          },
          {
            title: 'Smart Research Library',
            subtitle: 'RAG AI Research Assistant',
            description: 'A private AI assistant trained on your content. Students ask questions and get accurate, sourced answers from your materials — instantly.',
            icon: 'bi-book'
          },
          {
            title: 'Full AI System',
            subtitle: 'Combined Package',
            description: 'CourseBase + Smart Research Library together. The complete AI-powered education infrastructure — one setup, full control.',
            icon: 'bi-cpu'
          }
        ],
        ar: [
          {
            title: 'CourseBase',
            subtitle: 'منصة كورسات بهويتك',
            description: 'موقع كامل لبيع الكورسات باسمك. دومينك، هويتك، أرباحك — بدون اشتراكات، بدون نسبة من الأرباح.',
            icon: 'bi-mortarboard'
          },
          {
            title: 'المكتبة البحثية الذكية',
            subtitle: 'مساعد بحثي بالذكاء الاصطناعي',
            description: 'مساعد ذكي خاص متدرب على محتواك. الطالب يسأل ويحصل على إجابات دقيقة من موادك — فوراً.',
            icon: 'bi-book'
          },
          {
            title: 'النظام الكامل',
            subtitle: 'الباقة المتكاملة',
            description: 'CourseBase + المكتبة البحثية الذكية معاً. بنية تعليم ذكية متكاملة — إعداد واحد، تحكم كامل.',
            icon: 'bi-cpu'
          }
        ]
      },
      servicesHowTitle: {
        en: 'How It Works',
        ar: 'كيف يعمل؟'
      },
      servicesHowSteps: {
        en: [
          { title: 'Choose Your Platform', description: 'Pick CourseBase, Smart Research Library, or the Full System.' },
          { title: 'We Build It For You', description: 'Your brand, your domain, your content — fully customized.' },
          { title: 'Launch & Grow', description: 'Start selling courses and using AI — from day one.' }
        ],
        ar: [
          { title: 'اختار منصتك', description: 'CourseBase، المكتبة الذكية، أو النظام الكامل.' },
          { title: 'نبنيها لك', description: 'باسمك، بدومينك، بمحتواك — كل حاجة مخصصة.' },
          { title: 'أطلق واكبر', description: 'ابدأ تبيع كورسات واستخدم الذكاء الاصطناعي — من أول يوم.' }
        ]
      },
      servicesValuesTitle: {
        en: 'Why Ai8V',
        ar: 'ليه Ai8V'
      },
      servicesValues: {
        en: [
          { title: 'Your Brand, Not Ours', description: 'Everything runs under your name. Students see you — not us.' },
          { title: 'Zero Revenue Sharing', description: 'You keep 100% of what you earn. No commissions, no hidden fees.' },
          { title: 'No Subscriptions', description: 'One-time setup. No monthly costs eating into your profit.' },
          { title: 'AI-Powered', description: 'Built-in AI research assistants that make your content smarter.' },
          { title: 'Full Control', description: 'You own everything — pricing, content, students, data.' },
          { title: 'Middle East Focused', description: 'Built for Arabic-first audiences with full RTL and bilingual support.' }
        ],
        ar: [
          { title: 'براندك، مش براندنا', description: 'كل حاجة بتشتغل باسمك. الطالب يشوفك أنت — مش إحنا.' },
          { title: 'بدون نسبة من الأرباح', description: 'كل اللى بتكسبه بيرجعلك. بدون عمولات، بدون رسوم مخفية.' },
          { title: 'بدون اشتراكات', description: 'إعداد مرة واحدة. مفيش مصاريف شهرية بتاكل أرباحك.' },
          { title: 'مدعوم بالذكاء الاصطناعي', description: 'مساعدات بحثية ذكية مدمجة بتخلي محتواك أذكى.' },
          { title: 'تحكم كامل', description: 'أنت صاحب كل حاجة — السعر، المحتوى، الطلاب، البيانات.' },
          { title: 'مصمم للشرق الأوسط', description: 'مبني للجمهور العربي أولاً مع دعم كامل للـ RTL وثنائي اللغة.' }
        ]
      },
      servicesCtaTitle: {
        en: 'Ready to Build Your Platform?',
        ar: 'جاهز تبني منصتك؟'
      },
      servicesCtaSubtitle: {
        en: 'Let us turn your expertise into a branded AI-powered academy.',
        ar: 'خلّينا نحوّل خبرتك لأكاديمية ذكية بهويتك.'
      },
      servicesCtaButton: {
        en: 'Contact on WhatsApp',
        ar: 'تواصل عبر واتساب'
      }
    }
  });

})();

if (typeof window !== 'undefined') window.COURSE_DATA = COURSE_DATA;

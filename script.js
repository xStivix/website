/* Mobile AI read-more: CSS alone controls which viewport collapses the text. */
(() => {
  const minimumWordsForReadMore = 60;
  document.querySelectorAll('#ai-page [data-ai-read-more]').forEach((paragraph, index) => {
    if (paragraph.dataset.readMoreReady === 'true') return;

    const fullText = paragraph.textContent.replace(/\s+/g, ' ').trim();
    if (fullText.split(' ').length <= minimumWordsForReadMore) return;
    const previewText = paragraph.dataset.readMorePreview;
    if (!previewText || !fullText.startsWith(previewText) || fullText.length <= previewText.length) return;

    const lead = document.createElement('span');
    lead.className = 'ai-read-more-lead';
    lead.textContent = previewText;

    const ellipsis = document.createElement('span');
    ellipsis.className = 'ai-read-more-ellipsis';
    ellipsis.setAttribute('aria-hidden', 'true');
    ellipsis.textContent = /[.!?]$/.test(previewText) ? '' : '…';

    const remainder = document.createElement('span');
    remainder.className = 'ai-read-more-rest';
    remainder.id = `ai-read-more-${index + 1}`;
    remainder.textContent = fullText.slice(previewText.length);

    // A real inline link can wrap with the paragraph instead of forming a button box.
    const toggle = document.createElement('a');
    toggle.setAttribute('href', `#${remainder.id}`);
    toggle.setAttribute('role', 'button');
    toggle.className = 'ai-read-more-toggle';
    toggle.setAttribute('aria-controls', remainder.id);

    const setExpanded = expanded => {
      paragraph.dataset.readMoreExpanded = String(expanded);
      toggle.setAttribute('aria-expanded', String(expanded));
      toggle.textContent = expanded ? 'Read less' : 'Read more';
      toggle.setAttribute('aria-label', `${toggle.textContent} about ${paragraph.dataset.aiReadMore}`);
    };

    toggle.addEventListener('click', event => {
      event.preventDefault();
      setExpanded(paragraph.dataset.readMoreExpanded !== 'true');
    });
    toggle.addEventListener('keydown', event => {
      if (event.key === ' ') {
        event.preventDefault();
        toggle.click();
      }
    });

    setExpanded(false);
    paragraph.replaceChildren(lead, ellipsis, remainder, toggle);
    paragraph.dataset.readMoreReady = 'true';
  });
})();

// A short touch viewport is a phone in landscape, even below the tablet width.
const phoneLandscapeQuery = '(orientation: landscape) and (min-width: 480px) and (max-height: 500px) and (pointer: coarse)';
const phoneLandscapeMedia = window.matchMedia(phoneLandscapeQuery);

const services = [
    {
      number: '01',
      title: 'AI EXPERTISE',
      text: "I use AI to create images, videos, and effects, enhancing footage with smart upscaling and frame interpolation. From visual effects (VFX) to fully AI-generated videos, I've developed a workflow that allows for fully customizable visuals tailored to any product or individual.",
      imagePanel: 0,
      button: '<a href="#ai" data-page="ai" class="inline-block px-4 py-2 text-xs font-semibold uppercase tracking-wider border border-black bg-black text-white hover:bg-white hover:text-black transition rounded page-link">AI Insights</a>'
    },
    {
      number: '02',
      title: 'VIDEO EDITING',
      text: 'I cover the full post-production workflow from rough cut to final export. This includes selecting and organizing footage, video editing, color grading, sound design, and mixing. I can also add motion graphics and VFX, as well as handle compositing, cleanup, and retouching.',
      imagePanel: 1,
      button: '<a href="#video-editing" class="inline-block px-4 py-2 text-xs font-semibold uppercase tracking-wider border border-black bg-black text-white hover:bg-white hover:text-black transition rounded page-link" data-page="videoEditing">Tech insights</a>'
    },
    {
      number: '03',
      title: 'MASTERCLASS',
      text: 'Want to learn how generative AI can become part of a professional production workflow? In this Masterclass, I share the complete process behind my AI projects, from prompt development and reference preparation to video generation, all the way to post-production integration.',
      imagePanel: 2,
      button: '<a href="#miscellaneous" class="inline-block px-4 py-2 text-xs font-semibold uppercase tracking-wider border border-black bg-black text-white hover:bg-white hover:text-black transition rounded page-link" data-page="miscellaneous">COMING SOON</a>'
    }
  ];

  const renderCard = (service) => `
    <article class="service-card flex flex-col bg-neutral-100 shadow-sm border border-gray-200 rounded-md overflow-hidden">
      <div class="service-visual relative h-40 lg:h-56 md:h-40 overflow-hidden">
        <img
          src="service-lightstream-connected.png"
          alt=""
          loading="lazy"
          decoding="async"
          class="service-visual__image"
          style="--service-panel: ${service.imagePanel}"
        />
      </div>
      <div class="service-card__body p-8 sm:p-4 lg:p-8 flex-1 bg-gray-100">
        <span class="service-card__number font-mono text-sm text-gray-500 mb-2 block">${service.number}</span>
        <h3 class="service-card__title text-xl font-bold text-black mb-4">${service.title}</h3>
        <p class="service-card__text text-base text-black font-light mb-4">${service.text}</p>
        <div class="service-card__actions mt-8">${service.button}</div>
      </div>
    </article>
  `;

  const swiperWrapper = document.getElementById('swiper-wrapper');
  const gridWrapper = document.getElementById('grid-wrapper');

  services.forEach(service => {
    const swiperSlide = document.createElement('div');
    swiperSlide.className = 'swiper-slide';
    swiperSlide.innerHTML = renderCard(service);
    swiperWrapper.appendChild(swiperSlide);

    const gridCard = document.createElement('div');
    gridCard.innerHTML = renderCard(service);
    gridWrapper.appendChild(gridCard.firstElementChild);
  });

  let servicesSwiper = null;
  let swiperAssetsPromise = null;
  let servicesSlideIndex = 0;
  const servicesSliderMedia = window.matchMedia(`(max-width: 639px), (min-width: 768px) and (max-width: 1199px), ${phoneLandscapeQuery}`);

  const loadSwiperAssets = () => {
    if (typeof window.Swiper === 'function') return Promise.resolve();
    if (swiperAssetsPromise) return swiperAssetsPromise;

    swiperAssetsPromise = new Promise((resolve, reject) => {
      const stylesheet = document.createElement('link');
      const script = document.createElement('script');
      let stylesheetReady = false;
      let scriptReady = false;

      const finish = () => {
        if (stylesheetReady && scriptReady && typeof window.Swiper === 'function') resolve();
      };

      stylesheet.rel = 'stylesheet';
      stylesheet.href = 'https://cdn.jsdelivr.net/npm/swiper/swiper-bundle.min.css';
      stylesheet.onload = () => {
        stylesheetReady = true;
        finish();
      };
      stylesheet.onerror = reject;

      script.src = 'https://cdn.jsdelivr.net/npm/swiper/swiper-bundle.min.js';
      script.async = true;
      script.onload = () => {
        scriptReady = true;
        finish();
      };
      script.onerror = reject;

      document.head.appendChild(stylesheet);
      document.head.appendChild(script);
    });

    return swiperAssetsPromise;
  };

  const initializeServicesSwiper = () => {
    if (servicesSwiper || !servicesSliderMedia.matches) return;

    loadSwiperAssets().then(() => {
      if (servicesSwiper || !servicesSliderMedia.matches) return;
      servicesSwiper = new window.Swiper(".mySwiper", {
      direction: "horizontal",
      initialSlide: servicesSlideIndex,
      slidesPerView: 'auto',
      spaceBetween: 12,
      speed: 420,
      threshold: 3,
      touchAngle: 45,
      resistanceRatio: 0.7,
      shortSwipes: true,
      longSwipes: true,
      longSwipesRatio: 0.18,
      watchOverflow: true,
      roundLengths: true,
      breakpoints: {
        768: { spaceBetween: 20 }
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true
      }
      });
    }).catch(() => {
      swiperAssetsPromise = null;
    });
  };

  const servicesSection = document.getElementById('services');
  let servicesObserver = null;

  const prepareServicesSwiper = () => {
    if (!servicesSliderMedia.matches || servicesSwiper || !servicesSection) return;

    if (!('IntersectionObserver' in window)) {
      initializeServicesSwiper();
      return;
    }

    if (servicesObserver) return;
    servicesObserver = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      servicesObserver.disconnect();
      servicesObserver = null;
      initializeServicesSwiper();
    }, { rootMargin: '1400px 0px' });
    servicesObserver.observe(servicesSection);
  };

  prepareServicesSwiper();
  let servicesResizeFrame = 0;
  const refreshServicesLayout = () => {
    if (servicesResizeFrame) return;
    servicesResizeFrame = requestAnimationFrame(() => {
      servicesResizeFrame = 0;
      if (!servicesSliderMedia.matches) {
        servicesObserver?.disconnect();
        servicesObserver = null;
        if (servicesSwiper) {
          servicesSlideIndex = servicesSwiper.activeIndex;
          servicesSwiper.destroy(true, true);
          servicesSwiper = null;
        }
      } else if (servicesSwiper) {
        const index = servicesSwiper.activeIndex;
        servicesSwiper.update();
        servicesSwiper.slideTo(index, 0, false);
      } else {
        prepareServicesSwiper();
      }
    });
  };
  servicesSliderMedia.addEventListener('change', refreshServicesLayout);
  phoneLandscapeMedia.addEventListener('change', refreshServicesLayout);
  window.addEventListener('resize', refreshServicesLayout, { passive: true });

  const projectPlayerPromises = new WeakMap();
  const selectedWorkThumbnailOverrides = {
    '1187212934': 'audi-q5-thumbnail-20260730.jpg'
  };
  let vimeoApiReadyPromise = null;

  function waitForVimeoApi() {
    if (window.Vimeo && Vimeo.Player) return Promise.resolve();
    if (vimeoApiReadyPromise) return vimeoApiReadyPromise;

    vimeoApiReadyPromise = new Promise((resolve, reject) => {
      let attempts = 0;
      const check = () => {
        if (window.Vimeo && Vimeo.Player) {
          resolve();
          return;
        }
        attempts += 1;
        if (attempts >= 200) {
          reject(new Error('Vimeo Player API did not load.'));
          return;
        }
        setTimeout(check, 100);
      };
      check();
    });

    return vimeoApiReadyPromise;
  }

  function getFrameSource(frame) {
    return frame.dataset.src || frame.getAttribute('src') || '';
  }

  function assignFrameSource(frame) {
    const source = getFrameSource(frame);
    if (source && !frame.getAttribute('src')) {
      frame.classList.remove('is-loaded');
      frame.addEventListener('load', () => frame.classList.add('is-loaded'), { once: true });
      frame.setAttribute('src', source);
    }
    return source;
  }

  function getProjectPlayer(frame) {
    if (projectPlayerPromises.has(frame)) {
      return projectPlayerPromises.get(frame);
    }

    assignFrameSource(frame);
    const playerPromise = waitForVimeoApi().then(() => {
      const player = new Vimeo.Player(frame);
      player.setVolume(0).catch(() => {});

      const placeholder = frame._videoPlaceholder;
      if (placeholder) {
        const fadeOut = () => {
          if (!placeholder.isConnected) return;
          placeholder.classList.add('hide');
          setTimeout(() => placeholder.remove(), 500);
        };

        player.on('play', fadeOut);
        player.on('loaded', () => {
          if (frame.closest('#portfolio')) {
            setTimeout(fadeOut, 180);
            return;
          }

          player.getPaused().then(paused => {
            if (!paused) fadeOut();
          }).catch(() => {});
        });
      }

      return player;
    });

    projectPlayerPromises.set(frame, playerPromise);
    return playerPromise;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const projectFrames = document.querySelectorAll(
      '#portfolio iframe[data-src*="vimeo.com"], #ai-page iframe[data-src*="vimeo.com"]'
    );
    const desktopSelectedWork = window.matchMedia('(min-width: 768px)');

    const loadFrame = frame => {
      const shouldLoadPlaceholder =
        !frame.closest('#portfolio') || window.matchMedia('(max-width: 767px)').matches;
      if (shouldLoadPlaceholder && typeof frame._loadVideoPlaceholder === 'function') {
        frame._loadVideoPlaceholder();
      }
      assignFrameSource(frame);
      getProjectPlayer(frame).catch(() => {});
    };

    if (!('IntersectionObserver' in window)) {
      projectFrames.forEach(loadFrame);
      return;
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        loadFrame(entry.target);
      });
    }, { rootMargin: '900px 0px', threshold: 0.01 });

    projectFrames.forEach(frame => {
      if (desktopSelectedWork.matches && frame.closest('#portfolio')) {
        loadFrame(frame);
      } else {
        observer.observe(frame);
      }
    });

    const loadSelectedWorkOnDesktop = event => {
      if (!event.matches) return;
      document.querySelectorAll('#portfolio iframe[data-src*="vimeo.com"]').forEach(frame => {
        observer.unobserve(frame);
        loadFrame(frame);
      });
    };
    if (desktopSelectedWork.addEventListener) {
      desktopSelectedWork.addEventListener('change', loadSelectedWorkOnDesktop);
    } else {
      desktopSelectedWork.addListener(loadSelectedWorkOnDesktop);
    }
  });

 /* JS bei DOMContentLoaded laden, um Render-Blocking zu reduzieren */
    document.addEventListener('DOMContentLoaded', function() {
      /* Page-Switching & Active-Link */
     const pageLinks = document.querySelectorAll('.page-link');
    const mainPage = document.getElementById('main-page');
    const imagesPage = document.getElementById('images-page');
    const impressumPage = document.getElementById('impressum-page');
    const agbPage = document.getElementById('agb-page');
    const datenschutzPage = document.getElementById('datenschutz-page');
    const aiPage = document.getElementById('ai-page');
    const videoEditingPage = document.getElementById('video-editing-page');
    const miscellaneousPage = document.getElementById('miscellaneous-page');
    const masterclassAccessPage = document.getElementById('masterclass-access-page');

    
    const hideAllPages = () => {
      mainPage.style.display = "none";
      imagesPage.style.display = "none";
      aiPage.style.display = "none";
      impressumPage.style.display = "none";
      agbPage.style.display = "none";
      datenschutzPage.style.display = "none";
      videoEditingPage.style.display = "none";
      miscellaneousPage.style.display = "none";
      masterclassAccessPage.style.display = "none";
    };
    
  // ─── COPY-PASTE ab hier ───────────────────────────────────────────
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

let currentPageName = 'main';
let pageSwitchVersion = 0;
let pendingPageScrollFrame = 0;
let pendingPageScrollTimer = 0;
let isHandlingPopstate = false;

const isMobilePageNavigation = () =>
  window.matchMedia('(max-width: 767px), (pointer: coarse)').matches;

const getPageScroller = () => {
  const body = document.body;
  // Mit height: 100% und overflow-x: hidden ist der Body ein eigener
  // Scrollbereich. Andere Browser/Layouts können das Dokument scrollen.
  const overflowY = getComputedStyle(body).overflowY;
  if (body !== document.scrollingElement &&
      /^(auto|scroll)$/.test(overflowY) && body.scrollHeight > body.clientHeight) {
    return body;
  }
  return document.scrollingElement || document.documentElement;
};

const beginPageSwitch = () => {
  pageSwitchVersion += 1;
  cancelAnimationFrame(pendingPageScrollFrame);
  clearTimeout(pendingPageScrollTimer);

  // Stoppt einen noch laufenden nativen Smooth-Scroll, bevor sich die
  // Dokumenthöhe durch das Ein-/Ausblenden einer Seite verändert.
  const scroller = getPageScroller();
  scroller.scrollTo({ top: scroller.scrollTop, left: 0, behavior: 'auto' });
  return pageSwitchVersion;
};

const scrollPageTarget = (target, { smooth, stabilize, version, pageStart = false }) => {
  if (!target) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const applyPosition = behavior => {
    if (version !== pageSwitchVersion) return;
    const scroller = getPageScroller();
    let top = 0;
    if (!pageStart) {
      // Erst das neue Layout messen, dann die aktuelle Scrollposition lesen.
      const targetRect = target.getBoundingClientRect();
      const scrollportTop = scroller === document.scrollingElement ? 0 :
        scroller.getBoundingClientRect().top + scroller.clientTop;
      const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
      top = Math.max(0, scroller.scrollTop + targetRect.top - scrollportTop - margin);
    }
    scroller.scrollTo({ top, left: 0, behavior });
  };
  const applyStablePosition = () => applyPosition('auto');

  if (stabilize) {
    // iOS kann Scroll-Momentum noch kurz nach einem Tap weiterführen.
    // Sofort, im nächsten Frame und nochmals nach 100 ms setzen verhindert,
    // dass eine kürzere Unterseite am Footer hängen bleibt.
    applyStablePosition();
    pendingPageScrollFrame = requestAnimationFrame(() => {
      if (version !== pageSwitchVersion) return;
      applyStablePosition();
      pendingPageScrollTimer = window.setTimeout(applyStablePosition, 100);
    });
    return;
  }

  pendingPageScrollFrame = requestAnimationFrame(() => {
    applyPosition(smooth && !reducedMotion ? 'smooth' : 'auto');
  });
};

pageLinks.forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    const page = this.dataset.page;
    const nextPageName = page || 'main';
    const isCrossPage = currentPageName !== nextPageName;
    const switchVersion = beginPageSwitch();

    /* ------------------------------------------------------------
       SEITE UMSCHALTEN
    ------------------------------------------------------------ */
    setMobileMenu(false);
    if (isCrossPage) hideAllPages();

    // Einblenden
    const targetPage = ({
      images:        imagesPage,
      ai:            aiPage,
      impressum:     impressumPage,
      agb:           agbPage,
      datenschutz:   datenschutzPage,
      videoEditing:  videoEditingPage,
      miscellaneous: miscellaneousPage,
      masterclassAccess: masterclassAccessPage,
      main:          mainPage,    // "WORK" / "ABOUT" / "SERVICES" usw.
      undefined:     mainPage     // Fallback
    }[page]);
    targetPage.style.display = 'block';
    currentPageName = nextPageName;

    /* ------------------------------------------------------------
       SCROLL-LOGIK
       Tech, AI und Masterclass beginnen am Seitenanfang.
       Main-Sektionen berücksichtigen den Abstand zur festen Navigation.
    ------------------------------------------------------------ */
    if (page === 'main' || page === undefined) {
      // Link zeigt auf #about, #portfolio, #services …
      const target = document.querySelector(this.getAttribute('href'));
      scrollPageTarget(target, {
        smooth: true,
        stabilize: isMobilePageNavigation() && isCrossPage,
        version: switchVersion
      });
    } else {
      const smoothPageStart = ['ai', 'videoEditing', 'miscellaneous'].includes(page);
      scrollPageTarget(targetPage, {
        smooth: smoothPageStart,
        stabilize: isMobilePageNavigation() && isCrossPage,
        version: switchVersion,
        pageStart: true
      });
    }

    /* ------------------------------------------------------------
       NAV-Status & Hash
    ------------------------------------------------------------ */
    document.querySelectorAll('.nav-link')
            .forEach(n => n.classList.remove('active'));
    const activePage = page === 'masterclassAccess' ? 'miscellaneous' : page;
    document.querySelectorAll('.nav-link').forEach(nav => {
      const matches = nextPageName === 'main' ?
        nav.getAttribute('href') === this.getAttribute('href') : nav.dataset.page === activePage;
      if (matches) nav.classList.add('active');
    });

    langSwitcher.style.display =
      ['impressum','agb','datenschutz'].includes(page) ? 'none' : 'block';

    if (!isHandlingPopstate) {
      history.pushState(null, '', this.getAttribute('href'));
    }

  });
});

/* --------------------------------------------------------------
   BROWSER-VOR/ZURÜCK
-------------------------------------------------------------- */
window.addEventListener('popstate', () => {
  const hash = location.hash || '#home';

  const link = document.querySelector(`.page-link[href="${hash}"]`);
  if (link) {
    isHandlingPopstate = true;
    link.click();
    isHandlingPopstate = false;
  } else {
    const switchVersion = beginPageSwitch();
    setMobileMenu(false);
    hideAllPages();
    mainPage.style.display = 'block';
    currentPageName = 'main';
    scrollPageTarget(mainPage, {
      smooth: false,
      stabilize: isMobilePageNavigation(),
      version: switchVersion,
      pageStart: true
    });
  }
});
// ─── COPY-PASTE Ende ───────────────────────────────────────────



      /* Logo klick → Main-Page anzeigen und nach oben scrollen */
const homeLink = document.getElementById('homeLink');
homeLink.addEventListener('click', e => {
  e.preventDefault();
  const isCrossPage = currentPageName !== 'main';
  const switchVersion = beginPageSwitch();
  setMobileMenu(false);
  // alle Unterseiten ausblenden und Hauptseite zeigen
  if (isCrossPage) hideAllPages();
  mainPage.style.display = 'block';
  currentPageName = 'main';

  // Der Hero hat keinen eigenen Menüpunkt: beim Namensklick alle abwählen.
  document.querySelectorAll('.nav-link').forEach(nav => nav.classList.remove('active'));

  // Desktop bleibt weich; Mobil wird bei einem Seitenwechsel stabil auf
  // den Seitenanfang gesetzt, damit kein Scroll-Momentum übernommen wird.
  scrollPageTarget(mainPage, {
    smooth: true,
    stabilize: isMobilePageNavigation() && isCrossPage,
    version: switchVersion,
    pageStart: true
  });

  // URL-Hash setzen
  history.pushState(null, '', '#home');

});

      /* Video Loading - Optimiert */
      function getVisibleIframe(){
        const d = document.querySelector('.desktop-iframe');
        return window.getComputedStyle(d).display !== 'none' ? d : document.querySelector('.mobile-iframe');
      }
     
/* --------------------------------------------------
   Overscan‑Steuerung fürs Desktop‑Iframe
   -------------------------------------------------- */
function updateDesktopIframeScale(){
  const iframe = document.querySelector('.desktop-iframe');
  if (!iframe) return;
  if (getComputedStyle(iframe).display === 'none') return;

  const VIDEO_RATIO = 16/9;
  const TOLERANCE   = 0.05;
  const EXTRA       = 1.0;    // 30% für Tablets/Ultra-Wide

  // On a short landscape phone the hero may be taller than the visible area.
  // Cover its actual box, including after Safari finishes rotating.
  const hero = iframe.closest('#home');
  const vw = phoneLandscapeMedia.matches ? hero.clientWidth : window.innerWidth;
  const vh = phoneLandscapeMedia.matches ? hero.clientHeight : window.innerHeight;
  const r  = vw / vh;
  const isNearly169 = Math.abs(r - VIDEO_RATIO) < VIDEO_RATIO * TOLERANCE;

  if (isNearly169) {
    // Desktop (16:9 ±5%) jetzt mit 20% Overscan
    iframe.style.transform = 'translate(-50%, -50%) scale(1.0)';
  } else {
    // Alle anderen Geräte weiterhin „dynamisch +30%“
    const baseScale = r > VIDEO_RATIO
      ? r / VIDEO_RATIO
      : VIDEO_RATIO / r;
    iframe.style.transform =
      `translate(-50%, -50%) scale(${baseScale * EXTRA})`;
  }
}

      /* Smooth scroll für Anker-Links */
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        if(!anchor.classList.contains('page-link') && !anchor.classList.contains('ai-read-more-toggle') && anchor !== homeLink){
          anchor.addEventListener('click', function(e){
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({behavior:'smooth'});
          });
        }
      });

      /* Mobile Menu */
      const mobileMenuButton = document.getElementById('mobileMenuButton');
      const mobileMenu = document.getElementById('mobileMenu');
      function setMobileMenu(open) {
        mobileMenu.classList.toggle('hidden', !open);
        mobileMenuButton.setAttribute('aria-expanded', String(open));
        mobileMenuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
        const icon = mobileMenuButton.querySelector('.mobile-menu-icon');
        if (icon) {
          icon.classList.toggle('is-open', open);
        }
      }

      mobileMenuButton.addEventListener('click', () => {
        setMobileMenu(mobileMenu.classList.contains('hidden'));
      });
      document.querySelectorAll('#mobileMenu a').forEach(link => {
        link.addEventListener('click', () => setMobileMenu(false));
      });
      document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
          setMobileMenu(false);
          mobileMenuButton.focus();
        }
      });

      /* Images Popup */
      const continueBtn = document.getElementById('continue-btn');
      if(continueBtn){
        const popupOverlay = document.getElementById('popup-overlay');
        const blurOverlay = document.getElementById('blur-overlay');
        continueBtn.addEventListener('click', () => {
          popupOverlay.classList.add('hide');
          blurOverlay.classList.add('hide');
          setTimeout(() => {
            popupOverlay.style.display = 'none';
            blurOverlay.style.display = 'none';
          }, 300);
        });
      }

      /* Image Modal */
      const imageModal = document.getElementById('image-modal');
      const modalImage = imageModal.querySelector('.modal-image');
      const imageModalClose = imageModal.querySelector('.image-modal-close');
      let imageModalTrigger = null;

      function closeImageModal() {
        imageModal.classList.remove('active');
        imageModal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
        modalImage.removeAttribute('src');
        if (imageModalTrigger) imageModalTrigger.focus();
      }

      document.querySelectorAll('#images-page .portfolio-item img, #ai-page .portfolio-item img').forEach(img => {
        img.tabIndex = 0;
        img.setAttribute('role', 'button');
        img.setAttribute('aria-label', `Open image: ${img.alt || 'project still'}`);
        const openImageModal = () => {
          imageModalTrigger = img;
          modalImage.src = img.currentSrc || img.src;
          modalImage.alt = img.alt || 'Expanded project image';
          imageModal.classList.add('active');
          imageModal.setAttribute('aria-hidden', 'false');
          document.body.classList.add('modal-open');
          imageModalClose.focus();
        };
        img.addEventListener('click', openImageModal);
        img.addEventListener('keydown', event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openImageModal();
          }
        });
      });
      imageModalClose.addEventListener('click', closeImageModal);
      imageModal.addEventListener('click', event => {
        if (event.target === imageModal || event.target.classList.contains('modal-overlay')) closeImageModal();
      });
      document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && imageModal.classList.contains('active')) closeImageModal();
      });

      /* Shuffle Images */
      function shuffleImages(){
        const grid = document.querySelector('#images-background .grid');
        if(!grid) return;
        Array.from(grid.children)
             .sort(() => Math.random() - .5)
             .forEach(el => grid.appendChild(el));
      }
      shuffleImages();

        /* ScrollSpy für Main-Page mit rootMargin, damit AI Workflow sauber aktiv wird */
  const mainSections = document.querySelectorAll('#main-page section[id]');
    // const mainSections = document.querySelectorAll(' section[id]');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // alle Nav-Links zurücksetzen
        document.querySelectorAll('.nav-link').forEach(nav => nav.classList.remove('active'));
        // passenden Link finden und markieren
        const activeNav = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
        if (activeNav) activeNav.classList.add('active');
      }
    });
  }, {
    rootMargin: '-50% 0px -50% 0px',  // feuert, wenn Section in der Mitte des Viewports ist
    threshold: 0                     // keine genaue Sichtbarkeits-% nötig
  });
 
  mainSections.forEach(sec => sectionObserver.observe(sec));

      // URL-Hash Handling für direkte Links
      if (location.hash) {
        const hash = location.hash.substring(1);
        if (hash === "impressum" || hash === "agb" || hash === "datenschutz" || hash === "images" ||
            hash === "masterclass-access") {
          hideAllPages();
          currentPageName = hash === 'masterclass-access' ? 'masterclassAccess' : hash;
          if (hash === "images") {
            imagesPage.style.display = "block";
          } else if (hash === "impressum") {
            impressumPage.style.display = "block";
          } else if (hash === "agb") {
            agbPage.style.display = "block";
          } else if (hash === "datenschutz") {
            datenschutzPage.style.display = "block";
          } else if (hash === "masterclass-access") {
            masterclassAccessPage.style.display = "block";
          }
        }
      }
      /* --- Desktop‑Iframe skalieren --- */
      updateDesktopIframeScale();                                      // sofort ausführen
      window.addEventListener('resize',            updateDesktopIframeScale, {passive:true});
      window.addEventListener('orientationchange', () => {
        requestAnimationFrame(updateDesktopIframeScale);
        setTimeout(updateDesktopIframeScale, 250);
      });
      phoneLandscapeMedia.addEventListener('change', updateDesktopIframeScale);
    });


  const langSwitcher = document.getElementById('lang-switcher');

  // 5 Sekunden nach DOM-Laden einblenden
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      langSwitcher.classList.add('visible');
    }, 5000);
  });

  // Klick-Handler für den Toggle
  langSwitcher.addEventListener('click', () => {
    langSwitcher.classList.toggle('de-active');
  });


document.addEventListener('DOMContentLoaded', () => {
  let didReveal = false;
  const introOverlay = document.querySelector('.intro-overlay');
  const heroEditorial = document.querySelector('.hero-editorial');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktopIntroMedia = window.matchMedia('(min-width: 768px)');
  const isDesktopIntro = () => desktopIntroMedia.matches && !phoneLandscapeMedia.matches;

  function showHeroImmediately() {
    didReveal = true;
    document.documentElement.classList.add('intro-skip', 'hero-instant');
    document.body.classList.remove('intro-active');
    heroEditorial?.classList.remove('hero-animate');
    heroEditorial?.classList.add('hero-revealed', 'hero-interactive');
    introOverlay?.remove();
  }

  // Also finish a running phone intro immediately if the viewport becomes
  // desktop/tablet. Resizing back must not replay the entrance animation.
  const syncIntroLayout = () => {
    if (isDesktopIntro()) showHeroImmediately();
  };
  desktopIntroMedia.addEventListener('change', syncIntroLayout);
  phoneLandscapeMedia.addEventListener('change', syncIntroLayout);

  if (prefersReducedMotion || isDesktopIntro()) {
    showHeroImmediately();
    return;
  }

  if (heroEditorial && !prefersReducedMotion) {
    heroEditorial.classList.add('hero-animate');
  }

  function revealContent(immediate = false) {
    if (didReveal) return;
    didReveal = true;
    document.body.classList.remove('intro-active');

    if (heroEditorial && !prefersReducedMotion) {
      const revealHero = () => {
        heroEditorial.classList.add('hero-revealed');
        setTimeout(() => heroEditorial.classList.add('hero-interactive'), 1200);
      };
      if (immediate) {
        requestAnimationFrame(() => requestAnimationFrame(revealHero));
      } else {
        setTimeout(revealHero, 420);
      }
    }

    if (introOverlay) {
      if (immediate) {
        introOverlay.remove();
      } else {
        introOverlay.classList.add('slide-out');
        const removeOverlay = () => introOverlay.remove();
        introOverlay.addEventListener('transitionend', removeOverlay, { once: true });
        setTimeout(removeOverlay, 1200);
      }
    }
  }

  const skipIntro = prefersReducedMotion || !introOverlay;
  if (skipIntro) {
    revealContent(true);
  } else {
    document.body.classList.add('intro-active');
    setTimeout(() => revealContent(), 1200);
  }
});
/*
layer.addEventListener('click', () => {
  plyr.classList.remove('ready');
  plyr.src = `https://player.vimeo.com/video/${id}?dnt=1&autoplay=1`;
  box.classList.add('show');
});*/

// Keep each responsive hero player alive; removing src invalidates Vimeo's
// cached player/ready state when the same iframe is selected again.
document.addEventListener('DOMContentLoaded', function() {
  const desktopIframe = document.querySelector('.desktop-iframe');
  const mobileIframe = document.querySelector('.mobile-iframe');
  const mobileFallback = document.querySelector('.mobile-fallback');
  const hero = document.getElementById('home');
  const mobileMedia = window.matchMedia('(max-width: 767px)');
  if (!desktopIframe || !mobileIframe) return;

  const states = [desktopIframe, mobileIframe].map(frame => ({
    frame,
    playerPromise: null,
    commands: Promise.resolve(),
    revision: 0
  }));
  let activeState = null;
  let revealTimer = null;

  const showMobileFallback = () => {
    if (activeState?.frame !== mobileIframe) return;
    if (revealTimer) {
      clearTimeout(revealTimer);
      revealTimer = null;
    }
    mobileIframe.classList.remove('is-ready');
    if (mobileFallback) mobileFallback.classList.remove('is-hidden');
  };

  const revealVideo = state => {
    if (activeState !== state) return;
    state.frame.classList.add('is-ready');
    if (state.frame === mobileIframe && mobileFallback) {
      mobileFallback.classList.add('is-hidden');
    }
  };

  const getHeroPlayer = state => {
    if (state.playerPromise) return state.playerPromise;
    assignFrameSource(state.frame);
    state.playerPromise = waitForVimeoApi().then(() => {
      const player = new Vimeo.Player(state.frame);
      player.on('playing', () => {
        // Autoplay may finish loading after this iframe becomes inactive.
        if (activeState !== state) syncPlayback(state);
        else if (state.frame === desktopIframe) revealVideo(state);
      });
      player.on('timeupdate', data => {
        if (activeState !== state || !data || data.seconds <= 0.2) return;
        if (state.frame.classList.contains('is-ready')) return;
        if (state.frame === desktopIframe) {
          revealVideo(state);
          return;
        }
        if (revealTimer) return;
        const revision = state.revision;
        revealTimer = setTimeout(() => {
          revealTimer = null;
          player.getPaused().then(paused => {
            if (activeState !== state || revision !== state.revision) return;
            if (paused) showMobileFallback();
            else revealVideo(state);
          }).catch(() => {
            if (activeState === state && revision === state.revision) showMobileFallback();
          });
        }, 250);
      });
      const handleMobileStop = () => {
        if (activeState === state && state.frame === mobileIframe) showMobileFallback();
      };
      player.on('pause', handleMobileStop);
      player.on('error', handleMobileStop);
      return player.ready().then(() => player);
    });
    return state.playerPromise;
  };

  const syncPlayback = state => {
    const revision = ++state.revision;
    // Only load a second video if that layout is actually visited.
    if (activeState !== state && !state.playerPromise) return;
    state.commands = state.commands.then(async () => {
      if (revision !== state.revision) return;
      const player = await getHeroPlayer(state);
      if (revision !== state.revision) return;
      // Serialize commands so a delayed pause cannot overtake a newer play.
      if (activeState === state) {
        await player.play();
        if (revision === state.revision && state.frame === desktopIframe) revealVideo(state);
      } else {
        await player.pause();
      }
    }).catch(() => {
      if (activeState === state && revision === state.revision && state.frame === mobileIframe) {
        showMobileFallback();
      }
    });
  };

  const loadResponsiveHero = () => {
    const nextState = states[mobileMedia.matches && !phoneLandscapeMedia.matches ? 1 : 0];
    if (activeState === nextState) return;
    if (revealTimer) {
      clearTimeout(revealTimer);
      revealTimer = null;
    }
    activeState = nextState;
    // Keep the last rendered frame during a switch instead of flashing black.
    states.forEach(syncPlayback);
  };

  loadResponsiveHero();
  for (const media of [mobileMedia, phoneLandscapeMedia]) {
    if (media.addEventListener) media.addEventListener('change', loadResponsiveHero);
    else media.addListener(loadResponsiveHero);
  }

  // Orientation events can arrive before Safari updates the viewport. Check
  // again after layout and on the later resize, without reloading either iframe.
  let responsiveFrame = 0;
  let orientationTimer = null;
  const scheduleResponsiveHero = () => {
    if (responsiveFrame) return;
    responsiveFrame = requestAnimationFrame(() => {
      responsiveFrame = 0;
      loadResponsiveHero();
    });
  };
  window.addEventListener('resize', scheduleResponsiveHero, { passive: true });
  window.visualViewport?.addEventListener('resize', scheduleResponsiveHero, { passive: true });
  window.addEventListener('orientationchange', () => {
    scheduleResponsiveHero();
    clearTimeout(orientationTimer);
    orientationTimer = setTimeout(scheduleResponsiveHero, 250);
  });

  // iOS can suspend an offscreen video during the switch. Resume the selected
  // player when the hero returns, including returning from another page/tab.
  let heroVisible = true;
  const resumeVisibleHero = () => {
    loadResponsiveHero();
    if (heroVisible && !document.hidden && activeState) syncPlayback(activeState);
  };
  if (hero && 'IntersectionObserver' in window) {
    const heroObserver = new IntersectionObserver(entries => {
      const wasVisible = heroVisible;
      heroVisible = entries.some(entry => entry.isIntersecting);
      if (heroVisible && !wasVisible) resumeVisibleHero();
    });
    heroObserver.observe(hero);
  }
  window.addEventListener('pageshow', resumeVisibleHero);
  document.addEventListener('visibilitychange', resumeVisibleHero);
});


document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------------------
     Welche Iframes?  – Passe die Selector‑Liste bei Bedarf an
     --------------------------------------------------------------- */
  const iframes = document.querySelectorAll(
  '#portfolio iframe[data-src*="vimeo.com"], #ai-page iframe[data-src*="vimeo.com"]'
  );

  iframes.forEach(frame => {
    /* 1) ID + (falls vorhanden) HASH aus der src ziehen ------------- */
    const frameSource = getFrameSource(frame);
    const urlMatch = frameSource.match(/\/video\/(\d+)(?:\?[^#]*h=([a-z0-9]+))?/i);
    if (!urlMatch) return;                             // Safety‑Stop

    const id   = urlMatch[1];                // „1098650054“
    const hash = urlMatch[2] || '';          // „6266b2155c“ (bei unlisted) oder ''

    /* 2) Platzhalter‑Div ins Wrapper‑Element einsetzen -------------- */
    const wrapper = frame.parentElement;
    wrapper.style.position = 'relative';

    const ph = document.createElement('div');
    ph.className = 'video-placeholder';      // ➜ siehe CSS-Snippet unten
    const isSelectedWork = Boolean(frame.closest('#portfolio'));
    const localSelectedThumbnail = isSelectedWork
      ? selectedWorkThumbnailOverrides[id] || ''
      : '';
    if (isSelectedWork) ph.classList.add('selected-work-thumbnail');
    wrapper.appendChild(ph);
    frame._videoPlaceholder = ph;

    /* 3) Thumbnail‑URL bauen – unlisted =  ID:HASH ------------------ */
    const thumbId = hash ? `${id}:${hash}` : id;
    const cdnUrl  = `https://vumbnail.com/${thumbId}.jpg`;
    const cfgUrlBase = `https://player.vimeo.com/video/${id}/config` + (hash ? `?h=${hash}` : '');
    const cfgUrl = `${cfgUrlBase}${cfgUrlBase.includes('?') ? '&' : '?'}cache_bust=20260730-1`;

    const loadCurrentVimeoThumbnail = () =>
      fetch(cfgUrl, { cache: 'no-store' })
        .then(response => response.ok ? response.json() : Promise.reject())
        .then(cfg => {
          const thumbs = cfg.video.thumbs || {};
          const numericWidths = Object.keys(thumbs)
            .map(Number)
            .filter(Number.isFinite)
            .sort((a, b) => a - b);
          const largest = numericWidths.length
            ? thumbs[String(numericWidths[numericWidths.length - 1])]
            : thumbs[Object.keys(thumbs).pop()];
          if (!largest) return Promise.reject();
          ph.style.backgroundImage = `url("${largest}")`;
        });

    /* 4) Bild testen – wenn es lädt → als BG setzen,
          sonst Fallback über player‑config versuchen                */
    frame._loadVideoPlaceholder = () => {
      if (frame._videoPlaceholderLoading) return;
      frame._videoPlaceholderLoading = true;

      if (isSelectedWork) {
        if (localSelectedThumbnail) {
          setPlaceholder(ph, localSelectedThumbnail, () => {
            loadCurrentVimeoThumbnail()
              .catch(() => setPlaceholder(ph, `${cdnUrl}?cache_bust=20260730-1`, () => {}));
          });
          return;
        }

        loadCurrentVimeoThumbnail()
          .catch(() => setPlaceholder(ph, `${cdnUrl}?cache_bust=20260730-1`, () => {}));
        return;
      }

      setPlaceholder(ph, cdnUrl, () => loadCurrentVimeoThumbnail().catch(() => {}));
    };

    if (isSelectedWork) {
      const mobileSelectedWork = window.matchMedia('(max-width: 767px)');
      if (mobileSelectedWork.matches) frame._loadVideoPlaceholder();

      const loadMobileThumbnail = event => {
        if (event.matches) frame._loadVideoPlaceholder();
      };
      if (mobileSelectedWork.addEventListener) {
        mobileSelectedWork.addEventListener('change', loadMobileThumbnail);
      } else {
        mobileSelectedWork.addListener(loadMobileThumbnail);
      }
    }

  });

  /* Helper: Bild laden oder Fehler‑Callback auslösen ----------------- */
  function setPlaceholder(el, url, onError) {
    el.style.backgroundImage = `url("${url}")`;
    const img = new Image();
    img.onerror = onError;
    img.src = url;
  }

});


document.addEventListener('DOMContentLoaded', () => {

  /* ── Grundeinstellungen ────────────────────────────────────── */
  const STEP = 20;
  const BASE_R = 2;
  const MAX_R = 6;
  const FALLOFF = 185;
  const BASE_ALPHA = 0.65;
  const MAX_ALPHA = 1;
  const GROW_EASE = 0.16;
  const RETURN_EASE = 0.075;
  const BRIGHTNESS_EASE = 0.11;

  /* Initialisiert genau ein Canvas ----------------------------- */
  function initGrid(canvas){
    const ctx   = canvas.getContext('2d');
    let dots    = [];
    let mouse   = { x: 1e9, y: 1e9 };
    let animationFrame = null;
    let isVisible = false;
    let isIntersecting = false;

    /* Größe & Punkte berechnen --------------------------------- */
    function resize(){
      const r = canvas.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;  // Seite evtl. noch hidden

      const d = window.devicePixelRatio || 1;
      canvas.width  = r.width  * d;
      canvas.height = r.height * d;
      ctx.setTransform(d,0,0,d,0,0);

      dots = [];
      for (let y = STEP/2; y < r.height; y += STEP){
        for (let x = STEP/2; x < r.width;  x += STEP){
          dots.push({ x, y, radius: BASE_R, alpha: BASE_ALPHA });
        }
      }
    }

    /* Zeichen-Loop --------------------------------------------- */
    function draw(){
      /* Falls das Canvas erst jetzt sichtbar wurde … */
      if (canvas.width === 0 || canvas.height === 0) resize();

      ctx.clearRect(0,0,canvas.width,canvas.height);

      dots.forEach(p => {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.hypot(dx,dy);
        const t = Math.exp(-dist / FALLOFF);
        const targetR = BASE_R + (MAX_R - BASE_R) * t;
        const targetAlpha = BASE_ALPHA + (MAX_ALPHA - BASE_ALPHA) * t;
        const radiusEase = targetR > p.radius ? GROW_EASE : RETURN_EASE;

        p.radius += (targetR - p.radius) * radiusEase;
        p.alpha += (targetAlpha - p.alpha) * BRIGHTNESS_EASE;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.fill();
      });
      animationFrame = isVisible && !document.hidden
        ? requestAnimationFrame(draw)
        : null;
    }

    function startDrawing(){
      if (animationFrame !== null || document.hidden) return;
      isVisible = true;
      animationFrame = requestAnimationFrame(draw);
    }

    function stopDrawing(){
      isVisible = false;
      mouse.x = mouse.y = 1e9;
      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
    }

    /* Maus / Touch global erfassen ------------------------------ */
    function setMouse(e){
      if (!isVisible) return;
      const rect = canvas.getBoundingClientRect();
      const ev   = e.touches ? e.touches[0] : e;
      mouse.x = ev.clientX - rect.left;
      mouse.y = ev.clientY - rect.top;
    }

    window.addEventListener('mousemove', setMouse, { passive:true });
    window.addEventListener('touchmove', setMouse, { passive:true });
    window.addEventListener('mouseleave', () => { mouse.x = mouse.y = 1e9; });
    window.addEventListener('resize',  resize,   { passive:true });

    /* auch beim Umschalten der Unterseiten neu vermessen */
    document.addEventListener('pagechange', resize);

    /* Nur zeichnen, wenn das Raster tatsächlich sichtbar ist. */
    resize();
    if ('IntersectionObserver' in window) {
      const visibilityObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          isIntersecting = entry.isIntersecting;
          entry.isIntersecting ? startDrawing() : stopDrawing();
        });
      }, { rootMargin: '100px 0px' });
      visibilityObserver.observe(canvas);
    } else {
      isIntersecting = true;
      startDrawing();
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopDrawing();
      } else if (isIntersecting) {
        startDrawing();
      }
    });
  }

  /* alle Canvas initialisieren --------------------------------- */
  document.querySelectorAll('.magnet-grid').forEach(initGrid);

  /* ======= Hook an dein bestehendes Page-Switching ============ */
  function firePageChange(){
    /* auf die nächste Paint-Phase warten, damit display:block
       schon gesetzt ist – dann neu vermessen */
    requestAnimationFrame(() =>
      document.dispatchEvent(new Event('pagechange'))
    );
  }
  document.querySelectorAll('.page-link')
          .forEach(l => l.addEventListener('click', firePageChange));
});


document.addEventListener('DOMContentLoaded', () => {
  const box   = document.getElementById('video-lightbox');
  const close = box.querySelector('.close-btn');
  const plyr  = document.getElementById('lightbox-player');
  const stage = box.querySelector('.video-lightbox-stage');
  const hoverPlayback = window.matchMedia('(hover: hover) and (pointer: fine)');
  let videoTrigger = null;
  let playbackSession = 0;
  let revealTimer = null;

  function revealPlayer(session) {
    if (session !== playbackSession || !box.classList.contains('show')) return;
    clearTimeout(revealTimer);
    revealTimer = null;
    stage.classList.add('is-ready');
  }

  function schedulePlayerReveal(session, delay) {
    clearTimeout(revealTimer);
    revealTimer = setTimeout(() => revealPlayer(session), delay);
  }

  /* Uncover Vimeo as soon as the iframe loads; audio must not run behind a timed cover. */
  plyr.addEventListener('load', () => {
    if (!plyr.src.includes('player.vimeo.com/video/')) return;
    revealPlayer(playbackSession);
  });

  /* === Klick- & Hover-Layer über jedes Portfolio-Video === */
  document.querySelectorAll('#portfolio .video-hover > div, #ai-page .video-hover > div').forEach(wrapper => {
    const frame = wrapper.querySelector('iframe');
    if (!frame) return;

    let hoverPlayer = null;

    /* 2) transparente Schicht erzeugen */
    const layer = document.createElement('div');
    layer.style.cssText = 'position:absolute;inset:0;cursor:pointer;';
    layer.tabIndex = 0;
    layer.setAttribute('role', 'button');
    layer.setAttribute('aria-label', 'Play project video');
    wrapper.appendChild(layer);

    /* --- Hover: abspielen / pausieren ------------------- */
    layer.addEventListener('mouseenter', () => {
      if (!hoverPlayback.matches) return;
      getProjectPlayer(frame).then(player => {
        hoverPlayer = player;
        player.play().catch(() => {});
      }).catch(() => {});
    });
    layer.addEventListener('mouseleave', () => {
      if (hoverPlayer) hoverPlayer.pause().catch(() => {});
    });

    /* --- Klick: Lightbox öffnen ------------------------- */
    const frameUrl = new URL(getFrameSource(frame), window.location.href);
    const videoId = frame.dataset.vimeoId || frameUrl.pathname.split('/').filter(Boolean).pop();
    const videoHash = frame.dataset.vimeoHash || frameUrl.searchParams.get('h') || '';
    const id = videoHash ? `${videoId}?h=${encodeURIComponent(videoHash)}` : videoId;
    const openVideo = () => {
      videoTrigger = layer;
      playbackSession += 1;
      clearTimeout(revealTimer);
      stage.classList.remove('is-ready');
      const separator = id.includes('?') ? '&' : '?';
      box.classList.add('show');
      box.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      schedulePlayerReveal(playbackSession, 2500);
      plyr.src = `https://player.vimeo.com/video/${id}${separator}dnt=1&autoplay=1&transparent=0&playsinline=1`;
      close.focus();
    };
    layer.addEventListener('click', openVideo);
    layer.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openVideo();
      }
    });
  });

  /* Lightbox schließen */
  function closeBox(){
    if (!box.classList.contains('show')) return;
    playbackSession += 1;
    clearTimeout(revealTimer);
    revealTimer = null;
    box.classList.remove('show');
    box.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    stage.classList.remove('is-ready');
    plyr.src = '';
    if (videoTrigger) videoTrigger.focus();
  }
  close.addEventListener('click', closeBox);
  box.addEventListener('click', e => { if (e.target === box) closeBox(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && box.classList.contains('show')) closeBox();
  });
});
/* ===== Quote Ticker Data & Init (10 Items) ===== */
const QUOTES = [
  { initials: "WB", logo: "https://raw.githubusercontent.com/xStivix/website/400c625feabb65fa266a6d3d1b8f882e35f608c8/Logoassets/warner-bros.svg", logoAlt: "Warner Bros.", text: "Intrigued by your work.", author: "Curd Zachmeister (WBD)" },
  { initials: "P6", text: "Absolutely lovely stuff.", author: "Eline (Particle6 CEO)" },
  { initials: "TB", logo: "https://raw.githubusercontent.com/xStivix/website/refs/heads/main/Logoassets/dor-brothers.png", logoAlt: "The Dor Brothers", text: "Great attention to detail.", author: "The Dor Brothers" },
  { initials: "KT", logo: "https://raw.githubusercontent.com/xStivix/website/refs/heads/main/Logoassets/martini-icon.png", logoAlt: "Martini", logoClass: "quote-brand-invert", text: "One of the best AI Filmmakers.", author: "Koh Terai (Martini)" },
  { initials: "PJ", text: "Love the work.", author: "PJ Accetturo (Director)" },
  { initials: "JS", text: "When it comes to AI you seem to be ahead of everyone else.", author: "Johan Sugarev (Sound Designer)" },
  { initials: "ML", text: "Impressed by your work.", author: "(MotherLA)" },
  { initials: "OA", logo: "https://raw.githubusercontent.com/xStivix/website/400c625feabb65fa266a6d3d1b8f882e35f608c8/Logoassets/openai.svg", logoAlt: "OpenAI", text: "Great content.", author: "Souki Mansoor (OpenAI)" },
  { initials: "HO", logo: "https://raw.githubusercontent.com/xStivix/website/400c625feabb65fa266a6d3d1b8f882e35f608c8/Logoassets/we-are-tilt.svg", logoAlt: "We Are Tilt", text: "Really impressed with what you're doing with AI.", author: "Harry Osborne (WeAreTilt)" },
  { initials: "FN", text: "Absolutely insane stuff...", author: "Frank Nitty (Executive Producer)" }
];

function createQuoteItem(q){
  const wrap = document.createElement('div');
  wrap.className = 'quote-item';

  const logoWrap = document.createElement('div');
  logoWrap.className = 'quote-logo';

  if (q.logo){
    const img = document.createElement('img');
    img.src = q.logo;
    img.alt = q.logoAlt || (q.author ? `${q.author} logo` : 'Company logo');
    img.loading = 'lazy';
    img.decoding = 'async';
    img.draggable = false;
    if (q.logoClass) img.classList.add(q.logoClass);
    if (q.logoFit === 'wide') logoWrap.classList.add('quote-logo--wide');
    logoWrap.appendChild(img);
  } else {
    const badge = document.createElement('div');
    badge.className = 'quote-initial';
    badge.textContent = (q.initials || '?').toUpperCase();
    logoWrap.appendChild(badge);
  }

  const textEl = document.createElement('div');
  textEl.className = 'quote-text';
  textEl.textContent = q.text;

  const authorEl = document.createElement('div');
  authorEl.className = 'quote-author';
  authorEl.textContent = q.author || '';

  wrap.appendChild(logoWrap);
  wrap.appendChild(textEl);
  wrap.appendChild(authorEl);
  return wrap;
}

(function initQuoteTicker(){
  const track = document.getElementById('quoteTrack');
  if(!track) return;

  // Spur füllen
  const frag = document.createDocumentFragment();
  QUOTES.forEach(q => frag.appendChild(createQuoteItem(q)));
  track.appendChild(frag);

  // Erstes Item ohne linke Linie
  if (track.firstElementChild) track.firstElementChild.classList.add('first');

  // Zweite Spur anhängen, damit das manuell steuerbare Loop nahtlos bleibt
  const clones = Array.from(track.children).map(n => n.cloneNode(true));
  clones.forEach(n => {
    n.setAttribute('aria-hidden', 'true');
    track.appendChild(n);
  });

  const ticker = track.closest('.quote-ticker');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const compactLayout = window.matchMedia('(max-width: 1024px), (pointer: coarse)');
  const AUTO_DURATION = 40;
  const TOUCH_SPEED = 45;
  const RETURN_RATE = 1.45;
  const MAX_THROW_SPEED = 1500;

  let loopWidth = 0;
  let offset = 0;
  let autoVelocity = 0;
  let velocity = 0;
  let dragging = false;
  let dragStarted = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let pointerId = null;
  let lastPointerX = 0;
  let lastMoveTime = 0;
  let dragVelocity = 0;
  let lastFrame = performance.now();
  let tickerFrame = null;
  let tickerVisible = false;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  function measureTrack(){
    // Hidden pages have no measurable width; preserve the loop until visible.
    const measuredWidth = track.scrollWidth / 2;
    if (!measuredWidth) return;
    const previousWidth = loopWidth;
    loopWidth = measuredWidth;

    if (previousWidth > 0 && loopWidth > 0) {
      offset = offset / previousWidth * loopWidth;
    }

    autoVelocity = reducedMotion.matches
      ? 0
      : -(compactLayout.matches ? TOUCH_SPEED : loopWidth / AUTO_DURATION);

    if (reducedMotion.matches) velocity = 0;
    if (!dragging && velocity === 0) velocity = autoVelocity;
    wrapOffset();
    track.style.transform = `translate3d(${offset}px, 0, 0)`;
  }

  function wrapOffset(){
    if (!loopWidth) return;
    while (offset <= -loopWidth) offset += loopWidth;
    while (offset > 0) offset -= loopWidth;
  }

  function renderTicker(now){
    if (!tickerVisible || document.hidden) {
      tickerFrame = null;
      return;
    }

    const deltaTime = Math.min((now - lastFrame) / 1000, 0.05);
    lastFrame = now;

    if (!dragging) {
      const returnBlend = 1 - Math.exp(-RETURN_RATE * deltaTime);
      velocity += (autoVelocity - velocity) * returnBlend;
      offset += velocity * deltaTime;
    }

    wrapOffset();
    track.style.transform = `translate3d(${offset}px, 0, 0)`;
    tickerFrame = requestAnimationFrame(renderTicker);
  }

  function startTicker(){
    if (tickerFrame !== null || document.hidden || !tickerVisible) return;
    lastFrame = performance.now();
    tickerFrame = requestAnimationFrame(renderTicker);
  }

  function stopTicker(){
    if (tickerFrame !== null) {
      cancelAnimationFrame(tickerFrame);
      tickerFrame = null;
    }
  }

  function startDrag(event){
    if (event.isPrimary === false || pointerId !== null) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    dragging = true;
    dragStarted = event.pointerType === 'mouse';
    pointerId = event.pointerId;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    lastPointerX = event.clientX;
    lastMoveTime = performance.now();
    dragVelocity = 0;
    velocity = 0;
    ticker.classList.add('is-dragging');
    ticker.setPointerCapture(pointerId);
  }

  function moveDrag(event){
    if (!dragging || event.pointerId !== pointerId) return;

    // Let vertical gestures scroll the page without nudging the quote track.
    if (!dragStarted) {
      const distanceX = Math.abs(event.clientX - dragStartX);
      const distanceY = Math.abs(event.clientY - dragStartY);
      if (Math.max(distanceX, distanceY) < 6) return;
      if (distanceY >= distanceX) {
        endDrag(event);
        return;
      }
      dragStarted = true;
    }

    const now = performance.now();
    const movement = event.clientX - lastPointerX;
    const elapsed = Math.max(now - lastMoveTime, 8);
    const instantVelocity = movement / elapsed * 1000;

    offset += movement;
    dragVelocity = dragVelocity * 0.68 + instantVelocity * 0.32;
    lastPointerX = event.clientX;
    lastMoveTime = now;
  }

  function endDrag(event){
    if (!dragging || event.pointerId !== pointerId) return;

    const heldStill = performance.now() - lastMoveTime > 120;
    const cancelled = event.type === 'pointercancel' || event.type === 'lostpointercapture';
    velocity = heldStill || cancelled || !dragStarted || reducedMotion.matches
      ? 0 : clamp(dragVelocity, -MAX_THROW_SPEED, MAX_THROW_SPEED);
    dragging = false;
    dragStarted = false;
    ticker.classList.remove('is-dragging');

    if (ticker.hasPointerCapture(pointerId)) {
      ticker.releasePointerCapture(pointerId);
    }
    pointerId = null;
  }

  ticker.addEventListener('pointerdown', startDrag);
  ticker.addEventListener('pointermove', moveDrag);
  ticker.addEventListener('pointerup', endDrag);
  ticker.addEventListener('pointercancel', endDrag);
  ticker.addEventListener('lostpointercapture', endDrag);
  window.addEventListener('resize', measureTrack, { passive: true });
  reducedMotion.addEventListener('change', measureTrack);
  compactLayout.addEventListener('change', measureTrack);

  if ('ResizeObserver' in window) {
    new ResizeObserver(measureTrack).observe(ticker);
  }

  measureTrack();
  velocity = autoVelocity;

  if ('IntersectionObserver' in window) {
    const tickerObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        tickerVisible = entry.isIntersecting;
        if (tickerVisible) measureTrack();
        entry.isIntersecting ? startTicker() : stopTicker();
      });
    }, { rootMargin: '120px 0px' });
    tickerObserver.observe(ticker);
  } else {
    tickerVisible = true;
    startTicker();
  }

  document.addEventListener('visibilitychange', () => {
    document.hidden ? stopTicker() : startTicker();
  });
})();

const emailLinkTarget = ['mail', 'to:stefan.aberer@hotmail.com'].join('');

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-email-link]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      window.location.href = emailLinkTarget;
    });
  });

  const requestForm = document.getElementById('masterclass-request-form');
  const requestStatus = document.getElementById('masterclass-request-status');

  if (!requestForm || !requestStatus) return;

  requestForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!requestForm.reportValidity()) return;

    const requestData = new FormData(requestForm);
    const name = String(requestData.get('name') || '').trim();
    const email = String(requestData.get('email') || '').trim();
    const company = String(requestData.get('company') || '').trim() || 'Not provided';
    const profession = String(requestData.get('profession') || '').trim();
    const access = String(requestData.get('access') || '').trim();
    const subject = `AI Masterclass Request: ${name}`;
    const body = [
      'Hello Stefan,',
      '',
      'I would like to request access to the AI Masterclass.',
      '',
      `Name: ${name}`,
      `Email: ${email}`,
      `Company / Team: ${company}`,
      `Profession / Role: ${profession}`,
      `Access: ${access}`,
      '',
      'Best,',
      name
    ].join('\n');

    requestStatus.hidden = false;
    window.location.href =
      `${emailLinkTarget}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
});

(() => {
  const portrait = document.querySelector('.about-portrait');
  const about = document.getElementById('about');
  const quotes = document.getElementById('quotes');
  const navigation = document.querySelector('.site-nav');
  // Normalized artwork circles exclude the generous padding in the source images.
  const headingCircles = [312, 540, 768].map(x => [x / 1080, .5, 104 / 1080]);
  const targets = [
    { graphic: portrait, section: about, boundary: quotes, maxRadius: 125, circles: [[.5, 537 / 1080, 244 / 1080]] },
    {
      graphic: document.querySelector('#ai-intro .heading-hover-visual'),
      section: document.getElementById('ai-intro'), circles: headingCircles
    },
    {
      graphic: document.querySelector('#video-editing-page .heading-hover-visual'),
      section: document.getElementById('Workflow & Tools'), circles: headingCircles
    },
    {
      graphic: document.querySelector('#miscellaneous-page .heading-hover-visual'),
      section: document.getElementById('Videos, Images & Web'), circles: headingCircles
    }
  ].filter(target => target.graphic && target.section);
  const desktopPointer = window.matchMedia('(min-width: 1200px) and (hover: hover) and (pointer: fine)');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!targets.length) return;

  // Blend against the whole page so the image's canvas never clips the lens.
  const cursor = document.createElement('span');
  cursor.className = 'about-lens-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  document.body.appendChild(cursor);

  const minimumRadius = 8;
  const proximity = 220;
  const entryDistance = 80;
  const growthDistance = 72;
  const followTime = 90;
  let enabled = false;
  let visible = false;
  const visibleSections = new Set();
  let activeTarget = null;
  let active = false;
  let animationFrame = 0;
  let lastTime = 0;
  let radius = 0;
  let targetRadius = 0;
  let shrinkTime = 140;
  let leftHeld = false;
  let lastX = -1;
  let lastY = -1;
  let pointer = null;
  let lensPosition = null;
  let retreatingAtNavigation = false;

  const resetPortrait = () => {
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    active = false;
    pointer = null;
    lensPosition = null;
    retreatingAtNavigation = false;
    radius = 0;
    targetRadius = 0;
    shrinkTime = 140;
    leftHeld = false;
    lastTime = 0;
    cursor.style.width = '0px';
    cursor.style.height = '0px';
    activeTarget?.graphic.classList.remove('is-lens-active');
    activeTarget = null;
    cursor.classList.remove('is-visible');
    document.documentElement.classList.remove('has-about-lens');
  };

  const forgetPointer = () => {
    lastX = -1;
    lastY = -1;
    resetPortrait();
  };

  const measureLensTarget = () => {
    const underPointer = document.elementFromPoint(pointer.x, pointer.y);
    retreatingAtNavigation = false;
    if (underPointer && navigation?.contains(underPointer)) {
      const area = activeTarget?.section.getBoundingClientRect();
      if (enabled && visible && active && visibleSections.has(activeTarget.section) &&
          area?.width && area.height && area.bottom > 0 && area.top < window.innerHeight) {
        // Finish the existing circle below the nav; never start one on the nav.
        retreatingAtNavigation = true;
        targetRadius = 0;
        return true;
      }
      resetPortrait();
      return false;
    }
    let insideActiveArea = false;
    if (enabled && visible) {
      for (const target of targets) {
        if (!visibleSections.has(target.section)) continue;
        const area = target.section.getBoundingClientRect();
        const boundary = target.boundary?.getBoundingClientRect();
        const areaBottom = boundary?.height ? Math.min(area.bottom, boundary.top) : area.bottom;
        // Never activate over navigation, overlays or content below the black intro.
        if (!area.width || !area.height ||
            pointer.x < area.left || pointer.x >= area.right ||
            pointer.y < Math.max(0, area.top) || pointer.y >= Math.min(window.innerHeight, areaBottom) ||
            (underPointer && !target.section.contains(underPointer))) continue;
        if (target === activeTarget) insideActiveArea = true;
        const bounds = target.graphic.getBoundingClientRect();
        if (!bounds.width || !bounds.height) continue;
        const size = Math.min(bounds.width, bounds.height);
        const distance = Math.max(0, Math.min(...target.circles.map(([x, y, r]) =>
          Math.hypot(pointer.x - bounds.left - bounds.width * x,
            pointer.y - bounds.top - bounds.height * y) - size * r
        )));
        if (distance > proximity) continue;
        if (activeTarget !== target) {
          activeTarget?.graphic.classList.remove('is-lens-active');
          activeTarget = target;
          active = false;
          shrinkTime = 140;
        }
        const maximumRadius = Math.min(target.maxRadius ?? 100, bounds.width * .325, bounds.height * .325);
        const growth = Math.max(0, 1 - distance / growthDistance);
        // Ease the small ball in across the outer edge instead of popping in.
        const entry = Math.min(1, Math.max(0, (proximity - distance) / entryDistance));
        const entryEase = entry * entry * (3 - 2 * entry);
        targetRadius = minimumRadius * entryEase + (maximumRadius - minimumRadius) * growth;
        return true;
      }
    }
    // Shrink away smoothly within the intro; clear immediately over other UI.
    if (active && insideActiveArea) {
      targetRadius = 0;
      return true;
    }
    resetPortrait();
    return false;
  };

  const renderLens = time => {
    animationFrame = 0;
    if (!pointer) return;
    const previousTarget = targetRadius;
    if (!measureLensTarget()) return;
    const navigationBottom = Math.max(0, navigation?.getBoundingClientRect().bottom ?? 0);
    if (!active) {
      active = true;
      radius = 0;
      lensPosition = { ...pointer };
      lastTime = 0;
      activeTarget.graphic.classList.add('is-lens-active');
      cursor.classList.add('is-visible');
      document.documentElement.classList.add('has-about-lens');
    }
    const elapsed = lastTime ? Math.min(time - lastTime, 40) : 16;
    lastTime = time;
    const desiredRadius = leftHeld ? Math.min(minimumRadius, targetRadius) : targetRadius;
    // Retain the faster response until a quick retreat has finished shrinking.
    const retreatSpeed = Math.max(0, previousTarget - targetRadius) / elapsed;
    if (!leftHeld && retreatSpeed > 0) {
      shrinkTime = Math.min(shrinkTime, Math.max(40, 140 / (1 + retreatSpeed * 2)));
    }
    if (targetRadius > previousTarget || desiredRadius >= radius) shrinkTime = 140;
    const responseTime = retreatingAtNavigation ? 20 : leftHeld ? 220 : desiredRadius < radius ? shrinkTime : 220;
    radius += (desiredRadius - radius) * (1 - Math.exp(-elapsed / responseTime));
    if (Math.abs(desiredRadius - radius) < .15) radius = desiredRadius;

    if (radius === 0 && desiredRadius === 0) {
      resetPortrait();
      return;
    }
    // Frame-rate-independent trailing motion, with no animation loop at rest.
    const follow = 1 - Math.exp(-elapsed / followTime);
    // Let the last visible circle collapse in place instead of following into the clipped nav.
    if (!retreatingAtNavigation) {
      lensPosition.x += (pointer.x - lensPosition.x) * follow;
      lensPosition.y += (pointer.y - lensPosition.y) * follow;
    }
    const positionSettled = retreatingAtNavigation || Math.hypot(pointer.x - lensPosition.x, pointer.y - lensPosition.y) < .1;
    if (positionSettled && !retreatingAtNavigation) lensPosition = { ...pointer };

    cursor.style.width = `${radius * 2}px`;
    cursor.style.height = `${radius * 2}px`;
    cursor.style.transform = `translate3d(${lensPosition.x - radius}px, ${lensPosition.y - radius}px, 0)`;
    // Clip the complete lens, including its trailing edge, below the fixed nav.
    // Stacking beneath the nav alone would still show through its glass background.
    const clippedTop = Math.min(radius * 2, Math.max(0, navigationBottom - (lensPosition.y - radius)));
    cursor.style.clipPath = `inset(${clippedTop}px 0 0 0)`;
    if (radius !== desiredRadius || !positionSettled) animationFrame = requestAnimationFrame(renderLens);
  };

  const onPointerMove = event => {
    if (!enabled) return;
    if (event.pointerType !== 'mouse') {
      forgetPointer();
      return;
    }
    // Reconcile a release outside the window as soon as the mouse returns.
    const heldChanged = leftHeld !== Boolean(event.buttons & 1);
    leftHeld = Boolean(event.buttons & 1);
    // Ignore synthetic pointer events; scrolling updates the geometry separately.
    if (event.clientX === lastX && event.clientY === lastY && !heldChanged) return;
    lastX = event.clientX;
    lastY = event.clientY;
    if (!visible || (event.buttons & ~1)) {
      resetPortrait();
      return;
    }

    pointer = { x: lastX, y: lastY };
    if (!animationFrame) animationFrame = requestAnimationFrame(renderLens);
  };

  const updateScrolledPointer = () => {
    if (!enabled || !visible || lastX < 0 || lastY < 0) return;
    pointer = { x: lastX, y: lastY };
    if (!animationFrame) animationFrame = requestAnimationFrame(renderLens);
  };

  const configureLens = () => {
    enabled = desktopPointer.matches && !prefersReducedMotion.matches;
    targets.forEach(target => target.graphic.classList.toggle('is-lens-ready', enabled));
    window.removeEventListener('pointermove', onPointerMove);
    if (enabled) window.addEventListener('pointermove', onPointerMove, { passive: true });
    forgetPointer();
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) visibleSections.add(entry.target);
        else visibleSections.delete(entry.target);
      });
      visible = visibleSections.size > 0;
      if (!visible) resetPortrait();
      else updateScrolledPointer();
    });
    targets.forEach(target => observer.observe(target.section));
  } else {
    targets.forEach(target => visibleSections.add(target.section));
    visible = true;
  }
  window.addEventListener('scroll', updateScrolledPointer, { passive: true, capture: true });
  window.addEventListener('resize', forgetPointer);
  window.addEventListener('blur', forgetPointer);
  window.addEventListener('pagehide', forgetPointer);
  window.addEventListener('pointercancel', forgetPointer);
  window.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse') {
      forgetPointer();
      return;
    }
    if (!enabled || !active || event.button !== 0 || !activeTarget.section.contains(event.target)) return;
    leftHeld = true;
    // Keep links and form controls fully usable with the circular cursor.
    if (!event.target.closest?.('a, button, input, select, textarea, [role="button"], [contenteditable]')) {
      event.preventDefault();
    }
    if (!animationFrame) animationFrame = requestAnimationFrame(renderLens);
  });
  window.addEventListener('pointerup', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    leftHeld = false;
    if (active && !animationFrame) animationFrame = requestAnimationFrame(renderLens);
  });
  targets.forEach(target => target.graphic.addEventListener('dragstart', event => {
    if (active && leftHeld && activeTarget === target) event.preventDefault();
  }));
  window.addEventListener('pointerout', event => {
    if (!event.relatedTarget) forgetPointer();
  });
  window.addEventListener('keydown', forgetPointer);
  document.addEventListener('visibilitychange', forgetPointer);
  desktopPointer.addEventListener('change', configureLens);
  prefersReducedMotion.addEventListener('change', configureLens);
  configureLens();
})();

(() => {
  const images = document.querySelectorAll('.content-image-effect');
  const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (!images.length || !supportsHover.matches || prefersReducedMotion.matches) return;

  images.forEach(image => {
    let animationFrame = 0;

    const resetImage = () => {
      cancelAnimationFrame(animationFrame);
      image.classList.remove('is-active');
      image.style.setProperty('--content-rx', '0deg');
      image.style.setProperty('--content-ry', '0deg');
      image.style.setProperty('--content-shadow-x', '0rem');
      image.style.setProperty('--content-shadow-y', '0rem');
    };

    image.addEventListener('pointerenter', () => {
      image.classList.add('is-active');
    });

    image.addEventListener('pointermove', event => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        const bounds = image.getBoundingClientRect();
        const x = Math.min(Math.max((event.clientX - bounds.left) / bounds.width, 0), 1);
        const y = Math.min(Math.max((event.clientY - bounds.top) / bounds.height, 0), 1);

        image.style.setProperty('--content-rx', `${((.5 - y) * 2.4).toFixed(2)}deg`);
        image.style.setProperty('--content-ry', `${((x - .5) * 2.4).toFixed(2)}deg`);
        image.style.setProperty('--content-shadow-x', `${((x - .5) * .45).toFixed(3)}rem`);
        image.style.setProperty('--content-shadow-y', `${((y - .5) * .45).toFixed(3)}rem`);
      });
    });

    image.addEventListener('pointerleave', resetImage);
  });
})();

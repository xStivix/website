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
      button: '<a href="#miscellaneous" class="inline-block px-4 py-2 text-xs font-semibold uppercase tracking-wider border border-black bg-black text-white hover:bg-white hover:text-black transition rounded page-link" data-page="miscellaneous">Coming soon</a>'
    }
  ];

  const renderCard = (service) => `
    <article class="service-card flex flex-col bg-neutral-100 shadow-sm border border-gray-200 rounded-md overflow-hidden">
      <div class="service-visual relative h-40 lg:h-56 md:h-40 overflow-hidden">
        <img
          src="artwork/service-signal-fine.svg?v=20261002-transparent"
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
      // Pin the major version: an unversioned CDN URL would silently switch to
      // the next (possibly breaking) Swiper release.
      stylesheet.href = 'https://cdn.jsdelivr.net/npm/swiper@14/swiper-bundle.min.css';
      stylesheet.onload = () => {
        stylesheetReady = true;
        finish();
      };
      stylesheet.onerror = reject;

      script.src = 'https://cdn.jsdelivr.net/npm/swiper@14/swiper-bundle.min.js';
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

  // On a short landscape phone the hero may be taller than the visible area.
  // Cover its actual box, including after Safari finishes rotating.
  const hero = iframe.closest('#home');
  // A shallow mouse-driven window can be shorter than the hero's minimum
  // height. Cover that full section with the 16:9 video inside the iframe;
  // scaling against the viewport alone leaves a hard edge behind the footer.
  if (hero && window.matchMedia('(min-width: 768px) and (pointer: fine)').matches &&
      hero.clientHeight > window.innerHeight) {
    const videoWidth = Math.min(iframe.clientWidth, iframe.clientHeight * VIDEO_RATIO);
    const videoHeight = videoWidth / VIDEO_RATIO;
    const coverScale = Math.max((hero.clientWidth + 2) / videoWidth, (hero.clientHeight + 2) / videoHeight);
    iframe.style.transform = `translate(-50%, -50%) scale(${coverScale})`;
    return;
  }
  const vw = phoneLandscapeMedia.matches ? hero.clientWidth : window.innerWidth;
  const vh = phoneLandscapeMedia.matches ? hero.clientHeight : window.innerHeight;
  const r  = vw / vh;

  // Cover continuously, even just above or below 16:9. A tolerance around
  // that ratio leaves visible letterboxing, e.g. in a 1440 x 780 window.
  const coverScale = r > VIDEO_RATIO
    ? r / VIDEO_RATIO
    : VIDEO_RATIO / r;
  iframe.style.transform = `translate(-50%, -50%) scale(${coverScale})`;
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
    layer.className = 'video-open-layer';
    layer.style.cssText = 'position:absolute;inset:0;cursor:pointer;';
    layer.tabIndex = 0;
    layer.setAttribute('role', 'button');
    const projectTitle = (wrapper.querySelector('h3')?.textContent || '').replace(/\s+/g, ' ').trim();
    layer.setAttribute('aria-label', projectTitle ? `Play video: ${projectTitle}` : 'Play project video');
    // Visible cue that the preview opens the full film (shown on hover/focus, always on touch).
    const watchHint = document.createElement('span');
    watchHint.className = 'video-watch-hint';
    watchHint.setAttribute('aria-hidden', 'true');
    watchHint.innerHTML = '<svg viewBox="0 0 10 12" width="8" height="10" focusable="false"><path d="M0 0v12l10-6z" fill="currentColor"/></svg><span class="video-watch-hint__label">Watch</span>';
    layer.appendChild(watchHint);
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
/* ===== Testimonials ticker =====
   The testimonials are plain HTML in index.html (#quotes); this only adds the
   motion. One set of copies keeps the loop seamless. The band glides at the
   speed set in CSS (--testimonials-speed), eases to a stop under the mouse or
   while focused by keyboard, and can be dragged, thrown, swiped sideways on a
   trackpad or moved with the arrow keys. Reduced motion: no automatic motion. */
(function initTestimonials(){
  const section = document.getElementById('quotes');
  const viewport = section && section.querySelector('.testimonials__viewport');
  const track = viewport && viewport.querySelector('.testimonials__track');
  if (!track) return;

  const originals = Array.from(track.children);
  if (!originals.length) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const DEFAULT_SPEED = 40;     // px/s, if the CSS token is missing
  const STOP_RATE = 3.2;        // easing towards a stop (hover, keyboard focus)
  const RETURN_RATE = 1.45;     // easing back to cruising speed, and after a throw
  const MAX_THROW_SPEED = 1500;
  const SETTLE_SPEED = 1.5;     // below this a stopping band rests on whole pixels

  // Without script the row scrolls natively and starts after the edge fade.
  // Keep that starting position for the animated version.
  let offset = parseFloat(getComputedStyle(track).paddingLeft) || 0;
  let loopWidth = 0;
  let velocity = 0;
  let cruise = 0;
  let frame = null;
  let lastFrame = 0;
  let visible = !('IntersectionObserver' in window);
  let measureFrame = null;
  const holds = new Set();      // reasons to rest: 'hover', 'focus'

  let pointerId = null;
  let dragging = false;
  let dragStarted = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let lastPointerX = 0;
  let lastMoveTime = 0;
  let dragVelocity = 0;

  section.classList.add('is-live');
  viewport.scrollLeft = 0;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const targetSpeed = () => (holds.size ? 0 : cruise);

  function readSpeed(){
    const value = parseFloat(getComputedStyle(section).getPropertyValue('--testimonials-speed'));
    return value > 0 ? value : DEFAULT_SPEED;
  }

  // Copies of the whole set; the copies are hidden from assistive technology.
  function setCopies(sets){
    let current = track.children.length / originals.length;
    while (current < sets) {
      originals.forEach(item => {
        const copy = item.cloneNode(true);
        copy.setAttribute('aria-hidden', 'true');
        copy.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
        track.appendChild(copy);
      });
      current += 1;
    }
    while (current > sets && current > 2) {
      for (let i = 0; i < originals.length; i += 1) track.lastElementChild.remove();
      current -= 1;
    }
  }

  function wrapOffset(){
    if (!loopWidth) return;
    offset = ((offset % loopWidth) - loopWidth) % loopWidth;   // (-loopWidth, 0]
  }

  function render(){
    track.style.transform = `translate3d(${offset}px, 0, 0)`;
  }

  // Rest on device pixels so paused text stays crisp.
  function settle(){
    const ratio = window.devicePixelRatio || 1;
    offset = Math.round(offset * ratio) / ratio;
  }

  // Distance between a testimonial and its copy, with sub-pixel precision and
  // in the track's own coordinates (independent of any scaling ancestor).
  function measurePeriod(){
    const width = track.offsetWidth;
    if (!width) return 0;
    const scale = track.getBoundingClientRect().width / width || 1;
    const first = originals[0].getBoundingClientRect().left;
    const copy = track.children[originals.length].getBoundingClientRect().left;
    return (copy - first) / scale;
  }

  function measure(){
    measureFrame = null;
    // Hidden band (phones, other pages): nothing to measure until it is shown.
    if (!track.offsetWidth) return;
    if (track.children.length < originals.length * 2) setCopies(2);
    const period = measurePeriod();
    if (!period) return;

    if (loopWidth) offset = offset / loopWidth * period;
    loopWidth = period;
    setCopies(1 + Math.ceil(viewport.clientWidth / loopWidth));

    cruise = reducedMotion.matches ? 0 : -readSpeed();
    if (reducedMotion.matches) velocity = 0;
    wrapOffset();
    render();
    start();
  }

  function scheduleMeasure(){
    if (measureFrame === null) measureFrame = requestAnimationFrame(measure);
  }

  function step(now){
    frame = null;
    if (!visible || document.hidden) return;

    const deltaTime = Math.min((now - lastFrame) / 1000, 0.05);
    lastFrame = now;

    if (!dragging) {
      // Exact exponential easing, so distances do not depend on the frame rate.
      const target = targetSpeed();
      const rate = target === 0 ? STOP_RATE : RETURN_RATE;
      const decay = Math.exp(-rate * deltaTime);
      offset += target * deltaTime + (velocity - target) * (1 - decay) / rate;
      velocity = target + (velocity - target) * decay;
      if (target === 0 && Math.abs(velocity) < SETTLE_SPEED) {
        velocity = 0;
        settle();
      }
    }

    wrapOffset();
    render();

    // Sleep while resting; any interaction calls start() again.
    if (dragging || velocity !== 0 || targetSpeed() !== 0) {
      frame = requestAnimationFrame(step);
    }
  }

  function start(){
    if (frame !== null || !visible || document.hidden || !loopWidth) return;
    lastFrame = performance.now();
    frame = requestAnimationFrame(step);
  }

  function stop(){
    if (frame === null) return;
    cancelAnimationFrame(frame);
    frame = null;
  }

  function hold(reason){
    holds.add(reason);
    start();
  }

  function release(reason){
    if (holds.delete(reason)) start();
  }

  /* Pointer: drag and throw. Vertical swipes keep scrolling the page. */
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
    if (dragStarted) section.classList.add('is-dragging');
    viewport.setPointerCapture(pointerId);
    start();
  }

  function moveDrag(event){
    if (!dragging || event.pointerId !== pointerId) return;

    if (!dragStarted) {
      const distanceX = Math.abs(event.clientX - dragStartX);
      const distanceY = Math.abs(event.clientY - dragStartY);
      if (Math.max(distanceX, distanceY) < 6) return;
      if (distanceY >= distanceX) {
        endDrag(event);
        return;
      }
      dragStarted = true;
      section.classList.add('is-dragging');
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
    section.classList.remove('is-dragging');

    if (viewport.hasPointerCapture(pointerId)) {
      viewport.releasePointerCapture(pointerId);
    }
    pointerId = null;
    start();
  }

  viewport.addEventListener('pointerdown', startDrag);
  viewport.addEventListener('pointermove', moveDrag);
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);
  viewport.addEventListener('lostpointercapture', endDrag);

  /* Mouse: ease to a stop while the pointer rests on the band. */
  viewport.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse') hold('hover');
  });
  viewport.addEventListener('pointerleave', event => {
    if (event.pointerType === 'mouse') release('hover');
  });

  /* Trackpads: a sideways swipe moves the band; vertical scrolling is untouched. */
  viewport.addEventListener('wheel', event => {
    if (event.ctrlKey || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
    event.preventDefault();
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientWidth : 1;
    offset -= event.deltaX * unit;
    velocity = 0;
    wrapOffset();
    render();
    start();
  }, { passive: false });

  /* Keyboard: focus stops the band, the arrow keys move it about one testimonial. */
  viewport.addEventListener('focus', () => {
    let keyboardFocus = true;
    try { keyboardFocus = viewport.matches(':focus-visible'); } catch (error) { /* older browsers */ }
    if (keyboardFocus) hold('focus');
  });
  viewport.addEventListener('blur', () => release('focus'));
  viewport.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    if (!loopWidth) return;
    event.preventDefault();
    hold('focus');

    const direction = event.key === 'ArrowRight' ? -1 : 1;
    const distance = loopWidth / originals.length;
    if (reducedMotion.matches) {
      velocity = 0;
      offset += direction * distance;
      settle();
      wrapOffset();
      render();
      return;
    }
    // The stop easing travels velocity / STOP_RATE, i.e. one testimonial.
    velocity += direction * distance * STOP_RATE;
    start();
  });

  window.addEventListener('resize', scheduleMeasure, { passive: true });
  reducedMotion.addEventListener('change', scheduleMeasure);

  // Track size changes when the webfonts arrive or a breakpoint changes the type.
  if ('ResizeObserver' in window) {
    const resizeObserver = new ResizeObserver(scheduleMeasure);
    resizeObserver.observe(viewport);
    resizeObserver.observe(track);
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(scheduleMeasure);
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      entries.forEach(entry => {
        visible = entry.isIntersecting;
        if (visible) {
          measure();
          start();
        } else {
          stop();
        }
      });
    }, { rootMargin: '120px 0px' }).observe(viewport);
  }

  document.addEventListener('visibilitychange', () => {
    document.hidden ? stop() : start();
  });

  measure();
  velocity = cruise;
  start();
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

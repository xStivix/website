const services = [
    {
      number: '01',
      title: 'AI EXPERTISE',
      text: "I use AI to create images, videos, and effects, enhancing footage with smart upscaling and frame interpolation. From visual effects (VFX) to fully AI-generated videos, I've developed a workflow that allows for fully customizable visuals tailored to any product or individual.",
      image: 'https://raw.githubusercontent.com/xStivix/website/refs/heads/main/Finalwebpimages/Comp%2010_00000.webp',
      button: '<a href="#ai" data-page="ai" class="inline-block px-4 py-2 text-xs font-semibold uppercase tracking-wider border border-black bg-black text-white hover:bg-white hover:text-black transition rounded page-link">AI Insights</a>'
    },
    {
      number: '02',
      title: 'VIDEO EDITING',
      text: 'I cover the full post-production workflow from rough cut to final export. This includes selecting and organizing footage, video editing, color grading, sound design, and mixing. I can also add motion graphics and VFX, as well as handle compositing, cleanup, and retouching.',
      image: 'https://raw.githubusercontent.com/xStivix/website/refs/heads/main/vewebfinal.webp',
      button: '<a href="#video-editing" class="inline-block px-4 py-2 text-xs font-semibold uppercase tracking-wider border border-black bg-black text-white hover:bg-white hover:text-black transition rounded page-link" data-page="videoEditing">Tech insights</a>'
    },
    {
      number: '03',
      title: 'MASTERCLASS',
      text: 'Want to learn how generative AI can become part of a professional production workflow? In this Masterclass, I share the complete process behind my AI projects, from prompt development and reference preparation to video generation, all the way to post-production integration.',
      image: 'https://raw.githubusercontent.com/xStivix/website/refs/heads/main/masterclass-symbol-pattern.webp',
      button: '<a href="#miscellaneous" class="inline-block px-4 py-2 text-xs font-semibold uppercase tracking-wider border border-black bg-black text-white hover:bg-white hover:text-black transition rounded page-link" data-page="miscellaneous">COMING SOON</a>'
    }
  ];

  const renderCard = (service) => `
    <article class="flex flex-col bg-neutral-100 shadow-sm border border-gray-200 rounded-md overflow-hidden">
      <div class="relative h-40 lg:h-56 md:h-40 overflow-hidden">
        <img src="${service.image}" alt="${service.title}" loading="lazy" decoding="async" class="absolute inset-0 w-full h-full object-cover" />
      </div>
      <div class="p-8 sm:p-4 lg:p-8 flex-1 bg-gray-100">
        <span class="font-mono text-sm text-gray-500 mb-2 block">${service.number}</span>
        <h3 class="text-xl font-bold text-black mb-4">${service.title}</h3>
        <p class="text-base text-black font-light mb-4">${service.text}</p>
        <div class="mt-8">${service.button}</div>
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

  if (typeof Swiper === 'function') {
    new Swiper(".mySwiper", {
      direction: "horizontal",
      slidesPerView: 1.08,
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
      pagination: {
        el: ".swiper-pagination",
        clickable: true
      },
      breakpoints: {
        0: {
          slidesPerView: 1.08,
          spaceBetween: 12
        },
        480: {
          slidesPerView: 1.18,
          spaceBetween: 14
        }
      }
    });
  }

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

pageLinks.forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    const page = this.dataset.page;

    /* ------------------------------------------------------------
       SEITE UMSCHALTEN
    ------------------------------------------------------------ */
    hideAllPages();                               // alles ausblenden

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

    /* ------------------------------------------------------------
       SCROLL-LOGIK
       – Tech, AI und Masterclass: wie Main-Sektionen per scrollIntoView
       – Main-Page-Sektionen: weich per scrollIntoView
    ------------------------------------------------------------ */
    if (page === 'main' || page === undefined) {
      // Link zeigt auf #about, #portfolio, #services …
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      const smoothPageStart = ['ai', 'videoEditing', 'miscellaneous'].includes(page);
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      requestAnimationFrame(() => {
        targetPage.scrollIntoView({
          behavior: smoothPageStart && !reducedMotion ? 'smooth' : 'auto',
          block: 'start'
        });
      });
    }

    /* ------------------------------------------------------------
       NAV-Status & Hash
    ------------------------------------------------------------ */
    document.querySelectorAll('.nav-link')
            .forEach(n => n.classList.remove('active'));
    const activePage = page === 'masterclassAccess' ? 'miscellaneous' : page;
    const active = document.querySelector(`.nav-link[data-page="${activePage}"]`);
    if (active) active.classList.add('active');

    langSwitcher.style.display =
      ['impressum','agb','datenschutz'].includes(page) ? 'none' : 'block';

    history.pushState(null, '', this.getAttribute('href'));

    /* Mobile-Menü schließen */
    document.getElementById('mobileMenu').classList.add('hidden');
  });
});

/* --------------------------------------------------------------
   BROWSER-VOR/ZURÜCK
-------------------------------------------------------------- */
window.addEventListener('popstate', () => {
  const hash = location.hash || '#home';
  hideAllPages();

  const link = document.querySelector(`.page-link[href="${hash}"]`);
  if (link) {
    link.click();                 // feuert obigen Handler erneut
  } else {
    mainPage.style.display = 'block';
    requestAnimationFrame(() =>
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    );
  }
});
// ─── COPY-PASTE Ende ───────────────────────────────────────────



      /* Logo klick → Main-Page anzeigen und nach oben scrollen */
const homeLink = document.getElementById('homeLink');
homeLink.addEventListener('click', e => {
  e.preventDefault();
  // alle Unterseiten ausblenden und Hauptseite zeigen
  hideAllPages();
  mainPage.style.display = 'block';

  // Nav-Link “About” (oder “Home”) als aktiv markieren, falls gewünscht
  document.querySelectorAll('.nav-link').forEach(nav => nav.classList.remove('active'));
  const aboutNav = document.querySelector('.nav-link[href="#about"]');
  if (aboutNav) aboutNav.classList.add('active');

  // Smooth scroll ganz nach oben
  mainPage.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // URL-Hash setzen
  history.pushState(null, '', '#home');

  // mobiles Menü schließen
  document.getElementById('mobileMenu').classList.add('hidden');
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

  const vw = window.innerWidth;
  const vh = window.innerHeight;
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
        if(!anchor.classList.contains('page-link')){
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
      window.addEventListener('orientationchange', updateDesktopIframeScale);
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
    setTimeout(() => revealContent(), 1470);
  }
});
/*
layer.addEventListener('click', () => {
  plyr.classList.remove('ready');
  plyr.src = `https://player.vimeo.com/video/${id}?dnt=1&autoplay=1`;
  box.classList.add('show');
});*/

 document.addEventListener('DOMContentLoaded', function() {
    const desktopIframe = document.querySelector('.desktop-iframe');
    const mobileIframe = document.querySelector('.mobile-iframe');
    const mobileFallback = document.querySelector('.mobile-fallback');
    const mobileMedia = window.matchMedia('(max-width: 767px)');
    if (!desktopIframe || !mobileIframe) return;

    let activeFrame = null;
    let heroSession = 0;
    let revealTimer = null;

    const showMobileFallback = () => {
      if (revealTimer) {
        clearTimeout(revealTimer);
        revealTimer = null;
      }
      mobileIframe.classList.remove('is-ready');
      if (mobileFallback) mobileFallback.classList.remove('is-hidden');
    };

    const loadResponsiveHero = () => {
      heroSession += 1;
      const session = heroSession;
      const nextFrame = mobileMedia.matches ? mobileIframe : desktopIframe;
      const previousFrame = nextFrame === mobileIframe ? desktopIframe : mobileIframe;

      if (activeFrame !== nextFrame) {
        previousFrame.classList.remove('is-ready');
        previousFrame.removeAttribute('src');
        activeFrame = nextFrame;
      }

      if (nextFrame === mobileIframe) {
        showMobileFallback();
      }
      assignFrameSource(nextFrame);

      waitForVimeoApi().then(() => {
        if (session !== heroSession || activeFrame !== nextFrame) return;
        const player = new Vimeo.Player(nextFrame);

        if (nextFrame === desktopIframe) {
          const revealDesktopVideo = () => {
            if (session === heroSession) desktopIframe.classList.add('is-ready');
          };
          player.on('playing', revealDesktopVideo);
          player.ready()
            .then(() => player.getPaused())
            .then(paused => {
              if (!paused) revealDesktopVideo();
            })
            .catch(() => {});
          return;
        }

        const revealMobileVideo = () => {
          if (session !== heroSession) return;
          mobileIframe.classList.add('is-ready');
          if (mobileFallback) mobileFallback.classList.add('is-hidden');
        };

        player.on('timeupdate', data => {
          if (!data || data.seconds <= 0.2 || revealTimer || mobileIframe.classList.contains('is-ready')) return;
          revealTimer = setTimeout(() => {
            revealTimer = null;
            player.getPaused()
              .then(paused => paused ? showMobileFallback() : revealMobileVideo())
              .catch(showMobileFallback);
          }, 250);
        });
        player.on('pause', showMobileFallback);
        player.on('error', showMobileFallback);
        player.ready().then(() => player.play()).catch(showMobileFallback);
      }).catch(() => {
        if (nextFrame === mobileIframe) showMobileFallback();
      });
    };

    loadResponsiveHero();
    if (mobileMedia.addEventListener) {
      mobileMedia.addEventListener('change', loadResponsiveHero);
    } else {
      mobileMedia.addListener(loadResponsiveHero);
    }
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
  let videoTrigger = null;
  let playbackSession = 0;
  let revealTimer = null;

  function schedulePlayerReveal(session, delay) {
    clearTimeout(revealTimer);
    revealTimer = setTimeout(() => {
      if (session === playbackSession && box.classList.contains('show')) {
        stage.classList.add('is-ready');
      }
    }, delay);
  }

  /* Vimeo lädt unter einer schwarzen Fläche; danach wird der Player freigegeben. */
  plyr.addEventListener('load', () => {
    if (!plyr.src.includes('player.vimeo.com/video/')) return;
    schedulePlayerReveal(playbackSession, 700);
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
  clones.forEach(n => track.appendChild(n));

  const ticker = track.closest('.quote-ticker');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const AUTO_DURATION = 40;
  const RETURN_RATE = 1.45;
  const MAX_THROW_SPEED = 1500;

  let loopWidth = 0;
  let offset = 0;
  let autoVelocity = 0;
  let velocity = 0;
  let dragging = false;
  let pointerId = null;
  let lastPointerX = 0;
  let lastMoveTime = 0;
  let dragVelocity = 0;
  let lastFrame = performance.now();
  let tickerFrame = null;
  let tickerVisible = false;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  function measureTrack(){
    const previousWidth = loopWidth;
    loopWidth = track.scrollWidth / 2;

    if (previousWidth > 0 && loopWidth > 0) {
      offset = offset / previousWidth * loopWidth;
    }

    autoVelocity = reducedMotion.matches || loopWidth === 0
      ? 0
      : -(loopWidth / AUTO_DURATION);

    if (!dragging && velocity === 0) velocity = autoVelocity;
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
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    dragging = true;
    pointerId = event.pointerId;
    lastPointerX = event.clientX;
    lastMoveTime = performance.now();
    dragVelocity = velocity;
    velocity = 0;
    ticker.classList.add('is-dragging');
    ticker.setPointerCapture(pointerId);
  }

  function moveDrag(event){
    if (!dragging || event.pointerId !== pointerId) return;

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
    velocity = heldStill ? 0 : clamp(dragVelocity, -MAX_THROW_SPEED, MAX_THROW_SPEED);
    dragging = false;
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
  window.addEventListener('resize', measureTrack, { passive: true });
  reducedMotion.addEventListener('change', measureTrack);

  measureTrack();
  velocity = autoVelocity;

  if ('IntersectionObserver' in window) {
    const tickerObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        tickerVisible = entry.isIntersecting;
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
  const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (!portrait || !supportsHover.matches || prefersReducedMotion.matches) return;

  let animationFrame = 0;

  const resetPortrait = () => {
    cancelAnimationFrame(animationFrame);
    portrait.classList.remove('is-active');
    portrait.style.setProperty('--portrait-rx', '0deg');
    portrait.style.setProperty('--portrait-ry', '0deg');
    portrait.style.setProperty('--portrait-shadow-x', '0rem');
    portrait.style.setProperty('--portrait-shadow-y', '0rem');
  };

  portrait.addEventListener('pointerenter', () => {
    portrait.classList.add('is-active');
  });

  portrait.addEventListener('pointermove', event => {
    cancelAnimationFrame(animationFrame);
    animationFrame = requestAnimationFrame(() => {
      const bounds = portrait.getBoundingClientRect();
      const x = Math.min(Math.max((event.clientX - bounds.left) / bounds.width, 0), 1);
      const y = Math.min(Math.max((event.clientY - bounds.top) / bounds.height, 0), 1);

      portrait.style.setProperty('--portrait-rx', `${((.5 - y) * 2.4).toFixed(2)}deg`);
      portrait.style.setProperty('--portrait-ry', `${((x - .5) * 2.4).toFixed(2)}deg`);
      portrait.style.setProperty('--portrait-shadow-x', `${((x - .5) * .45).toFixed(3)}rem`);
      portrait.style.setProperty('--portrait-shadow-y', `${((y - .5) * .45).toFixed(3)}rem`);
    });
  });

  portrait.addEventListener('pointerleave', resetPortrait);
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

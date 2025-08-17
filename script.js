const services = [
    {
      number: '01',
      title: 'AI EXPERTISE',
      text: "I use AI to create images, videos, and effects, enhancing footage with smart upscaling and frame interpolation. From deepfake applications to lifelike virtual talking models, I've developed a workflow that allows for fully customizable visuals tailored to any product or individual.",
      image: 'https://raw.githubusercontent.com/xStivix/website/refs/heads/main/Finalwebpimages/Comp%2010_00000.webp',
      button: '<a href="#ai" data-page="ai" class="inline-block px-4 py-2 text-xs font-semibold uppercase tracking-wider border border-black bg-black text-white hover:bg-white hover:text-black transition rounded page-link">AI Insights</a>'
    },
    {
      number: '02',
      title: 'VIDEO EDITING',
      text: 'I cover the full post-production workflow from rough cut to final export. This includes selecting and organising footage, video editing, color grading, sound design, and mixing. I can also add motion graphics and VFX. As well as handle compositing, cleanup and retouching.',
      image: 'https://raw.githubusercontent.com/xStivix/website/refs/heads/main/vewebfinal.webp',
      button: '<a href="#video-editing" class="inline-block px-4 py-2 text-xs font-semibold uppercase tracking-wider border border-black bg-black text-white hover:bg-white hover:text-black transition rounded page-link" data-page="videoEditing">Tech insights</a>'
    },
    {
      number: '03',
      title: 'MISCELLANEOUS',
      text: "Whether it's purely video content or anything else, I adapt to the needs of each project. Depending on its size and scope, I collaborate with other creative individuals to define the right visual approach & direction as well as lay the groundwork for a smooth production process.",
      image: 'https://raw.githubusercontent.com/xStivix/website/refs/heads/main/Finalwebpimages/misc_00000.webp',
      button: '<a href="#miscellaneous" class="inline-block px-4 py-2 text-xs font-semibold uppercase tracking-wider border border-black bg-black text-white hover:bg-white hover:text-black transition rounded page-link" data-page="miscellaneous">COMING SOON</a>'
    }
  ];

  const renderCard = (service) => `
    <article class="flex flex-col bg-neutral-100 shadow-sm border border-gray-200 rounded-md overflow-hidden">
      <div class="relative h-40 lg:h-56 md:h-40 overflow-hidden">
        <img src="${service.image}" alt="${service.title}" class="absolute inset-0 w-full h-full object-cover" />
      </div>
      <div class="p-8 sm:p-4 lg:p-8 flex-1 bg-gray-100">
        <span class="font-mono text-sm text-gray-500 mb-2 block">${service.number}</span>
        <h3 class="text-xl font-semibold text-black mb-4">${service.title}</h3>
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

  new Swiper(".mySwiper", {
    direction:     "horizontal",
    slidesPerView: 1.4,
    spaceBetween:  16,
    touchAngle: 45,     // Smaller angle feels more natural for horizontal
    threshold: 5,       // React faster to swipes
    freeMode: {
      enabled: true,    // Allows smooth momentum scrolling
      momentum: true
    },
    pagination: {
      el:        ".swiper-pagination",
      clickable: true
    },

    // Responsive breakpoints
    breakpoints: {
      0: {              // Mobile portrait
        slidesPerView: 1.4,
        spaceBetween: 16
      },
      480: {            // Mobile landscape / small tablets
        slidesPerView: 1.9,
        spaceBetween: 16
      }
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

    
    const hideAllPages = () => {
      mainPage.style.display = "none";
      imagesPage.style.display = "none";
      aiPage.style.display = "none";
      impressumPage.style.display = "none";
      agbPage.style.display = "none";
      datenschutzPage.style.display = "none";
      videoEditingPage.style.display = "none";
      miscellaneousPage.style.display = "none";
    };
    
  // ─── COPY-PASTE ab hier ───────────────────────────────────────────
pageLinks.forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault();

    /* ------------------------------------------------------------
       SEITE UMSCHALTEN
    ------------------------------------------------------------ */
    hideAllPages();                               // alles ausblenden
    const page = this.dataset.page;               // Ziel ermitteln

    // Einblenden
    ({
      images:        imagesPage,
      ai:            aiPage,
      impressum:     impressumPage,
      agb:           agbPage,
      datenschutz:   datenschutzPage,
      videoEditing:  videoEditingPage,
      miscellaneous: miscellaneousPage,
      main:          mainPage,    // "WORK" / "ABOUT" / "SERVICES" usw.
      undefined:     mainPage     // Fallback
    }[page]).style.display = 'block';

    /* ------------------------------------------------------------
       SCROLL-LOGIK
       – Unterseiten: sofort nach ganz oben (ohne Smooth)
       – Main-Page-Sektionen: weich per scrollIntoView
    ------------------------------------------------------------ */
    if (page === 'main' || page === undefined) {
      // Link zeigt auf #about, #portfolio, #services …
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      // Alle anderen Unterseiten
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        // Extra-Fallback für alte Browser / iOS
        document.documentElement.scrollTop =
        document.body.scrollTop          = 0;
      });
    }

    /* ------------------------------------------------------------
       NAV-Status & Hash
    ------------------------------------------------------------ */
    document.querySelectorAll('.nav-link')
            .forEach(n => n.classList.remove('active'));
    const active = document.querySelector(`.nav-link[data-page="${page}"]`);
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
      mobileMenuButton.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
      document.querySelectorAll('#mobileMenu a').forEach(l => l.addEventListener('click', () => mobileMenu.classList.add('hidden')));

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
      document.querySelectorAll('#images-page .portfolio-item img, #ai-page .portfolio-item img').forEach(img => {
  img.addEventListener('click', e => {
    modalImage.src = e.target.src;
    imageModal.classList.add('active');
  });
});
      imageModal.addEventListener('click', () => imageModal.classList.remove('active'));

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
        if (hash === "impressum" || hash === "agb" || hash === "datenschutz" || hash === "images") {
          hideAllPages();
          if (hash === "images") {
            imagesPage.style.display = "block";
          } else if (hash === "impressum") {
            impressumPage.style.display = "block";
          } else if (hash === "agb") {
            agbPage.style.display = "block";
          } else if (hash === "datenschutz") {
            datenschutzPage.style.display = "block";
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
  // Globale Variable, damit andere Funktionen darauf zugreifen können
  let didReveal = false;
  
  const introOverlay = document.querySelector('.intro-overlay');
  const textEls = [
    document.querySelector('.mega-title'),
    document.querySelector('.content-overlay p'),
    document.querySelector('.content-overlay a')
  ];

  // Texte sofort verbergen
  textEls.forEach(el => {
    if (el) { // Sicherheitscheck hinzugefügt
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
    }
  });

  // Funktion, die die Animation startet
  function revealContent() {
    // Vermeide doppelte Animation
    if (didReveal) return;
    didReveal = true;
    
    // Animation starten
    if (introOverlay) introOverlay.classList.add('slide-out');

    // Text-Elemente animieren
    const delays = ['0s', '0.0s', '1.2s'];
    textEls.forEach((el, i) => {
      if (el) {
        el.style.animationDelay = delays[i];
        el.classList.add('fade-in-up');
      }
    });
  }

  // detect mobile
const isMobile = window.matchMedia('(max-width: 767px)').matches;

// fallback-Zeit mobil/kontainer
const FALLBACK_MS_DESKTOP = 2500;
const FALLBACK_MS_MOBILE  = 1500; // z.B. 1,5s auf Mobil

const FALLBACK_MS = isMobile ? FALLBACK_MS_MOBILE : FALLBACK_MS_DESKTOP;

setTimeout(() => {
  if (!didReveal) revealContent();
}, FALLBACK_MS);

  // Verzögerte Vimeo-Initialisierung, um sicherzustellen, dass das DOM bereit ist
  setTimeout(() => {
    try {
      // Bestimme, welches iframe aktiv ist
      const desktop = document.querySelector('.desktop-iframe');
      if (!desktop) throw new Error('Desktop iframe nicht gefunden');
      
      const bgIframe = window.getComputedStyle(desktop).display !== 'none'
                     ? desktop
                     : document.querySelector('.mobile-iframe');
      
      if (!bgIframe) throw new Error('Kein aktives iframe gefunden');
      
      // Vimeo Player initialisieren
      const player = new Vimeo.Player(bgIframe);

// Wenn Video bereit ist, Overlay weg
player.on('loaded', () => {
  triggerOverlaySlideOut();
});

// oder sobald es abspielt
player.on('play', () => {
  triggerOverlaySlideOut();
});

// und auch bei Fehler
player.on('error', () => {
  triggerOverlaySlideOut();
});
      
      // Event-Listener für Play-Event
      player.on('play', () => {
        if (!didReveal) revealContent();
      });
      
      // Event-Listener für Error-Event
      player.on('error', () => {
        console.log('Vimeo-Player Fehler aufgetreten');
        if (!didReveal) revealContent();
      });
      
    } catch (e) {
      console.error('Fehler bei der Vimeo-Initialisierung:', e);
      // Bei Fehlern trotzdem die Animation starten
      if (!didReveal) revealContent();
    }
  }, 0); // 30ms Verzögerung für die Vimeo-Initialisierung
});
/*
layer.addEventListener('click', () => {
  plyr.classList.remove('ready');
  plyr.src = `https://player.vimeo.com/video/${id}?autoplay=1`;
  box.classList.add('show');
});*/

 document.addEventListener('DOMContentLoaded', function() {
    // 1. Nur in der Smartphone-Ansicht (<= 767px) ausführen
    if (window.innerWidth > 767) return;

    // 2. Mobile-Iframe selektieren
    const mobileIframe = document.querySelector('.mobile-iframe');
    const fallback = document.querySelector('.mobile-fallback');
    if (!mobileIframe || !fallback) return;

    // 3. Vimeo-Player nur für das mobile Iframe instanziieren
    const mobilePlayer = new Vimeo.Player(mobileIframe);

    // 4. Wenn Buffering beendet ist, Fallback langsam ausblenden
    mobilePlayer.on('bufferend', function() {
      // 4.1 Opacity des Fallback auf 0 setzen (Transition startet)
      fallback.style.opacity = '0';

      // 4.2 Nach der Transition (gleiche Dauer wie in CSS: 0.3s)
      setTimeout(function() {
        // 4.2.1 Fallback per display:none ganz entfernen
        fallback.style.display = 'none';
      }, 100); // 300 ms, gleiche Zeit wie CSS-Transition
    });
  });


document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------------------
     Welche Iframes?  – Passe die Selector‑Liste bei Bedarf an
     --------------------------------------------------------------- */
  const iframes = document.querySelectorAll(
  '#ai-page iframe[src*="vimeo.com"]'
  );

  iframes.forEach(frame => {
    /* 1) ID + (falls vorhanden) HASH aus der src ziehen ------------- */
    const urlMatch = frame.src.match(/\/video\/(\d+)(?:\?[^#]*h=([a-z0-9]+))?/i);
    if (!urlMatch) return;                             // Safety‑Stop

    const id   = urlMatch[1];                // „1098650054“
    const hash = urlMatch[2] || '';          // „6266b2155c“ (bei unlisted) oder ''

    /* 2) Platzhalter‑Div ins Wrapper‑Element einsetzen -------------- */
    const wrapper = frame.parentElement;
    wrapper.style.position = 'relative';

    const ph = document.createElement('div');
    ph.className = 'video-placeholder';      // ➜ siehe CSS‑Snippet unten
    wrapper.appendChild(ph);

    /* 3) Thumbnail‑URL bauen – unlisted =  ID:HASH ------------------ */
    const thumbId = hash ? `${id}:${hash}` : id;
    const cdnUrl  = `https://vumbnail.com/${thumbId}.jpg`;

    /* 4) Bild testen – wenn es lädt → als BG setzen,
          sonst Fallback über player‑config versuchen                */
    setPlaceholder(ph, cdnUrl, () => {
      const cfgUrl = `https://player.vimeo.com/video/${id}/config` + (hash ? `?h=${hash}` : '');
      fetch(cfgUrl).then(r => r.ok ? r.json() : Promise.reject())
                   .then(cfg => {
                     const thumbs = cfg.video.thumbs || {};
                     const largest = thumbs[Object.keys(thumbs).sort().pop()];
                     if (largest) ph.style.backgroundImage = `url("${largest}")`;
                   });
    });

    /* 5) Player‑Init & Overlay ausblenden, wenn Video spielt -------- */
    if (typeof Vimeo !== 'undefined') {
      const player  = new Vimeo.Player(frame);

      const fadeOut = () => {
        ph.classList.add('hide');            // CSS‑Transition
        setTimeout(() => ph.remove(), 500);  // DOM aufräumen
      };

      player.on('play',   fadeOut);
      player.on('loaded', () => player.getPaused().then(p => !p && fadeOut()));
    }
  });

  /* Helper: Bild laden oder Fehler‑Callback auslösen ----------------- */
  function setPlaceholder(el, url, onError) {
    const img = new Image();
    img.onload  = () => el.style.backgroundImage = `url("${url}")`;
    img.onerror = onError;
    img.src = url;
  }

});


document.addEventListener('DOMContentLoaded', () => {

  /* ── Grundeinstellungen ────────────────────────────────────── */
  const STEP = 20, BASE_R = 2, MAX_R = 6, FALLOFF = 120;

  /* Initialisiert genau ein Canvas ----------------------------- */
  function initGrid(canvas){
    console.log('initGrid');
    const ctx   = canvas.getContext('2d');
    let dots    = [];
    let mouse   = { x: 1e9, y: 1e9 };

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
          dots.push({ x, y });
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
        const r = BASE_R + (MAX_R - BASE_R) * t;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI*2);
        ctx.fillStyle = '#fff';
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }

    /* Maus / Touch global erfassen ------------------------------ */
    function setMouse(e){
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

    /* Start ----------------------------------------------------- */
    resize();
    draw();
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

  /* Vimeo-Iframe nach Ladung einblenden */
  plyr.addEventListener('load', () => plyr.classList.add('ready'));

  /* === Klick- & Hover-Layer über jedes Portfolio-Video === */
  document.querySelectorAll('#portfolio .video-hover > div, #ai-page .video-hover > div').forEach(wrapper => {
    const frame = wrapper.querySelector('iframe');
    if (!frame) return;

    /* 1) Vimeo-Player instanziieren */
    const player = new Vimeo.Player(frame);
    player.setVolume(0);            // immer stumm

    /* 2) transparente Schicht erzeugen */
    const layer = document.createElement('div');
    layer.style.cssText = 'position:absolute;inset:0;cursor:pointer;';
    wrapper.appendChild(layer);

    /* --- Hover: abspielen / pausieren ------------------- */
    layer.addEventListener('mouseenter', () => player.play());
    layer.addEventListener('mouseleave', () => player.pause());

    /* --- Klick: Lightbox öffnen ------------------------- */
    const id = frame.dataset.vimeoId || frame.src.split('/').pop().split('?')[0];
    layer.addEventListener('click', () => {
      plyr.classList.remove('ready');
      plyr.src = `https://player.vimeo.com/video/${id}?autoplay=1`;
      box.classList.add('show');
    });
  });

  /* Lightbox schließen */
  function closeBox(){
    box.classList.remove('show');
    plyr.src = '';
  }
  close.addEventListener('click', closeBox);
  box.addEventListener('click', e => { if (e.target === box) closeBox(); });
});

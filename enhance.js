/* ==========================================================================
   Enhancements · 27.09.2026
   Loaded after script.js, refinement.js and ai-optical.js. It only uses the
   site's existing links and events, so script.js stays the single source of
   truth for page switching.
   ========================================================================== */
(() => {
  const MAIN_TITLE = document.title;

  // Tab/history titles per "page" of the one-page site
  // (Impressum, AGB and Datenschutz intentionally keep the original title).
  const PAGE_TITLES = [
    ['ai-page', 'AI Insights | Stefan Aberer'],
    ['video-editing-page', 'Tech Insights | Stefan Aberer'],
    ['miscellaneous-page', 'AI Masterclass | Stefan Aberer'],
    ['masterclass-access-page', 'Masterclass Access | Stefan Aberer'],
    ['images-page', 'Images | Stefan Aberer']
  ];

  // Short, shareable aliases (e.g. stefan-aberer.at/#masterclass).
  const HASH_ALIASES = {
    '#tech': '#videoEditing',
    '#video-editing': '#videoEditing',
    '#masterclass': '#misc',
    '#miscellaneous': '#misc',
    '#work': '#portfolio',
    '#contact': '#contact-cta'
  };
  // Aliases that point to a section of the start page rather than a subpage.
  const MAIN_SECTION_ALIASES = new Set(['#portfolio', '#contact-cta']);

  const isShown = id => {
    const page = document.getElementById(id);
    return Boolean(page) && getComputedStyle(page).display !== 'none';
  };

  function syncTitle() {
    const match = PAGE_TITLES.find(([id]) => isShown(id));
    document.title = match ? match[1] : MAIN_TITLE;
  }

  const scheduleTitle = () => window.setTimeout(syncTitle, 0);

  function findSubpageLink(hash) {
    return Array.from(document.querySelectorAll('.page-link')).find(link =>
      link.getAttribute('href') === hash && link.dataset.page && link.dataset.page !== 'main'
    );
  }

  /* Deep links: stefan-aberer.at/#ai, #videoEditing, #misc … open the right
     page on first load (previously only the legal pages did). The site's own
     popstate handler performs the switch, so no extra history entry is made. */
  function openInitialHash() {
    let hash = location.hash;
    if (!hash || hash === '#home') return;

    const alias = HASH_ALIASES[hash.toLowerCase()];
    if (alias) {
      hash = alias;
      history.replaceState(history.state, '', hash);
      if (MAIN_SECTION_ALIASES.has(alias)) {
        document.getElementById(alias.slice(1))?.scrollIntoView();
        return;
      }
    }

    if (!findSubpageLink(hash)) return;
    window.dispatchEvent(new PopStateEvent('popstate', { state: history.state }));
  }

  /* Keep keyboard focus inside the open video lightbox / image preview. */
  function keepFocusInDialogs(event) {
    const dialogs = [
      [document.getElementById('video-lightbox'), 'show', '.close-btn'],
      [document.getElementById('image-modal'), 'active', '.image-modal-close']
    ];
    for (const [dialog, openClass, closeSelector] of dialogs) {
      if (!dialog || !dialog.classList.contains(openClass)) continue;
      if (!dialog.contains(event.target)) dialog.querySelector(closeSelector)?.focus();
      return;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const year = String(new Date().getFullYear());
    document.querySelectorAll('[data-current-year]').forEach(node => {
      node.textContent = year;
    });

    openInitialHash();
    scheduleTitle();

    document.addEventListener('click', event => {
      if (event.target.closest('.page-link, #homeLink')) scheduleTitle();
    });

    window.addEventListener('popstate', scheduleTitle);
    document.addEventListener('focusin', keepFocusInDialogs);
  });
})();

import { mountFooterSignal } from './motion/footer-cross-signal.js?v=20261002-link-fade';

const fields = Array.from(document.querySelectorAll('.footer-magnet .magnet-grid'), canvas => {
  canvas.setAttribute('aria-hidden', 'true');
  return mountFooterSignal(canvas);
}).filter(Boolean);

window.addEventListener('pagehide', event => {
  if (!event.persisted) fields.forEach(field => field.destroy());
});

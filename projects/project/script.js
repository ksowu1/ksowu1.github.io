/* script.js
   - Navigation toggle
   - Slider with auto-play, infinite loop, dots, touch + keyboard
*/

document.addEventListener('DOMContentLoaded', () => {
  // Year in footer
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // NAV TOGGLE
  const navToggle = document.querySelector('.nav-toggle');
  const primaryNav = document.getElementById('primary-nav');
  if (navToggle && primaryNav) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      if (!expanded) {
        primaryNav.setAttribute('aria-hidden', 'false');
      } else {
        primaryNav.setAttribute('aria-hidden', 'true');
      }
    });
  }

  /* ====== SLIDER ====== */
  const slider = document.querySelector('.project-slider');
  const slidesWrap = document.querySelector('.slides');
  const slideNodes = Array.from(document.querySelectorAll('.project-card'));
  const prevBtn = document.querySelector('.prev');
  const nextBtn = document.querySelector('.next');
  const dotsContainer = document.querySelector('.dots');

  if (!slidesWrap || slideNodes.length === 0) return;

  // Build dots
  slideNodes.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot';
    dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    dot.setAttribute('data-index', i);
    dot.setAttribute('aria-label', `Show slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  // Clone nodes for infinite effect
  const clonesBefore = slideNodes.map(node => node.cloneNode(true));
  const clonesAfter = slideNodes.map(node => node.cloneNode(true));
  clonesBefore.forEach(n => slidesWrap.insertBefore(n, slidesWrap.firstChild));
  clonesAfter.forEach(n => slidesWrap.appendChild(n));

  // State
  let idx = 0; // logical index (0..n-1)
  const n = slideNodes.length;
  let isAnimating = false;
  const slideWidth = () => slider.clientWidth; // slides are 100% width

  // Set initial transform to show first real slide (after clonesBefore)
  const startPos = -n * slideWidth();
  slidesWrap.style.transform = `translateX(${startPos}px)`;

  // Helpers
  function setDots(i) {
    const dots = Array.from(dotsContainer.children);
    dots.forEach((d, j) => d.setAttribute('aria-selected', j === i ? 'true' : 'false'));
  }

  function normalizeIndex(i) {
    // wrap to [0..n-1]
    return ((i % n) + n) % n;
  }

  function goTo(newIndex, immediate = false) {
    if (isAnimating) return;
    isAnimating = true;

    idx = normalizeIndex(newIndex);
    // target position = -(n + idx) * width
    const w = slideWidth();
    const target = -(n + idx) * w;
    slidesWrap.style.transition = immediate ? 'none' : 'transform 450ms cubic-bezier(.2,.9,.3,1)';
    slidesWrap.style.transform = `translateX(${target}px)`;

    // After transition: if at clones, jump without animation to real slide
    if (!immediate) {
      setTimeout(() => {
        // clear transition to jump if needed
        slidesWrap.style.transition = 'none';
        slidesWrap.style.transform = `translateX(${target}px)`;
        setTimeout(() => { slidesWrap.style.transition = ''; isAnimating = false; }, 20);
      }, 470);
    } else {
      isAnimating = false;
    }
    setDots(idx);
  }

  function next() { goTo(idx + 1); }
  function prev() { goTo(idx - 1); }

  nextBtn && nextBtn.addEventListener('click', () => { pauseAuto(); next(); });
  prevBtn && prevBtn.addEventListener('click', () => { pauseAuto(); prev(); });

  // Keyboard navigation
  slider.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { pauseAuto(); next(); }
    if (e.key === 'ArrowLeft') { pauseAuto(); prev(); }
  });
  // Make slider focusable
  slider.setAttribute('tabindex', '0');

  // Touch support (simple swipe)
  let startX = 0, endX = 0;
  slider.addEventListener('pointerdown', e => { startX = e.clientX; pauseAuto(); slider.setPointerCapture(e.pointerId); });
  slider.addEventListener('pointerup', e => {
    endX = e.clientX;
    const delta = endX - startX;
    if (Math.abs(delta) > 40) {
      if (delta < 0) next(); else prev();
    }
  });

  // Auto-play
  let intervalId = null;
  const AUTO_MS = 5500;

  function startAuto() {
    if (intervalId) return;
    intervalId = setInterval(() => goTo(idx + 1), AUTO_MS);
  }
  function pauseAuto() {
    if (intervalId) { clearInterval(intervalId); intervalId = null; }
  }

  // Pause on hover/focus
  slider.addEventListener('mouseenter', pauseAuto);
  slider.addEventListener('mouseleave', startAuto);
  slider.addEventListener('focusin', pauseAuto);
  slider.addEventListener('focusout', startAuto);

  // Resize: recompute position
  window.addEventListener('resize', () => {
    slidesWrap.style.transition = 'none';
    slidesWrap.style.transform = `translateX(${-(n + idx) * slideWidth()}px)`;
    setTimeout(() => { slidesWrap.style.transition = ''; }, 20);
  });

  // Start
  startAuto();
  setDots(0);
});

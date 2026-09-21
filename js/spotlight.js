// Hero Spotlight — one project on stage, the rest queued as thumbnails.
// Adapts automatically to any number of projects: add another hidden
// .spotlight-slide template and it becomes a stage slide + thumbnail + dot.

import { attachTilt } from './tilt.js';

const INTERVAL = 6000;

export function setupSpotlight() {
  const spotlight = document.querySelector('.spotlight');
  if (!spotlight) return; // Exit if spotlight is not on this page

  const stage = spotlight.querySelector('.spotlight__stage');
  const meta = spotlight.querySelector('.spotlight__meta');
  const titleEl = spotlight.querySelector('.spotlight__title');
  const captionEl = spotlight.querySelector('.spotlight__caption');
  const ctaEl = spotlight.querySelector('.spotlight__cta');
  const dotsContainer = spotlight.querySelector('.spotlight__dots');
  const thumbsContainer = spotlight.querySelector('.spotlight__thumbs');

  // Projects are declared as hidden templates in the HTML — one per project.
  // Note: <template> content lives in a DocumentFragment, so query .content
  const projects = Array.from(document.querySelectorAll('template.spotlight-slide')).map(slide => ({
    title: slide.dataset.title,
    caption: slide.dataset.caption,
    href: slide.content.querySelector('a').getAttribute('href'),
    img: slide.content.querySelector('img').getAttribute('src'),
    alt: slide.content.querySelector('img').getAttribute('alt')
  }));
  if (!projects.length) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = 0;

  // Build stage slides, progress dots, and thumbnails from the templates
  const imgs = projects.map((p, i) => {
    const img = document.createElement('img');
    img.src = p.img;
    img.alt = p.alt;
    img.loading = i === 0 ? 'eager' : 'lazy';
    stage.insertBefore(img, stage.firstChild);
    return img;
  });

  const dots = projects.map((p, i) => {
    const dot = document.createElement('button');
    dot.className = 'spotlight__dot';
    dot.setAttribute('aria-label', `Show project ${i + 1}: ${p.title}`);
    const fill = document.createElement('span');
    fill.className = 'fill';
    dot.appendChild(fill);
    dot.addEventListener('click', () => { show(i); restartAutoplay(); });
    dotsContainer.appendChild(dot);
    return dot;
  });

  const thumbs = projects.map((p, i) => {
    const thumb = document.createElement('img');
    thumb.src = p.img;
    thumb.alt = `Show ${p.title}`;
    thumb.loading = 'lazy';
    thumb.className = 'spotlight__thumb';
    thumb.addEventListener('click', () => { show(i); restartAutoplay(); });
    thumbsContainer.appendChild(thumb);
    return thumb;
  });

  function show(i) {
    current = ((i % projects.length) + projects.length) % projects.length;
    const p = projects[current];

    imgs.forEach((img, k) => img.classList.toggle('is-on', k === current));
    thumbs.forEach((t, k) => t.classList.toggle('on', k === current));

    titleEl.textContent = p.title;
    captionEl.textContent = p.caption;
    ctaEl.href = p.href;
    ctaEl.setAttribute('aria-label', `View project: ${p.title}`);

    // Retrigger the staggered text entrance
    meta.classList.remove('swap');
    void meta.offsetWidth;
    meta.classList.add('swap');

    // Restart the progress fill on the active dot only
    dots.forEach((d, k) => {
      d.classList.remove('on');
      if (k === current) {
        void d.offsetWidth;
        d.classList.add('on');
      }
    });
  }

  // Autoplay is driven by the pill fill's animationend (below).
  // startAutoplay = let the fill run; stopAutoplay = freeze it via CSS class.
  function startAutoplay() {
    if (reducedMotion) return;
    spotlight.classList.remove('spotlight--paused');
  }

  function stopAutoplay() {
    spotlight.classList.add('spotlight--paused');
  }

  function restartAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  // Hover pause: freeze the fill animation via CSS so pill and clock can't drift
  stage.addEventListener('mouseenter', stopAutoplay);
  stage.addEventListener('mouseleave', startAutoplay);

  // The active pill's fill IS the clock: when it finishes filling, advance.
  // Hovering the card pauses the animation (CSS) so pill and timer can never drift apart.
  dotsContainer.addEventListener('animationend', (e) => {
    if (e.animationName === 'dotFill') show(current + 1);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) spotlight.classList.add('spotlight--paused');
    else spotlight.classList.remove('spotlight--paused');
  });

  // Card hover: 3D tilt toward the cursor, shared implementation.
  attachTilt(stage, stage, { maxTilt: 8, onFrame: (x, y) => {
    // Compose the full transform each frame — the -8px lift is part of the
    // tilt pose (the resting state clears the transform entirely).
    stage.style.transform = `perspective(1000px) rotateY(${x.toFixed(3)}deg) rotateX(${y.toFixed(3)}deg) translateY(-8px)`;
  }});

  show(0);
  startAutoplay();
}

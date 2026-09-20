console.clear();

import { WebPet } from './webpet/web-pet.js';

function initHeroConsole() {
  const consoleElement = document.querySelector('.hero-console');
  if (!consoleElement) return;

  const textTargets = Array.from(consoleElement.querySelectorAll('.hero-console__text'));
  const cursors = Array.from(consoleElement.querySelectorAll('.hero-console__underscore'));
  const sharpRow = consoleElement.querySelector('.hero-console__row--sharp');
  const words = ['Cup of Jay', 'Neon Terminal.', 'Made with Love.'];
  const darkModeColors = ['#3d81ff', '#3ff0b8', '#ff9e9e'];
  const lightModeColors = ['#121212', '#121212', '#121212'];
  const getThemeColors = () => document.documentElement.classList.contains('light-mode')
    ? lightModeColors
    : darkModeColors;
  let colors = [...getThemeColors()];
  let colorIndex = 0;
  const getCurrentColor = () => colors[colorIndex];
  let letterCount = 1;
  let direction = 1;
  let waiting = false;
  let cursorVisible = true;

  const renderText = () => {
    const text = words[0].substring(0, Math.max(0, letterCount));
    textTargets.forEach((target) => {
      target.textContent = text;
    });
  };

  const setColor = (color) => {
    consoleElement.style.setProperty('--hero-console-shadow-color', color);
    sharpRow.style.color = color;
  };

  const applyThemePalette = () => {
    colors = [...getThemeColors()];
    colorIndex %= colors.length;
    setColor(getCurrentColor());
  };

  const handleThemeChange = () => {
    applyThemePalette();
  };

  applyThemePalette();
  renderText();

  document.addEventListener('themechange', handleThemeChange);

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    letterCount = words[0].length;
    renderText();
    return;
  }

  let typeTimer = null;
  let cursorTimer = null;

  const startTypeTimer = () => {
    typeTimer = window.setInterval(() => {
      if (waiting) return;

      if (letterCount === 0) {
        renderText();
        waiting = true;
        // Crossfade to the next color now, while only the blinking cursor is
        // visible — the new word then types in already at its final color.
        colorIndex = (colorIndex + 1) % colors.length;
        setColor(getCurrentColor());
        window.setTimeout(() => {
          words.push(words.shift());
          direction = 1;
          letterCount = 1;
          waiting = false;
          renderText();
        }, 1000);
      } else if (letterCount === words[0].length + 1) {
        waiting = true;
        window.setTimeout(() => {
          direction = -1;
          letterCount = words[0].length;
          waiting = false;
          renderText();
        }, 1000);
      } else {
        renderText();
        letterCount += direction;
      }
    }, 120);
  };

  const startCursorTimer = () => {
    cursorTimer = window.setInterval(() => {
      cursorVisible = !cursorVisible;
      cursors.forEach((cursor) => {
        cursor.classList.toggle('hero-console__underscore--hidden', !cursorVisible);
      });
    }, 400);
  };

  const startAnimation = () => {
    if (typeTimer || cursorTimer) return;
    startTypeTimer();
    startCursorTimer();
  };

  const stopAnimation = () => {
    if (typeTimer) {
      window.clearInterval(typeTimer);
      typeTimer = null;
    }
    if (cursorTimer) {
      window.clearInterval(cursorTimer);
      cursorTimer = null;
    }
  };

  startAnimation();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAnimation();
    } else {
      startAnimation();
    }
  });
}

initHeroConsole();

// Simple page load animation trigger - ensures navigation plays on load
window.addEventListener('load', () => {
  const nav = document.querySelector('.nav');
  setTimeout(() => {
    nav.classList.add('nav-active');
  }, 150);
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // Remove active class from all nav links
    document.querySelectorAll('.nav__main-list .nav__list-item').forEach(item => {
        item.classList.remove('nav__list-item--active');
    });

    // Add active class to the current page's nav link
    if (currentPage === 'index.html') {
        const homeLink = document.querySelector('.nav__main-list a[href="index.html"]');
        if (homeLink) {
            homeLink.parentElement.classList.add('nav__list-item--active');
        }
    } else if (currentPage === 'projects.html') {
        const projectsLink = document.querySelector('.nav__main-list a[href="projects.html"]');
        if (projectsLink) {
            projectsLink.parentElement.classList.add('nav__list-item--active');
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        heroSection.style.position = 'relative';

        // Determine base path for assets based on environment
        const isLive = window.location.hostname === 'josircalica14.github.io';
        const basePath = isLive ? '/Cup-of-Jay-Portfolio-Project/webpet/sprites' : './webpet/sprites';

        const myPet = new WebPet({
            animal: 'totoro',
            color: 'gray',
            container: heroSection,
            scale: 0.5,
            message: "Hi there!",
            base: basePath
        });

        const akita = new WebPet({
            animal: 'dog',
            color: 'akita',
            container: heroSection,
            scale: 0.5,
            message: "Arf arf!",
            base: basePath
        });
    }

    const aboutSection = document.querySelector('.about-section');
    if (aboutSection) {
        aboutSection.style.position = 'relative';

        // Determine base path for assets based on environment
        const isLive = window.location.hostname === 'josircalica14.github.io';
        const basePath = isLive ? '/Cup-of-Jay-Portfolio-Project/webpet/sprites' : './webpet/sprites';

        const rex = new WebPet({
            animal: 'rex',
            color: 'dino_rex',
            container: document.body,
            scale: 0.3,
            message: "Rwar!",
            base: basePath,
            position: 'fixed'
        });
    }
});


// Hero image 3D tilt on mouse move
const heroImage = document.querySelector('.hero-image');
const heroSection = document.querySelector('.hero-section');

if (heroImage && heroSection) {
  const MAX_TILT = 12;
  const SCALE_ON_HOVER = 1.04;
  const isDark = () => !document.body.classList.contains('light-mode');

  heroSection.addEventListener('mousemove', (e) => {
    const rect = heroImage.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    const rotY = dx * MAX_TILT;
    const rotX = -dy * MAX_TILT * 0.6;

    // Glow intensity based on tilt magnitude
    const intensity = Math.sqrt(dx * dx + dy * dy);
    const glowSize = 20 + intensity * 30;
    const glowOpacity = 0.5 + intensity * 0.4;

    const glow = isDark()
      ? `drop-shadow(0 8px 18px rgba(0,0,0,0.85)) drop-shadow(0 0 4px rgba(255, 255, 255, 0.9)) drop-shadow(0 0 14px rgba(255, 255, 255, 0.6)) drop-shadow(0 0 28px rgba(255, 255, 255, 0.4))`
      : `drop-shadow(0 12px 22px rgba(0,0,0,0.3)) drop-shadow(0 0 4px rgba(255, 255, 255, 0.9))`;

    heroImage.classList.remove('tilt-reset');
    heroImage.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${SCALE_ON_HOVER})`;
    heroImage.style.filter = glow;
  });

  heroSection.addEventListener('mouseleave', () => {
    heroImage.classList.add('tilt-reset');
    heroImage.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
    heroImage.style.filter = '';
  });
}

// Sticky nav — add frosted background after scrolling past hero
const nav = document.querySelector('.nav');
const mobileBar = document.querySelector('.mobile-nav__bar');
const hero = document.querySelector('.hero-section');

function updateNav() {
  const scrolled = window.scrollY > 10;
  nav.classList.toggle('nav--scrolled', scrolled);
  if (mobileBar) mobileBar.classList.toggle('mobile-nav__bar--scrolled', scrolled);
}

window.addEventListener('scroll', updateNav, { passive: true });
updateNav();

// Theme toggle functionality
const themeCheckbox = document.getElementById('theme-checkbox');
const body = document.body;

// Sync body class from html class set by inline script
const savedTheme = localStorage.getItem('theme') || 'dark-mode';
body.className = savedTheme;
document.documentElement.className = savedTheme;

if (savedTheme === 'light-mode') {
    themeCheckbox.checked = true;
}

themeCheckbox.addEventListener('change', () => {
  const newTheme = themeCheckbox.checked ? 'light-mode' : 'dark-mode';
  body.className = newTheme;
  document.documentElement.className = newTheme;
  localStorage.setItem('theme', newTheme);
  document.dispatchEvent(new CustomEvent('themechange'));
});

// Hero Spotlight — one project on stage, the rest queued as thumbnails.
// Adapts automatically to any number of projects: add another hidden
// .spotlight-slide template and it becomes a stage slide + thumbnail + dot.
document.addEventListener('DOMContentLoaded', () => {
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

  const INTERVAL = 6000;
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

  // Card hover: 3D tilt toward the cursor (pointer devices only, not touch, not reduced-motion).
  // A rAF easing loop interpolates current -> target angles, so cursor tracking AND
  // the return-to-flat on leave are both buttery instead of snapping.
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (finePointer && !reducedMotion) {
    let targetX = 0, targetY = 0, curX = 0, curY = 0, rafId = null;

    const tick = () => {
      // Ease ~9% toward target each frame — smooth in, graceful settle out
      curX += (targetX - curX) * 0.09;
      curY += (targetY - curY) * 0.09;
      stage.style.transform = `perspective(1000px) rotateY(${curX.toFixed(3)}deg) rotateX(${curY.toFixed(3)}deg) translateY(-8px)`;
      if (Math.abs(targetX - curX) > 0.005 || Math.abs(targetY - curY) > 0.005) {
        rafId = requestAnimationFrame(tick);
      } else {
        rafId = null;
        // Fully settled back to rest — remove the inline transform entirely
        if (targetX === 0 && targetY === 0) stage.style.transform = '';
      }
    };

    const wake = () => { if (!rafId) rafId = requestAnimationFrame(tick); };

    stage.addEventListener('mousemove', (e) => {
      const r = stage.getBoundingClientRect();
      targetX = ((e.clientX - r.left) / r.width - 0.5) * 8;
      targetY = -((e.clientY - r.top) / r.height - 0.5) * 6;
      wake();
    });
    stage.addEventListener('mouseleave', () => {
      targetX = 0;
      targetY = 0;
      wake();
    });
  }

  show(0);
  startAutoplay();
});
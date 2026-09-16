console.clear();

import { WebPet } from './webpet/web-pet.js';

// Simple page load animation trigger - ensures navigation plays on load
window.addEventListener('load', () => {
  const nav = document.querySelector('.nav');
  setTimeout(() => {
    nav.classList.add('nav-active');
  }, 150);
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
            scale: 0.7,
            message: "Hi there!",
            base: basePath
        });

        const akita = new WebPet({
            animal: 'dog',
            color: 'akita',
            container: heroSection,
            scale: 0.6,
            message: "Arf arf!",
            base: basePath
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
});

// Carousel functionality — infinite loop, starts centered on card 1 [ 4 ][ 5 ][ 1* ][ 2 ][ 3 ]
document.addEventListener('DOMContentLoaded', () => {
  const track = document.querySelector('.carousel__track');
  const originalSlides = Array.from(document.querySelectorAll('.carousel__slide'));
  const prevButton = document.querySelector('.carousel__button--prev');
  const nextButton = document.querySelector('.carousel__button--next');
  const indicatorsContainer = document.querySelector('.carousel__indicators');

  const count = originalSlides.length;
  let slidesPerView = getSlidesPerView();
  // trackIndex points into the tripled track; real slides are at [count .. count*2-1]
  let trackIndex = count; // start on real slide 0 (card 1)
  let isTransitioning = false;

  function getSlidesPerView() {
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  }

  function setupTrack() {
    track.innerHTML = '';
    if (isStaticView()) {
      // Just show originals, no cloning
      originalSlides.forEach(s => track.appendChild(s.cloneNode(true)));
    } else {
      // [clones of all] + [originals] + [clones of all]
      [...originalSlides, ...originalSlides, ...originalSlides].forEach(s => {
        track.appendChild(s.cloneNode(true));
      });
    }
  }

  function getPos(index) {
    const slideWidth = 100 / slidesPerView;
    const centerOffset = (slidesPerView - 1) / 2;
    return (index - centerOffset) * slideWidth;
  }

  function setTrackPos(animate) {
    if (isStaticView()) {
      track.style.transition = 'none';
      track.style.transform = 'none';
      return;
    }
    track.style.transition = animate ? 'transform 0.5s ease-in-out' : 'none';
    track.style.transform = `translateX(-${getPos(trackIndex)}%)`;
  }

  function realIndex() {
    return ((trackIndex - count) % count + count) % count;
  }

  function updateFocus() {
    const allSlides = Array.from(track.querySelectorAll('.carousel__slide'));
    allSlides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === trackIndex);
    });
  }

  function updateIndicators() {
    const ri = realIndex();
    Array.from(indicatorsContainer.querySelectorAll('.carousel__indicator'))
      .forEach((btn, i) => btn.classList.toggle('active', i === ri));
    updateFocus();
  }

  function isStaticView() {
    return count <= slidesPerView || count <= 2;
  }

  function updateStaticState() {
    const isStatic = isStaticView();
    prevButton.style.display = isStatic ? 'none' : '';
    nextButton.style.display = isStatic ? 'none' : '';
    indicatorsContainer.style.display = isStatic ? 'none' : '';
    track.classList.toggle('carousel__track--static', isStatic);
    if (isStatic) {
      clearInterval(autoplayTimer);
    }
  }

  function goNext() {
    if (isTransitioning || isStaticView()) return;
    isTransitioning = true;
    trackIndex++;
    setTrackPos(true);
    updateIndicators();
  }

  function goPrev() {
    if (isTransitioning || isStaticView()) return;
    isTransitioning = true;
    trackIndex--;
    setTrackPos(true);
    updateIndicators();
  }

  // After each transition, silently jump back into the middle set if we've drifted
  track.addEventListener('transitionend', () => {
    isTransitioning = false;
    if (trackIndex >= count * 2) {
      trackIndex -= count;
      setTrackPos(false);
    } else if (trackIndex < count) {
      trackIndex += count;
      setTrackPos(false);
    }
    updateFocus();
  });

  function goToReal(ri) {
    if (isTransitioning) return;
    isTransitioning = true;
    // Navigate to the real slide in the middle set
    trackIndex = count + ri;
    setTrackPos(true);
    updateIndicators();
    setTimeout(() => { isTransitioning = false; }, 520);
  }

  function createIndicators() {
    indicatorsContainer.innerHTML = '';
    originalSlides.forEach((_, i) => {
      const btn = document.createElement('button');
      btn.classList.add('carousel__indicator');
      if (i === realIndex()) btn.classList.add('active');
      btn.addEventListener('click', () => { goToReal(i); resetAutoplay(); });
      indicatorsContainer.appendChild(btn);
    });
  }

  prevButton.addEventListener('click', () => { goPrev(); resetAutoplay(); });
  nextButton.addEventListener('click', () => { goNext(); resetAutoplay(); });
  prevButton.disabled = false;
  nextButton.disabled = false;

  // Autoplay — advances every 3s, resets on manual interaction
  let autoplayTimer;

  function startAutoplay() {
    if (isStaticView()) return;
    autoplayTimer = setInterval(goNext, 3000);
  }

  function resetAutoplay() {
    clearInterval(autoplayTimer);
    startAutoplay();
  }

  // Pause on hover
  track.addEventListener('mouseenter', () => clearInterval(autoplayTimer));
  track.addEventListener('mouseleave', startAutoplay);

  window.addEventListener('resize', () => {
    const ri = realIndex();
    slidesPerView = getSlidesPerView();
    setupTrack();
    trackIndex = count + ri;
    setTrackPos(false);
    updateStaticState();
  });

  slidesPerView = getSlidesPerView();
  setupTrack();
  createIndicators();
  setTrackPos(false);
  updateFocus();
  updateStaticState();
  startAutoplay();


});
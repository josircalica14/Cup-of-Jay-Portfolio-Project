console.clear();

// Simple page load animation trigger - ensures navigation plays on load
window.addEventListener('load', () => {
  const nav = document.querySelector('.nav');
  setTimeout(() => {
    nav.classList.add('nav-active');
  }, 150);
});

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

// Check for saved theme preference or default to dark mode
const currentTheme = localStorage.getItem('theme') || 'dark-mode';
body.classList.add(currentTheme);

// Set checkbox state based on theme
if (currentTheme === 'light-mode') {
    themeCheckbox.checked = true;
}

// Toggle theme on checkbox change
themeCheckbox.addEventListener('change', () => {
  if (themeCheckbox.checked) {
    body.classList.remove('dark-mode');
    body.classList.add('light-mode');
    localStorage.setItem('theme', 'light-mode');
  } else {
    body.classList.remove('light-mode');
    body.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark-mode');
  }
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
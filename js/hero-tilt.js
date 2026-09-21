// Hero image 3D tilt — cursor-tracked rotation plus a theme-aware glow that
// scales with tilt intensity (dark mode only; CSS owns light-mode glow).

import { getTheme } from './theme.js';
import { attachTilt } from './tilt.js';

const MAX_TILT = 12;
const SCALE_ON_HOVER = 1.04;

export function setupHeroTilt() {
  const heroImage = document.querySelector('.hero-image');
  const heroSection = document.querySelector('.hero-section');
  if (!heroImage || !heroSection) return;

  const isDark = () => getTheme() === 'dark-mode';

  attachTilt(heroImage, heroSection, {
    maxTilt: MAX_TILT,
    onFrame: (x, y) => {
      // (0,0) means attachTilt fully settled and cleared the transform —
      // don't re-apply scale/glow to the resting image.
      if (x === 0 && y === 0) return;
      const intensity = Math.min(1, Math.sqrt(x * x + y * y) / MAX_TILT);
      const glow = isDark()
        ? `drop-shadow(0 8px 18px rgba(0,0,0,0.85)) drop-shadow(0 0 4px rgba(255, 255, 255, 0.9)) drop-shadow(0 0 14px rgba(255, 255, 255, 0.6)) drop-shadow(0 0 28px rgba(255, 255, 255, 0.4))`
        : `drop-shadow(0 12px 22px rgba(0,0,0,0.3)) drop-shadow(0 0 4px rgba(255, 255, 255, 0.9))`;
      heroImage.classList.remove('tilt-reset');
      heroImage.style.filter = glow;
      // Compose the full transform (tilt.js wrote the rotation; add the hover scale)
      heroImage.style.transform = `perspective(1000px) rotateY(${x.toFixed(3)}deg) rotateX(${y.toFixed(3)}deg) scale(${SCALE_ON_HOVER})`;
    },
  });

  heroSection.addEventListener('mouseleave', () => {
    heroImage.classList.add('tilt-reset');
    heroImage.style.filter = '';
  });
}

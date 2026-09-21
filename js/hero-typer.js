// Hero console — typewriter cycling "Cup of Jay / Neon Terminal. / Made with Love."
// with a color crossfade that lands while only the cursor is visible.
// Theme palette is owned by CSS (body.light-mode rules in style.css);
// this module only sets the per-word accent color in dark mode.

import { onChange } from './theme.js';

const WORDS = ['Cup of Jay', 'Neon Terminal.', 'Made with Love.'];
const DARK_ACCENTS = ['#3d81ff', '#3ff0b8', '#ff9e9e'];

export function setupHeroTyper() {
  const consoleElement = document.querySelector('.hero-console');
  if (!consoleElement) return;

  const textTargets = Array.from(consoleElement.querySelectorAll('.hero-console__text'));
  const cursors = Array.from(consoleElement.querySelectorAll('.hero-console__underscore'));
  const sharpRow = consoleElement.querySelector('.hero-console__row--sharp');

  let colors = [...DARK_ACCENTS];
  let colorIndex = 0;
  let letterCount = 1;
  let direction = 1;
  let waiting = false;
  let cursorVisible = true;

  const renderText = () => {
    const text = WORDS[0].substring(0, Math.max(0, letterCount));
    textTargets.forEach((target) => { target.textContent = text; });
  };

  const setColor = (color) => {
    consoleElement.style.setProperty('--hero-console-shadow-color', color);
    sharpRow.style.color = color;
  };

  const refreshPalette = () => {
    // In light mode CSS forces black via body.light-mode rules, so the
    // inline value only needs to be right for dark mode.
    colors = [...DARK_ACCENTS];
    colorIndex %= colors.length;
    setColor(colors[colorIndex]);
  };

  onChange(refreshPalette);
  refreshPalette();
  renderText();

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    letterCount = WORDS[0].length;
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
        setColor(colors[colorIndex]);
        window.setTimeout(() => {
          WORDS.push(WORDS.shift());
          direction = 1;
          letterCount = 1;
          waiting = false;
          renderText();
        }, 1000);
      } else if (letterCount === WORDS[0].length + 1) {
        waiting = true;
        window.setTimeout(() => {
          direction = -1;
          letterCount = WORDS[0].length;
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
    if (typeTimer) { window.clearInterval(typeTimer); typeTimer = null; }
    if (cursorTimer) { window.clearInterval(cursorTimer); cursorTimer = null; }
  };

  startAnimation();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAnimation();
    else startAnimation();
  });
}

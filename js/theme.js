// Theme — the single writer of theme state.
// Owns: classList on <html> + <body>, localStorage, the themechange event,
// and the toggle checkbox. Other modules read via getTheme()/onChange();
// none of them may touch documentElement/body classes directly.
// (The tiny inline <head> script in each page is the only other writer —
// it exists solely to apply the saved theme before first paint, anti-FOUC.)

const STORAGE_KEY = 'theme';
export const DARK = 'dark-mode';
export const LIGHT = 'light-mode';

export function getTheme() {
  return document.documentElement.classList.contains(LIGHT) ? LIGHT : DARK;
}

// classList (not className=) so we never wipe unrelated classes.
export function applyTheme(theme, { persist = true } = {}) {
  const light = theme === LIGHT;
  for (const el of [document.documentElement, document.body]) {
    el.classList.toggle(LIGHT, light);
    el.classList.toggle(DARK, !light);
  }
  if (persist) localStorage.setItem(STORAGE_KEY, theme);
}

export function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEY) || DARK;
  applyTheme(saved, { persist: false });

  const checkbox = document.getElementById('theme-checkbox');
  if (!checkbox) return;

  checkbox.checked = saved === LIGHT;
  checkbox.addEventListener('change', () => {
    applyTheme(checkbox.checked ? LIGHT : DARK);
    document.dispatchEvent(new CustomEvent('themechange'));
  });
}

export function onChange(callback) {
  document.addEventListener('themechange', callback);
}

// Navigation — one PAGES list is the single source of truth for every page's
// nav markup and the active link; scrolled-frost and load animation live here.

export const PAGES = [
  { label: 'Home', href: 'index.html' },
  { label: 'Projects', href: 'projects.html' },
  { label: 'Gallery', href: null },   // null href = placeholder until the page exists
  { label: 'Blogs', href: null },
  { label: 'About', href: null },
  { label: 'Contact', href: null },
];

function isActive(href) {
  if (!href) return false;
  const current = window.location.pathname.split('/').pop() || 'index.html';
  return current === href;
}

// Desktop list + mobile drawer render from PAGES, so both stay in sync
// and the active state falls out of the URL — no per-page JS branches.
export function renderNavLinks() {
  const desktop = document.querySelector('.nav__main-list');
  if (desktop) {
    desktop.innerHTML = PAGES.map(p => `
      <li class="nav__list-item${isActive(p.href) ? ' nav__list-item--active' : ''}">
        <a href="${p.href || '#'}">${p.label}</a>
      </li>`).join('');
  }

  const drawer = document.querySelector('.mobile-nav__list');
  if (drawer) {
    drawer.innerHTML = PAGES.map(p => `
      <li><a href="${p.href || '#'}"${isActive(p.href) ? ' class="active"' : ''}>${p.label}</a></li>`).join('');
  }
}

export function setupNavScroll() {
  const nav = document.querySelector('.nav');
  const mobileBar = document.querySelector('.mobile-nav__bar');

  const update = () => {
    const scrolled = window.scrollY > 10;
    if (nav) nav.classList.toggle('nav--scrolled', scrolled);
    if (mobileBar) mobileBar.classList.toggle('mobile-nav__bar--scrolled', scrolled);
    // Drives the full-width blur strip under the scrolled navbar
    document.body.classList.toggle('nav-scrolled', scrolled);
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

export function setupNavLoadAnimation() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  window.addEventListener('load', () => {
    setTimeout(() => nav.classList.add('nav-active'), 150);
  });
}

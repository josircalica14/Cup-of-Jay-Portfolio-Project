// Web pets — one spriteBase() adapter resolves the deploy path once,
// and a declarative SPAWN list replaces the copy-pasted per-section blocks.
// Adding a pet is one entry: { animal, color, container, scale, message }.

import { WebPet } from '../webpet/web-pet.js';

// One adapter for the "where do sprites live" decision (local vs GitHub Pages).
function spriteBase() {
  const isLive = window.location.hostname === 'josircalica14.github.io';
  return isLive
    ? '/Cup-of-Jay-Portfolio-Project/webpet/sprites'
    : './webpet/sprites';
}

const SPAWN = [
  {
    section: '.hero-section',
    position: 'absolute',
    pets: [
      { animal: 'totoro', color: 'gray', scale: 0.5, message: 'Hi there!' },
      { animal: 'dog', color: 'akita', scale: 0.5, message: 'Arf arf!' },
    ],
  },
  {
    // The rex is fixed to the viewport and would be clipped by the about
    // section's overflow:hidden — so it attaches to <body> like the original.
    section: '.about-section',
    attachTo: 'body',
    position: 'fixed',
    pets: [
      { animal: 'rex', color: 'dino_rex', scale: 0.3, message: 'Rwar!' },
    ],
  },
];

export function setupPets() {
  const base = spriteBase();

  for (const { section, attachTo, position, pets } of SPAWN) {
    const gate = document.querySelector(section);
    if (!gate) continue; // Section not on this page
    const container = attachTo === 'body' ? document.body : gate;
    if (gate !== container) gate.style.position = 'relative';

    for (const pet of pets) {
      new WebPet({ ...pet, container, base, position });
    }
  }
}

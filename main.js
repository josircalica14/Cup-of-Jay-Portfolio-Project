// Entry point — detects which features the current page has and wires
// each feature module. All DOM feature logic lives in js/* modules.

import { initTheme } from './js/theme.js';
import { setupHeroTyper } from './js/hero-typer.js';
import { setupHeroTilt } from './js/hero-tilt.js';
import { setupSpotlight } from './js/spotlight.js';
import { setupPets } from './js/pets.js';
import { renderNavLinks, setupNavScroll, setupNavLoadAnimation } from './js/nav.js';

initTheme();
renderNavLinks();
setupNavScroll();
setupNavLoadAnimation();

setupHeroTyper();
setupHeroTilt();
setupSpotlight();

document.addEventListener('DOMContentLoaded', setupPets);

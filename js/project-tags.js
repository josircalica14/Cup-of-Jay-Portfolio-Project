// Project card tags — collapse any tag that wraps to a second row into an
// overflow pill ("+N"); clicking it opens a popover with the hidden pills.
// Re-measures on resize so the collapse follows the card's fluid width.

function measure(container) {
  const tags = Array.from(container.querySelectorAll('.project-band__tag'));
  return { tags, fit: findFitting(tags, container) };
}

// Walk the pills and keep only those on the first visual row.
function findFitting(tags, container) {
  const containerTop = container.getBoundingClientRect().top;
  const fitting = [];
  for (const tag of tags) {
    if (tag.getBoundingClientRect().top - containerTop < 5) fitting.push(tag);
    else break;
  }
  return fitting;
}

function initContainer(container) {
  // Skip anything already initialized (re-runs on resize)
  if (container.dataset.tagsInit) return;
  container.dataset.tagsInit = 'true';

  let overflowBtn = null;
  let popover = null;
  let hideTimer = null;

  const hidePopover = () => {
    if (popover) popover.remove();
    if (overflowBtn) overflowBtn.setAttribute('aria-expanded', 'false');
    popover = null;
  };

  // Hover intent: always OPEN (no-op if already open) — never toggles.
  const openPopover = () => {
    clearTimeout(hideTimer);
    if (popover) return; // already open

    const hidden = Array.from(container.querySelectorAll('.project-band__tag.is-hidden'));
    if (!hidden.length) return;

    popover = document.createElement('div');
    popover.className = 'project-tags-popover';
    hidden.forEach((tag) => {
      const clone = tag.cloneNode(true);
      clone.classList.remove('is-hidden');
      popover.appendChild(clone);
    });
    container.appendChild(popover);

    // Anchor above the +N pill (or below when the card is too short),
    // right-aligned to the row so it never pushes the pills around.
    const cRect = container.getBoundingClientRect();
    const bRect = overflowBtn.getBoundingClientRect();
    const popW = popover.offsetWidth;
    let left = bRect.right - popW + cRect.left;
    left = Math.max(cRect.left, Math.min(left, cRect.right - popW));
    const spaceAbove = bRect.top - cRect.top;
    if (spaceAbove > popover.offsetHeight + 12) {
      popover.style.left = `${left - cRect.left}px`;
      popover.style.bottom = `${cRect.bottom - bRect.top + 8}px`;
    } else {
      popover.style.left = `${left - cRect.left}px`;
      popover.style.top = `${bRect.bottom - cRect.top + 8}px`;
    }

    overflowBtn.setAttribute('aria-expanded', 'true');

    // The popover is part of the hover region — entering it cancels the
    // pending close; leaving it schedules one. (Mouse only; touch uses click.)
    if (window.matchMedia('(hover: hover)').matches) {
      popover.addEventListener('mouseenter', () => clearTimeout(hideTimer));
      popover.addEventListener('mouseleave', () => {
        hideTimer = setTimeout(hidePopover, 250);
      });
    }
  };

  const showPopover = () => {
    if (popover) { hidePopover(); return; } // click = toggle
    openPopover();
  };

  const buildOverflow = (hiddenCount) => {
    overflowBtn = document.createElement('button');
    overflowBtn.type = 'button';
    overflowBtn.className = 'project-band__tag project-band__tag--more';
    overflowBtn.textContent = `+${hiddenCount}`;
    overflowBtn.setAttribute('aria-label', `Show ${hiddenCount} more tags`);
    overflowBtn.setAttribute('aria-expanded', 'false');
    overflowBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showPopover();
    });
  // Hover-open is mouse-only. On touch devices a tap fires a synthetic
  // mouseenter followed by click, which would open-then-toggle-close instantly.
  const canHover = window.matchMedia('(hover: hover)').matches;
  if (canHover) {
    overflowBtn.addEventListener('mouseenter', openPopover);
    overflowBtn.addEventListener('mouseleave', () => {
      hideTimer = setTimeout(hidePopover, 250);
    });
  }
  return overflowBtn;
  };

  const relayout = () => {
    // Clear previous state
    hidePopover();
    container.querySelectorAll('.project-band__tag--more').forEach((b) => b.remove());
    container.querySelectorAll('.project-band__tag').forEach((t) => t.classList.remove('is-hidden'));

    const tags = Array.from(container.querySelectorAll('.project-band__tag'));
    if (tags.length <= 1) return;

    // First pass: are any on a wrapped row?
    const containerTop = container.getBoundingClientRect().top;
    const wrapped = tags.filter((t) => t.getBoundingClientRect().top - containerTop > 5);
    if (!wrapped.length) return; // everything fits

    // Binary-search the largest prefix that still fits once "+N" is appended
    let low = 1, high = tags.length - 1, best = 1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      tags.forEach((t, i) => t.classList.toggle('is-hidden', i >= mid));
      const btn = buildOverflow(tags.length - mid);
      btn.style.position = 'absolute';
      btn.style.visibility = 'hidden';
      container.appendChild(btn);

      const fits = findFitting([...tags.slice(0, mid), btn], container).length === mid + 1;

      btn.remove();
      if (fits) { best = mid; low = mid + 1; } else { high = mid - 1; }
    }

    // Apply the winning layout
    tags.forEach((t, i) => t.classList.toggle('is-hidden', i >= best));
    container.appendChild(buildOverflow(tags.length - best));
  };

  relayout();

  // Re-run when the card's width actually changes (debounced)
  let lastWidth = container.getBoundingClientRect().width;
  const ro = new ResizeObserver(() => {
    const w = container.getBoundingClientRect().width;
    if (Math.abs(w - lastWidth) > 2) {
      lastWidth = w;
      relayout();
    }
  });
  ro.observe(container);

  // Dismiss popover on outside click / Escape
  document.addEventListener('click', (e) => {
    if (popover && !container.contains(e.target)) hidePopover();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popover) hidePopover();
  });
}

export function setupProjectTags() {
  const containers = document.querySelectorAll('.project-band__tags');
  if (!containers.length) return;

  for (const container of containers) {
    initContainer(container);
  }

  // Re-measure after web fonts load (metrics change → wraps change)
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      document.querySelectorAll('.project-band__tags').forEach((c) => {
        c.dataset.tagsInit = '';
        c.querySelectorAll('.project-band__tag--more').forEach((b) => b.remove());
        c.querySelectorAll('.project-band__tag').forEach((t) => t.classList.remove('is-hidden'));
        initContainer(c);
      });
    });
  }
}

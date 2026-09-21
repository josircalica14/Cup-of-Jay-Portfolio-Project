// Hero image 3D tilt on mouse move — one shared easing tilt implementation.
// Also used by the spotlight stage (spotlight.js) so the tilt math exists once.

export function attachTilt(el, trigger, { maxTilt = 12, onFrame = null } = {}) {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let targetX = 0, targetY = 0, curX = 0, curY = 0, rafId = null;

  const tick = () => {
    // Ease ~9% toward target each frame — smooth in, graceful settle out
    curX += (targetX - curX) * 0.09;
    curY += (targetY - curY) * 0.09;
    el.style.transform = `perspective(1000px) rotateY(${curX.toFixed(3)}deg) rotateX(${curY.toFixed(3)}deg)`;
    if (onFrame) onFrame(curX, curY);
    if (Math.abs(targetX - curX) > 0.005 || Math.abs(targetY - curY) > 0.005) {
      rafId = requestAnimationFrame(tick);
    } else {
      rafId = null;
      if (targetX === 0 && targetY === 0) {
        el.style.transform = '';
        if (onFrame) onFrame(0, 0);
      }
    }
  };

  const wake = () => { if (!rafId) rafId = requestAnimationFrame(tick); };

  trigger.addEventListener('mousemove', (e) => {
    const r = el.getBoundingClientRect();
    targetX = ((e.clientX - r.left) / r.width - 0.5) * maxTilt;
    targetY = -((e.clientY - r.top) / r.height - 0.5) * (maxTilt * 0.75);
    wake();
  });
  trigger.addEventListener('mouseleave', () => {
    targetX = 0;
    targetY = 0;
    wake();
  });
}

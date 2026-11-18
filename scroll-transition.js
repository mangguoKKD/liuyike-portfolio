(() => {
  const chapter = document.querySelector('.hero-chapter');
  const stage = document.querySelector('.hero-stage');
  if (!chapter || !stage) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 621px)');
  let frame = 0;
  function update() {
    frame = 0;
    if (reduced.matches || !desktop.matches) {
      stage.style.removeProperty('--bridge-p');
      return;
    }
    const distance = Math.max(1, window.innerHeight * .6);
    const raw = Math.max(0, Math.min(1, -chapter.getBoundingClientRect().top / distance));
    const eased = raw * raw * (3 - 2 * raw);
    stage.style.setProperty('--bridge-p', eased.toFixed(4));
  }
  function requestUpdate() { if (!frame) frame = requestAnimationFrame(update); }
  addEventListener('scroll', requestUpdate, { passive: true });
  addEventListener('resize', requestUpdate, { passive: true });
  addEventListener('pageshow', requestUpdate);
  reduced.addEventListener('change', requestUpdate);
  desktop.addEventListener('change', requestUpdate);
  update();
})();

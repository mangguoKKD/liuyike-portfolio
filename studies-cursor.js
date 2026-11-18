/* Use the first-screen glow pointer only while the desktop pointer is over page two. */
(() => {
  const sections = [...document.querySelectorAll('.studies, #ai, #sancan')];
  if (!sections.length || !matchMedia('(hover:hover) and (pointer:fine)').matches) return;

  const cursor = document.createElement('div');
  cursor.className = 'studies-light-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  document.body.append(cursor);

  function move(event) {
    if (event.pointerType !== 'mouse') return;
    cursor.style.transform = `translate3d(${event.clientX}px,${event.clientY}px,0)`;
    cursor.classList.add('visible');
    event.currentTarget.classList.add('cursor-glow-active');
  }

  function leave() {
    cursor.classList.remove('visible');
    sections.forEach(section => section.classList.remove('cursor-glow-active'));
  }

  sections.forEach(section => {
    section.addEventListener('pointermove', move, { passive: true });
    section.addEventListener('pointerleave', leave);
    section.addEventListener('pointercancel', leave);
  });
  window.addEventListener('blur', leave);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) leave();
  });
})();

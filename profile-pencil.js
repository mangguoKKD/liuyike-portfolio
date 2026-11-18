/* Pink-page pencil pointer with a short, fading hand-drawn trail. */
(() => {
  const chapter = document.querySelector('.profile-chapter');
  const experience = document.querySelector('#experience');
  const regions = [chapter, experience].filter(Boolean);
  if (!regions.length || !matchMedia('(hover:hover) and (pointer:fine)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'profile-pencil-trail';
  canvas.setAttribute('aria-hidden', 'true');
  const pencil = document.createElement('div');
  pencil.className = 'profile-pencil-cursor';
  pencil.setAttribute('aria-hidden', 'true');
  pencil.innerHTML = '<svg viewBox="0 0 32 32" width="30" height="30" xmlns="http://www.w3.org/2000/svg"><path d="M4 27.8 7 20 21.4 5.6a2.2 2.2 0 0 1 3.1 0l2 2a2.2 2.2 0 0 1 0 3.1L12.1 25.1 4 27.8Z" fill="#ed8ab4" stroke="#fff3f8" stroke-width="1.25" stroke-linejoin="round"/><path d="m7 20 4.9 4.9M21.4 5.6l5.1 5.1" fill="none" stroke="#a93f70" stroke-width="1.2"/><path d="m4 27.8 2.2-6 3.9 3.9-6.1 2.1Z" fill="#fff3f8"/><path d="m4 27.8 2.8-.9-1.9-1.9-.9 2.8Z" fill="#6f344d"/></svg>';
  document.body.append(canvas, pencil);
  const ctx = canvas.getContext('2d');
  const points = [];
  const lifetime = 720;
  let dpr = 1;
  let frame = 0;
  let activeRegion = null;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(innerWidth * dpr);
    canvas.height = Math.round(innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  addEventListener('resize', resize, { passive: true });

  function draw(now) {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    while (points.length && now - points[0].time > lifetime) points.shift();
    if (points.length > 1) {
      const samples = [points[0]];
      const steps = 5;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(0, i - 1)];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[Math.min(points.length - 1, i + 2)];
        for (let step = 1; step <= steps; step++) {
          const t = step / steps;
          const t2 = t * t;
          const t3 = t2 * t;
          const blend = (a, b, c, d) => .5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
          samples.push({
            x: blend(p0.x, p1.x, p2.x, p3.x),
            y: blend(p0.y, p1.y, p2.y, p3.y),
            time: p1.time + (p2.time - p1.time) * t
          });
        }
      }

      const edges = samples.map((point, i) => {
        const before = samples[Math.max(0, i - 1)];
        const after = samples[Math.min(samples.length - 1, i + 1)];
        const dx = after.x - before.x;
        const dy = after.y - before.y;
        const length = Math.hypot(dx, dy) || 1;
        const progress = i / (samples.length - 1);
        const halfWidth = .12 + 1.7 * Math.pow(progress, .78);
        const nx = -dy / length * halfWidth;
        const ny = dx / length * halfWidth;
        return {
          left: { x: point.x + nx, y: point.y + ny },
          right: { x: point.x - nx, y: point.y - ny },
          fade: Math.max(0, 1 - (now - point.time) / lifetime)
        };
      });

      // Fill adjoining tapered sections so turns have no overlapping round-cap dots.
      for (let i = 0; i < edges.length - 1; i++) {
        const a = edges[i];
        const b = edges[i + 1];
        const alpha = ((a.fade + b.fade) / 2) * .8;
        if (alpha <= .01) continue;
        ctx.beginPath();
        ctx.moveTo(a.left.x, a.left.y);
        ctx.lineTo(b.left.x, b.left.y);
        ctx.lineTo(b.right.x, b.right.y);
        ctx.lineTo(a.right.x, a.right.y);
        ctx.closePath();
        ctx.fillStyle = `rgba(218, 77, 140, ${alpha})`;
        ctx.fill();
      }
    }
    if (points.length) frame = requestAnimationFrame(draw);
    else frame = 0;
  }
  function move(event, region) {
    if (event.pointerType !== 'mouse') return;
    const now = performance.now();
    pencil.style.transform = `translate3d(${event.clientX - 4}px,${event.clientY - 27}px,0)`;
    pencil.classList.add('visible');
    region.classList.add('profile-pencil-active');
    activeRegion = region;
    points.push({ x: event.clientX, y: event.clientY, time: now });
    if (!frame) frame = requestAnimationFrame(draw);
  }

  function leave() {
    pencil.classList.remove('visible');
    regions.forEach(region => region.classList.remove('profile-pencil-active'));
    activeRegion = null;
    points.length = 0;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  }

  regions.forEach(region => {
    region.addEventListener('pointermove', event => move(event, region), { passive: true });
    region.addEventListener('pointerleave', leave);
    region.addEventListener('pointercancel', leave);
  });
  addEventListener('blur', leave);
  if (experience && 'MutationObserver' in window) {
    new MutationObserver(() => {
      if (activeRegion === experience && experience.style.pointerEvents === 'none') leave();
    }).observe(experience, { attributes: true, attributeFilter: ['style'] });
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) leave(); });
})();
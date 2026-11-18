(() => {
  const section = document.getElementById('works-canvas-intro');
  const scene = document.getElementById('works-canvas-scene');
  if (!section || !scene) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const compact = window.matchMedia('(max-width: 760px)').matches;
  const sources = [
    ['assets/research/competition-cover.png', 'MARKET RESEARCH', 'portrait'],
    ['assets/research/iref-cover.png', 'IREF · 2024', 'portrait'],
    ['assets/research/frl-cover.png', 'FRL · 2025', 'portrait'],
    ['assets/research/climate-risk-domestic-spillover.png', 'CLIMATE RISK', 'wide'],
    ['assets/research/competition-research-framework.png', 'RESEARCH DESIGN', 'portrait'],
    ['assets/research/competition-personas.png', 'PERSONAS', 'wide'],
    ['assets/research/competition-sem-accepted.png', 'SEM MODEL', 'wide'],
    ['assets/research/carbon-sector-network.png', 'NETWORK ANALYSIS', 'wide'],
    ['assets/research/sfc-ecosystem-module.png', 'CHINA-SFC', 'square'],
    ['assets/studies/topic-4-ai-projects-v2.png', 'AI EXPLORATIONS', 'square']
  ];
  function randomFactory(seed) {
    let value = seed >>> 0;
    return () => {
      value += 0x6d2b79f5;
      let result = value;
      result = Math.imul(result ^ result >>> 15, result | 1);
      result ^= result + Math.imul(result ^ result >>> 7, result | 61);
      return ((result ^ result >>> 14) >>> 0) / 4294967296;
    };
  }
  const random = randomFactory(20241116);
  const count = compact ? 26 : 48;
  const columns = compact ? 5 : 8;
  const rows = Math.ceil(count / columns);
  const nodes = [];
  for (let index = 0; index < count; index += 1) {
    const source = sources[index % sources.length];
    const column = index % columns;
    const row = Math.floor(index / columns);
    const x = ((column + .5) / columns - .5) * (compact ? 128 : 145) + (random() - .5) * 14;
    const y = ((row + .5) / rows - .5) * (compact ? 118 : 112) + (random() - .5) * 13;
    const card = document.createElement('figure');
    card.className = `works-canvas-card is-${source[2]}`;
    card.dataset.label = source[1];
    card.dataset.x = x.toFixed(2);
    card.dataset.y = y.toFixed(2);
    card.dataset.z = (random() * 1.45).toFixed(3);
    card.dataset.rotation = ((random() - .5) * 13).toFixed(2);
    card.dataset.phase = (random() * Math.PI * 2).toFixed(3);
    const image = document.createElement('img');
    image.src = source[0];
    image.alt = '';
    image.loading = 'eager';
    image.decoding = 'async';
    card.append(image);
    scene.append(card);
    nodes.push(card);
  }
  const copy = section.querySelector('.works-canvas-copy');
  const scrollHint = section.querySelector('.works-canvas-scroll');
  const portal = section.querySelector('.works-canvas-arrival');
  const sticky = section.querySelector('.works-canvas-sticky');
  const experiencePanel = document.getElementById('experience');
  const aiPanel = document.getElementById('ai');
  const aiSpace = document.createElement('div');
  aiSpace.setAttribute('aria-hidden', 'true');
  aiSpace.style.display = 'none';
  aiPanel?.before(aiSpace);
  let aiPinned = false;

  const pinExperienceTransition = window.matchMedia('(min-width: 801px) and (min-height: 760px)').matches;
  const pixelCanvas = document.createElement('canvas');
  pixelCanvas.className = 'works-pixel-handoff';
  pixelCanvas.setAttribute('aria-hidden', 'true');
  Object.assign(pixelCanvas.style, { position: 'fixed', inset: '0', zIndex: '5', width: '100vw', height: '100svh', pointerEvents: 'none', opacity: '0' });
  document.querySelector('.portfolio-chapters')?.append(pixelCanvas);
  const pixelContext = pixelCanvas.getContext('2d');
  let pixelDpr = 1;
  let pixelCols = 0;
  let pixelRows = 0;
  let pixelCellW = 0;
  let pixelCellH = 0;
  let pixelThresholds = new Float32Array(0);
  let brushCanvas = null;
  let brushContext = null;
  let brushDpr = 1;
  let lastBrushPaint = -1;
  let brushNeedsPaint = true;
  if (experiencePanel && pinExperienceTransition) {
    brushCanvas = document.createElement('canvas');
    brushCanvas.className = 'works-dry-brush-overlay';
    brushCanvas.setAttribute('aria-hidden', 'true');
    experiencePanel.append(brushCanvas);
    brushContext = brushCanvas.getContext('2d');
  }
  const actualBooks = document.querySelector('#research > .research-two-books');
  if (portal && actualBooks) {
    portal.append(actualBooks);
    actualBooks.classList.add('works-portal-real-books');
  }
  document.documentElement.classList.add('works-motion-ready');
  let target = 0;
  let current = 0;
  let journeyDistance = 1;
  let pointerX = 0;
  let pointerY = 0;
  let raf = 0;
  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const smoothStep = value => { const x = clamp(value); return x * x * (3 - 2 * x); };
  function resizePixelGrid() {
    if (!pixelContext) return;
    const width = Math.max(1, window.innerWidth);
    const height = Math.max(1, window.innerHeight);
    pixelDpr = Math.min(window.devicePixelRatio || 1, 1.25);
    pixelCanvas.width = Math.round(width * pixelDpr);
    pixelCanvas.height = Math.round(height * pixelDpr);
    const cell = Math.max(24, Math.min(38, Math.round(width / 58)));
    pixelCols = Math.ceil(width / cell);
    pixelRows = Math.ceil(height / cell);
    pixelCellW = width / pixelCols;
    pixelCellH = height / pixelRows;
    pixelThresholds = new Float32Array(pixelCols * pixelRows);
    let seed = 734921;
    for (let i = 0; i < pixelThresholds.length; i += 1) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const col = i % pixelCols;
      const row = Math.floor(i / pixelCols);
      const diagonal = (col / Math.max(1, pixelCols - 1)) * .62 + (row / Math.max(1, pixelRows - 1)) * .38;
      const noise = seed / 4294967296;
      pixelThresholds[i] = clamp(diagonal * .76 + noise * .24);
    }
  }
  let lastPixelMask = null;
  function drawPixelHandoff(progress) {
    pixelCanvas.style.opacity = '0';
    if (!aiPanel) return;
    if (progress <= 0 || progress >= .9999) {
      aiPanel.style.removeProperty('mask-image');
      aiPanel.style.removeProperty('-webkit-mask-image');
      lastPixelMask = null;
      return;
    }
    // Reveal the actual incoming page directly through pixel windows.
    // No painted imitation of the books and no intermediate cover screen.
    const cells = [];
    for (let row = 0; row < pixelRows; row += 1) {
      for (let col = 0; col < pixelCols; col += 1) {
        if (pixelThresholds[row * pixelCols + col] > progress) continue;
        cells.push(`<rect x="${col * pixelCellW}" y="${row * pixelCellH}" width="${pixelCellW + 1}" height="${pixelCellH + 1}"/>`);
      }
    }
    const markup = cells.join('');
    if (markup === lastPixelMask) return;
    lastPixelMask = markup;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${window.innerWidth}" height="${window.innerHeight}"><g fill="white">${markup}</g></svg>`;
    const mask = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
    aiPanel.style.setProperty('mask-image', mask);
    aiPanel.style.setProperty('-webkit-mask-image', mask);
    aiPanel.style.setProperty('mask-repeat', 'no-repeat');
    aiPanel.style.setProperty('-webkit-mask-repeat', 'no-repeat');
  }
  function resizeBrushCanvas() {
    if (!brushCanvas || !brushContext) return;
    brushDpr = Math.min(window.devicePixelRatio || 1, 1.25);
    const width = Math.max(1, Math.round(window.innerWidth * brushDpr));
    const height = Math.max(1, Math.round(window.innerHeight * brushDpr));
    if (brushCanvas.width !== width || brushCanvas.height !== height) {
      brushCanvas.width = width;
      brushCanvas.height = height;
      brushNeedsPaint = true;
    }
  }
  function drawBrushStroke(progress, reverse, band, width, height, phase) {
    if (!brushContext || progress <= 0) return;
    const ctx = brushContext;
    const reveal = clamp(progress);
    const startX = reverse ? width * 1.08 : -width * .08;
    const endX = reverse ? width * (1.08 - reveal * 1.16) : width * (-.08 + reveal * 1.16);
    const centerY = band * height;
    const half = height * .285;
    const samples = Math.max(12, Math.ceil(54 * reveal));
    const centerAt = t => centerY + Math.sin(t * Math.PI) * height * (phase ? -.045 : .04) + Math.sin(t * 8 + phase) * height * .012;
    const edgeAt = (t, side) => half * (1 + Math.sin(t * 23 + phase + side) * .075 + Math.sin(t * 61 + phase * 2 + side) * .028);
    const pointX = t => startX + (endX - startX) * t;
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i <= samples; i += 1) {
      const t = i / samples;
      const x = pointX(t);
      const y = centerAt(t) - edgeAt(t, 0);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    for (let i = samples; i >= 0; i -= 1) {
      const t = i / samples;
      ctx.lineTo(pointX(t), centerAt(t) + edgeAt(t, 1.7));
    }
    ctx.closePath();
    ctx.clip();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fill();
    ctx.restore();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }
  function paintBrushTransition(progress) {
    if (!brushCanvas || !brushContext) return;
    resizeBrushCanvas();
    const ctx = brushContext;
    const width = brushCanvas.width / brushDpr;
    const height = brushCanvas.height / brushDpr;
    ctx.setTransform(brushDpr, 0, 0, brushDpr, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#f6dce7';
    ctx.fillRect(0, 0, width, height);
    const first = smoothStep(progress / .68);
    const second = smoothStep((progress - .28) / .72);
    drawBrushStroke(first, false, .31, width, height, .7);
    drawBrushStroke(second, true, .69, width, height, 2.3);
    brushNeedsPaint = false;
  }
  function measure() {
    const rect = section.getBoundingClientRect();
    const fullDistance = Math.max(1, rect.height - window.innerHeight);
    // Give the opened books a deliberate reading beat before the pixel handoff.
    const pauseDistance = pinExperienceTransition ? window.innerHeight * .58 : 0;
    journeyDistance = Math.max(1, fullDistance - pauseDistance);
    const scrollOffset = clamp(-rect.top, 0, fullDistance);
    if (pauseDistance > 0) {
      const pauseStart = journeyDistance * .82;
      if (scrollOffset <= pauseStart) target = clamp(scrollOffset / journeyDistance);
      else if (scrollOffset <= pauseStart + pauseDistance) target = .82;
      else target = clamp((scrollOffset - pauseDistance) / journeyDistance);
    } else {
      target = clamp(scrollOffset / fullDistance);
    }
  }
  function render() {
    current += (target - current) * (reducedMotion && !pinExperienceTransition ? 1 : .09);
    const experienceFade = smoothStep(current / (pinExperienceTransition ? .055 : .16));
    const collageReveal = smoothStep((current - (pinExperienceTransition ? 0 : .02)) / (pinExperienceTransition ? .1 : .18));
    if (experiencePanel && pinExperienceTransition) {
      experiencePanel.style.setProperty('--experience-content-opacity', (1 - experienceFade).toFixed(3));
      const brushProgress = clamp(current / .17);
      const brushDone = current >= .24;
      experiencePanel.style.setProperty('--experience-bg-alpha', current >= .005 ? '0' : '1');
      if (brushCanvas) {
        if (brushNeedsPaint || Math.abs(brushProgress - lastBrushPaint) > .001) {
          paintBrushTransition(brushProgress);
          lastBrushPaint = brushProgress;
        }
        brushCanvas.style.opacity = String(1 - smoothStep((current - .2) / .08));
      }
      const showCanvas = current >= .005;
      const handoffToAi = current >= .82;
      experiencePanel.style.zIndex = handoffToAi ? '0' : brushDone ? '4' : '6';
      experiencePanel.style.pointerEvents = showCanvas ? 'none' : '';
      sticky.style.zIndex = brushDone ? '7' : '2';
    }
    const handoffProgress = clamp((current - .82) / .18);
    const handoff = smoothStep(handoffProgress);
    if (aiPanel) {
      const naturalTop = (aiPinned ? aiSpace : aiPanel).getBoundingClientRect().top;
      const shouldPin = handoff > 0 && naturalTop > 0;
      if (shouldPin && !aiPinned) {
        const box = aiPanel.getBoundingClientRect();
        const css = getComputedStyle(aiPanel);
        aiSpace.style.cssText = `display:block;height:${box.height}px;margin-top:${css.marginTop};margin-bottom:${css.marginBottom};flex-shrink:0;`;
        aiPanel.style.setProperty('position', 'fixed', 'important');
        aiPanel.style.setProperty('top', '0', 'important');
        aiPanel.style.setProperty('left', '0', 'important');
        aiPanel.style.setProperty('width', '100%', 'important');
        aiPanel.style.setProperty('margin', '0', 'important');
        aiPanel.style.setProperty('box-sizing', 'border-box', 'important');
        aiPinned = true;
      } else if (!shouldPin && aiPinned) {
        for (const property of ['position', 'top', 'left', 'width', 'margin', 'box-sizing']) aiPanel.style.removeProperty(property);
        aiSpace.style.display = 'none';
        aiPinned = false;
      }
      aiPanel.style.setProperty('transition', 'none', 'important');
      aiPanel.style.setProperty('animation', 'none', 'important');
      aiPanel.style.setProperty('transform', 'none', 'important');
      aiPanel.style.opacity = handoff > 0 ? '1' : '0';
      aiPanel.style.zIndex = handoff > 0 ? '4' : '1';
    }
    drawPixelHandoff(handoff);
    if (handoff > 0) {
      sticky.style.zIndex = '2';
      sticky.style.clipPath = 'none';
      sticky.style.opacity = handoff < .9999 ? '1' : '0';
    } else {
      sticky.style.opacity = '1';
    }
    const journey = clamp((current - (pinExperienceTransition ? .12 : 0)) / (pinExperienceTransition ? .52 : .72));
    const portalProgress = smoothStep((current - .64) / .18);
    const sceneFade = 1 - smoothStep((current - .60) / .16);
    const travelDistance = journey * 2.7;
    const darken = smoothStep((current - (pinExperienceTransition ? .32 : .12)) / (pinExperienceTransition ? .5 : .62));
    sticky.style.setProperty('--tunnel-darken', darken.toFixed(3));
    nodes.forEach((card, index) => {
      const baseX = Number(card.dataset.x);
      const baseY = Number(card.dataset.y);
      const baseZ = Number(card.dataset.z);
      const rotation = Number(card.dataset.rotation);
      const phase = Number(card.dataset.phase);
      let z = (baseZ - travelDistance) % 1.45;
      if (z < 0) z += 1.45;
      const closeness = 1 - z / 1.45;
      const depthScale = .24 + Math.pow(closeness, 2.2) * 1.55;
      const perspective = .5 + closeness * .92;
      const x = baseX * perspective + pointerX * (1.5 + closeness * 5) + Math.sin(current * 7 + phase) * (1 - closeness) * 2.5;
      const y = baseY * perspective + pointerY * (1.2 + closeness * 4) + Math.cos(current * 6 + phase) * 1.4;
      const edgeFade = clamp(1 - Math.max(Math.abs(x) / 86, Math.abs(y) / 68));
      const opacity = clamp((.2 + closeness * 1.2) * edgeFade * sceneFade * collageReveal);
      card.style.transform = `translate(-50%,-50%) translate(${x}vw,${y}vh) scale(${depthScale}) rotate(${rotation + journey * (index % 2 ? -3 : 3)}deg)`;
      card.style.opacity = String(opacity);
      card.style.zIndex = String(10 + Math.round(closeness * 100));
    });
    const introFade = pinExperienceTransition
      ? smoothStep((current - .38) / .1) * (1 - smoothStep((current - .56) / .1))
      : 1 - smoothStep(current / .2);
    copy.style.opacity = String(introFade);
    copy.style.transform = `translateY(calc(-50% - ${current * 70}px)) scale(${1 + current * .06})`;
    scrollHint.style.opacity = pinExperienceTransition
      ? String(smoothStep((current - .4) / .1) * (1 - smoothStep((current - .56) / .1)))
      : String(1 - smoothStep(current / .16));
    portal.style.clipPath = `circle(${portalProgress * 110}% at 50% 50%)`;
    portal.style.pointerEvents = portalProgress > .82 ? 'auto' : 'none';
    if (actualBooks) {
      const booksProgress = smoothStep((portalProgress - .12) / .72);
      actualBooks.style.opacity = String(booksProgress);
      actualBooks.style.transform = `translateY(${54 * (1 - booksProgress) - handoff * 16}px) scale(${(.86 + booksProgress * .14) * (1 - handoff * .025)})`;
    }
    raf = requestAnimationFrame(render);
  }
  function onPointer(event) {
    pointerX = (event.clientX / window.innerWidth - .5) * 2;
    pointerY = (event.clientY / window.innerHeight - .5) * 2;
  }
  resizePixelGrid();
  measure();
  window.addEventListener('portfolio:instant-ai-jump', () => {
    measure();
    current = target;
  });
  window.addEventListener('portfolio:instant-research-jump', () => {
    measure();
    current = target;
  });
  window.addEventListener('scroll', measure, { passive: true });
  window.addEventListener('resize', () => { resizePixelGrid(); measure(); resizeBrushCanvas(); }, { passive: true });
  if (!compact && !reducedMotion) window.addEventListener('pointermove', onPointer, { passive: true });
  raf = requestAnimationFrame(render);
  window.addEventListener('pagehide', () => cancelAnimationFrame(raf), { once: true });
})();

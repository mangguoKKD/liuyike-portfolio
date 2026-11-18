/* Reveal the second-screen closing copy one smoky character at a time. */
(() => {
  const note = document.querySelector('.study-note');
  if (!note || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const walker = document.createTreeWalker(note, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);

  let index = 0;
  for (const node of textNodes) {
    const fragment = document.createDocumentFragment();
    for (const character of node.nodeValue) {
      const glyph = document.createElement('span');
      glyph.className = 'smoky-char';
      glyph.textContent = character;
      glyph.style.setProperty('--smoke-index', index);
      glyph.style.setProperty('--smoke-x', `${((index * 7) % 5 - 2) * 7}px`);
      glyph.style.setProperty('--smoke-y', `${((index * 11) % 7 - 3) * 6}px`);
      glyph.style.setProperty('--smoke-rotation', `${((index * 13) % 7 - 3) * 2}deg`);
      fragment.append(glyph);
      index++;
    }
    node.replaceWith(fragment);
  }

  let started = false;
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting || started) return;
    started = true;
    note.classList.add('smoky-ready');
    observer.disconnect();
  }, { threshold: 0.35 });
  observer.observe(note);
})();

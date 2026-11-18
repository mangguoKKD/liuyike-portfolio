(() => {
  const targets = ['profile', 'experience', 'research', 'ai'];
  const navButtons = document.querySelectorAll('.studies [data-topic]');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

  function clearInstantClass() {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      document.documentElement.classList.remove('portfolio-instant-jump');
    }));
  }

  function instantElementJump(target, hash, transitionEvent) {
    if (!target) return;
    document.documentElement.classList.add('portfolio-instant-jump');
    history.replaceState(null, '', `#${hash}`);
    target.scrollIntoView({ behavior: 'instant', block: 'start' });
    window.dispatchEvent(new Event(transitionEvent));
    clearInstantClass();
  }

  function instantBooksJump() {
    const intro = document.getElementById('works-canvas-intro');
    if (!intro) return;
    const fullDistance = Math.max(1, intro.getBoundingClientRect().height - window.innerHeight);
    const hasReadingHold = matchMedia('(min-width: 801px) and (min-height: 760px)').matches;
    const pauseDistance = hasReadingHold ? window.innerHeight * .58 : 0;
    const journeyDistance = Math.max(1, fullDistance - pauseDistance);
    const booksProgress = .82;
    const offset = pauseDistance
      ? journeyDistance * booksProgress + pauseDistance * .5
      : fullDistance * booksProgress;
    const destination = window.scrollY + intro.getBoundingClientRect().top + offset;

    document.documentElement.classList.add('portfolio-instant-jump');
    history.replaceState(null, '', '#research');
    window.scrollTo({ left: 0, top: destination, behavior: 'instant' });
    window.dispatchEvent(new Event('portfolio:instant-research-jump'));
    clearInstantClass();
  }

  navButtons.forEach(button => {
    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      button.blur();
      const topic = Number(button.dataset.topic);
      if (topic === 2) {
        instantBooksJump();
        return;
      }
      if (topic === 3) {
        instantElementJump(document.getElementById('ai'), 'ai', 'portfolio:instant-ai-jump');
        return;
      }

      const target = document.getElementById(targets[topic]);
      if (!target) return;
      history.replaceState(null, '', `#${target.id}`);
      target.scrollIntoView({ behavior: reduceMotion.matches ? 'instant' : 'smooth', block: 'start' });
    }, true);
  });
})();

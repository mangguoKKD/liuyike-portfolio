(() => {
  const sections = [document.getElementById('ai'), document.getElementById('sancan')].filter(Boolean);
  if (!sections.length || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const targets = sections.flatMap(section => {
    const elements = section.id === 'ai'
      ? [...section.querySelectorAll('.ai-showcase-head > *, .ai-page-heading > *, .project-heading, .ai-story-lead, .ai-story-points > li, .ai-product-status')]
      : [...section.querySelectorAll('.sancan-copy > .project-heading, .sancan-story > section, .sancan-gallery-intro, .sancan-gallery figure')];
    section.classList.add('ai-motion-ready');
    return elements.map((element, index) => {
      element.classList.add('ai-scroll-reveal');
      element.style.transitionDelay = `${(index % 7) * 150}ms`;
      return element;
    });
  });

  const observer = new IntersectionObserver((entries, activeObserver) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      activeObserver.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: .08 });
  targets.forEach(element => observer.observe(element));
})();

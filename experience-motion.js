(() => {
  const section = document.getElementById('experience');
  if (!section || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const revealGroups = [
    [...section.querySelectorAll('.portfolio-panel-head > span')],
    [...section.querySelector('.portfolio-panel-intro').children],
    [...section.querySelectorAll('.experience-timeline > li')]
  ];
  const targets = revealGroups.flatMap(group => group.map((element, index) => {
    element.classList.add('experience-scroll-reveal');
    element.style.transitionDelay = `${index * 75}ms`;
    return element;
  }));
  section.classList.add('experience-motion-ready');

  const observer = new IntersectionObserver((entries, activeObserver) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      activeObserver.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: .08 });

  targets.forEach(element => observer.observe(element));
})();

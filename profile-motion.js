(()=>{
  const chapter=document.querySelector('.profile-chapter');
  const section=chapter?.querySelector('.profile-section');
  if(!chapter||!section)return;
  const stage=chapter.querySelector('.profile-stage');
  const right=chapter.querySelector('.profile-right');
  const desktop=matchMedia('(min-width:1051px)');
  const alignColumns=()=>{
    if(!stage||!right)return;
    stage.style.setProperty('--profile-column-height',desktop.matches?`${Math.ceil(right.getBoundingClientRect().height)}px`:'auto');
  };
  if(right){
    if('ResizeObserver' in window)new ResizeObserver(alignColumns).observe(right);
    addEventListener('resize',alignColumns,{passive:true});
    document.fonts?.ready.then(alignColumns);
    alignColumns();
  }
  if(!('IntersectionObserver' in window))return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  if(reduced.matches)return;
  const rows=[
    ...chapter.querySelectorAll('.profile-basic-list>div'),
    ...chapter.querySelectorAll('.profile-awards>li'),
    ...chapter.querySelectorAll('.profile-skills-list>div')
  ];
  rows.forEach((row,index)=>{
    row.classList.add('profile-row-reveal');
    row.style.transitionDelay=`${(index%6)*65}ms`;
  });
  chapter.classList.add('profile-motion-ready');

  const paperObserver=new IntersectionObserver((entries,observer)=>{
    if(entries.some(entry=>entry.isIntersecting)){
      section.classList.add('is-entered');
      observer.disconnect();
    }
  },{threshold:.12});
  paperObserver.observe(section);

  const rowObserver=new IntersectionObserver((entries,observer)=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      const row=entry.target;
      row.classList.add('is-visible');
      observer.unobserve(row);
    });
  },{rootMargin:'0px 0px -6% 0px',threshold:.08});
  rows.forEach(row=>rowObserver.observe(row));
})();

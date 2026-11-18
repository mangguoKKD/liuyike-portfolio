(()=>{
  const reveal=document.querySelector('.profile-reveal');
  const sheet=reveal?.querySelector('.profile-reveal-sheet');
  if(!reveal||!sheet)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let frame=0;
  const blend=(from,to,t)=>Math.round(from+(to-from)*t);
  const clamp=(value)=>Math.max(0,Math.min(1,value));
  function update(){
    frame=0;
    if(reduced.matches)return;
    const rect=reveal.getBoundingClientRect();
    const progress=clamp((innerHeight-rect.top)/Math.max(1,rect.height));
    const inText=clamp((progress-.13)/.22);
    const wash=clamp((progress-.42)/.58);
    sheet.style.setProperty('--reveal-y',((1-progress)*18).toFixed(2)+'%');
    sheet.style.setProperty('--copy-opacity',inText.toFixed(3));
    sheet.style.setProperty('--copy-y',((1-inText)*60).toFixed(1)+'px');
    sheet.style.setProperty('--reveal-wash',wash.toFixed(3));
    sheet.style.setProperty('--copy-color',`rgb(${blend(239,185,wash)} ${blend(143,47,wash)} ${blend(182,105,wash)})`);
    sheet.style.setProperty('--copy-color-second',`rgb(${blend(255,164,wash)} ${blend(244,36,wash)} ${blend(248,91,wash)})`);
    sheet.style.willChange=progress>0&&progress<1?'transform':'auto';
  }
  function requestUpdate(){if(!frame)frame=requestAnimationFrame(update)}
  addEventListener('scroll',requestUpdate,{passive:true});
  addEventListener('resize',requestUpdate,{passive:true});
  addEventListener('pageshow',requestUpdate);
  reduced.addEventListener('change',requestUpdate);
  update();
})();

/* =====================================================================
   PARTY BUS R US — "AFTERGLOW" enhancements (Version 2, full site)
   Additive, runs alongside each page's existing script. Adds: scroll
   progress bar, version flag, neon aurora behind heroes, magnetic
   buttons, nav solidify — and neutralizes the original GSAP grid reveal
   so content is never left stuck/flickering (proven fix).
   ===================================================================== */
(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isDesktop = !window.matchMedia('(max-width:900px)').matches;

  /* progress bar */
  var bar=document.createElement('div'); bar.className='ag-prog'; document.body.appendChild(bar);
  function prog(){var h=document.documentElement;var m=h.scrollHeight-h.clientHeight;bar.style.width=(m>0?h.scrollTop/m*100:0)+'%';}
  document.addEventListener('scroll',prog,{passive:true}); prog();

  /* version flag */
  var flag=document.createElement('div'); flag.className='ag-flag'; flag.innerHTML='V2 · <b>Afterglow</b> · preview'; document.body.appendChild(flag);

  /* nav solidify */
  var nav=document.querySelector('nav.main');
  if(nav){var s=function(){nav.classList.toggle('scrolled',window.scrollY>40);};document.addEventListener('scroll',s,{passive:true});s();}

  /* aurora glow behind heroes */
  if(!reduce){
    ['.page-hero','.final-cta'].forEach(function(sel){
      document.querySelectorAll(sel).forEach(function(el){
        if(el.querySelector('.nl-aurora')) return;
        if(getComputedStyle(el).position==='static') el.style.position='relative';
        var a=document.createElement('div'); a.className='nl-aurora'; a.innerHTML='<span class="b1"></span><span class="b2"></span>';
        el.insertBefore(a,el.firstChild);
      });
    });
  }

  /* magnetic buttons */
  if(isDesktop && !reduce){
    document.querySelectorAll('.btn.gold, .btn.wine, .btn.lg').forEach(function(b){
      b.addEventListener('mousemove',function(e){var r=b.getBoundingClientRect();b.style.transform='translate('+(e.clientX-r.left-r.width/2)*.22+'px,'+(e.clientY-r.top-r.height/2)*.32+'px)';});
      b.addEventListener('mouseleave',function(){b.style.transform='';});
    });
  }

  /* ---- RELIABILITY: force the original GSAP reveal items visible and keep
     them visible through resize/refresh (the original re-hides on refresh). ---- */
  var revealSel='.fleet-grid>*,.services-grid>*,.testimonial-grid>*,.area-grid>*,.led-grid>*,'
      +'.stats-big-grid>*,.blog-grid>*,.gw-grid>*,.why-feature>*,.bus-grid>*,.tier-grid>*,'
      +'.feature-grid>*,.section-head>*';
  function reveal(){
    var els=document.querySelectorAll(revealSel);
    for(var i=0;i<els.length;i++){els[i].style.setProperty('opacity','1','important');els[i].style.removeProperty('transform');els[i].style.removeProperty('translate');}
  }
  reveal();
  document.addEventListener('DOMContentLoaded',reveal);
  window.addEventListener('load',function(){reveal();[300,900,1800,3000].forEach(function(t){setTimeout(reveal,t);});});
  window.addEventListener('resize',function(){requestAnimationFrame(reveal);setTimeout(reveal,120);});
  if(window.ScrollTrigger&&window.ScrollTrigger.addEventListener){window.ScrollTrigger.addEventListener('refresh',function(){requestAnimationFrame(reveal);});}
})();

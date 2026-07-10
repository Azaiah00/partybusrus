/* =====================================================================
   PARTY BUS R US — "NEON LUXE" enhancements (Version 2)
   Additive only. Runs alongside each page's existing GSAP reveal script
   (it does not replace it). Adds: scroll-progress bar, version flag,
   neon aurora glow behind heroes, magnetic buttons, nav-solidify.
   All effects are guarded for reduced-motion and missing elements.
   ===================================================================== */
(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isDesktop = !window.matchMedia('(max-width:900px)').matches;

  /* ---- scroll progress bar ---- */
  var bar = document.createElement('div');
  bar.className = 'nl-progress';
  document.body.appendChild(bar);
  function prog(){
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
  }
  document.addEventListener('scroll', prog, {passive:true}); prog();

  /* ---- version flag ---- */
  var flag = document.createElement('div');
  flag.className = 'nl-flag';
  flag.innerHTML = 'Version 2 · <b>Neon Luxe</b> · preview';
  document.body.appendChild(flag);

  /* ---- nav solidify on scroll (all viewports) ---- */
  var nav = document.querySelector('nav.main');
  if (nav){
    var solid = function(){ if (window.scrollY > 40) nav.classList.add('scrolled'); else nav.classList.remove('scrolled'); };
    document.addEventListener('scroll', solid, {passive:true}); solid();
  }

  /* ---- inject neon aurora glow behind heroes ---- */
  if (!reduce){
    ['.hero', '.page-hero', '.final-cta'].forEach(function(sel){
      document.querySelectorAll(sel).forEach(function(el){
        if (el.querySelector('.nl-aurora')) return;
        var cs = window.getComputedStyle(el);
        if (cs.position === 'static') el.style.position = 'relative';
        var a = document.createElement('div');
        a.className = 'nl-aurora';
        a.innerHTML = '<span class="b1"></span><span class="b2"></span>';
        el.insertBefore(a, el.firstChild);
      });
    });
  }

  /* ---- magnetic buttons (desktop) ---- */
  if (isDesktop && !reduce){
    document.querySelectorAll('.btn.gold, .btn.wine, .btn.lg').forEach(function(btn){
      btn.addEventListener('mousemove', function(e){
        var r = btn.getBoundingClientRect();
        var x = e.clientX - r.left - r.width/2, y = e.clientY - r.top - r.height/2;
        btn.style.transform = 'translate('+ x*0.25 +'px,'+ y*0.35 +'px)';
      });
      btn.addEventListener('mouseleave', function(){ btn.style.transform = ''; });
    });
  }
})();

/* =====================================================================
   RELIABILITY FIX (final)
   The original page animation re-hides grid + heading reveals on every
   ScrollTrigger.refresh() (fires on resize) and sometimes leaves them stuck
   at opacity:0 on load. This affected the original v1 site too. Rather than
   fight GSAP frame-by-frame, we force the reveal items permanently visible
   (opacity:1 !important) and re-assert after load, resize, and every refresh.
   Trade-off: the grid/section fade-in is disabled; all other motion (hero
   reveal, pinned LED section, counters, marquee, hovers, magnetic buttons,
   progress bar, aurora) is untouched.
   ===================================================================== */
(function(){
  var revealSel='.fleet-grid>*,.services-grid>*,.testimonial-grid>*,.area-grid>*,.led-grid>*,'
      +'.stats-big-grid>*,.blog-grid>*,.gw-grid>*,.why-feature>*,.bus-grid>*,.tier-grid>*,'
      +'.feature-grid>*,.section-head>*';
  function reveal(){
    var els=document.querySelectorAll(revealSel);
    for(var i=0;i<els.length;i++){
      els[i].style.setProperty('opacity','1','important');
      els[i].style.removeProperty('transform');
      els[i].style.removeProperty('translate');
    }
  }
  reveal();
  document.addEventListener('DOMContentLoaded',reveal);
  window.addEventListener('load',function(){reveal();[300,900,1800,3000].forEach(function(t){setTimeout(reveal,t);});});
  window.addEventListener('resize',function(){requestAnimationFrame(reveal);setTimeout(reveal,120);});
  if(window.ScrollTrigger&&window.ScrollTrigger.addEventListener){window.ScrollTrigger.addEventListener('refresh',function(){requestAnimationFrame(reveal);});}
})();

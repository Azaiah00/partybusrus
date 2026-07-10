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
   SAFETY-NET REVEAL (robust, timing-independent)
   Guarantees scroll-reveal grid/section items are never left stuck at
   opacity:0 (an inherited quirk of the original animation script on
   below-fold grids). Observes ALL candidate items and reveals any that
   are still hidden when they enter the viewport, plus an in-view sweep.
   ===================================================================== */
(function(){
  var sel='.fleet-grid>*,.services-grid>*,.testimonial-grid>*,.area-grid>*,.led-grid>*,'
        +'.stats-big-grid>*,.blog-grid>*,.gw-grid>*,.why-feature>*,.bus-grid>*,.tier-grid>*,'
        +'.feature-grid>*,.section-head>*';
  function reveal(el){el.style.transition='opacity .6s ease,transform .6s ease';el.style.opacity='1';el.style.transform='none';}
  var done=false;
  function run(){
    if(done) return; done=true;
    var items=[].slice.call(document.querySelectorAll(sel));
    if(!items.length){done=false;return;}
    if(!('IntersectionObserver' in window)){items.forEach(reveal);return;}
    var io=new IntersectionObserver(function(es){es.forEach(function(e){
      if(e.isIntersecting && parseFloat(getComputedStyle(e.target).opacity)<0.99){
        reveal(e.target); io.unobserve(e.target);
      }});},{threshold:0.01,rootMargin:'0px 0px -4% 0px'});
    items.forEach(function(el){io.observe(el);});
  }
  if(document.readyState!=='loading') run(); else document.addEventListener('DOMContentLoaded',run);
  window.addEventListener('load',run);
  // in-view backstop: reveal anything visible but still hidden shortly after load
  window.addEventListener('load',function(){setTimeout(function(){
    document.querySelectorAll(sel).forEach(function(el){
      var r=el.getBoundingClientRect();
      if(r.top<innerHeight && r.bottom>0 && parseFloat(getComputedStyle(el).opacity)<0.99) reveal(el);
    });
  },2200);});
})();

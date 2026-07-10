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

/* =====================================================================
   PARTY BUS R US — "AFTERGLOW" enhancements (Version 2, full site)
   Additive, runs alongside each page's existing script. Adds: scroll
   progress bar, neon aurora behind heroes, magnetic
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

  /* Remove design-review labels from production pages. */
  document.querySelectorAll('.flag,.mockup-flag,.ag-flag').forEach(function(el){ el.remove(); });

  /* Keep social links honest: Instagram is active; unreleased profiles are hidden. */
  document.querySelectorAll('a[href="https://www.instagram.com/"],a[href="https://instagram.com/"]').forEach(function(a){
    a.href='https://www.instagram.com/partybusrus/';
    a.target='_blank';
    a.rel='noopener noreferrer';
    if(!a.getAttribute('aria-label')) a.setAttribute('aria-label','Party Bus R Us on Instagram');
  });
  ['facebook.com/','tiktok.com/','youtube.com/'].forEach(function(host){
    document.querySelectorAll('a[href="https://www.'+host+'"],a[href="https://'+host+'"]').forEach(function(a){ a.remove(); });
  });

  /* Accessible mobile navigation, including focus management and Escape support. */
  var mobileNav=document.querySelector('.mnav');
  var menuOpen=document.querySelector('.burger');
  var menuClose=mobileNav&&mobileNav.querySelector('.x');
  if(mobileNav&&menuOpen&&menuClose){
    if(!mobileNav.id) mobileNav.id='mobile-navigation';
    menuOpen.setAttribute('aria-label','Open menu');
    menuOpen.setAttribute('aria-controls',mobileNav.id);
    menuOpen.setAttribute('aria-expanded','false');
    menuClose.setAttribute('aria-label','Close menu');
    mobileNav.setAttribute('aria-hidden','true');
    function openMenu(){
      mobileNav.classList.add('open');
      mobileNav.setAttribute('aria-hidden','false');
      menuOpen.setAttribute('aria-expanded','true');
      document.body.style.overflow='hidden';
      menuClose.focus();
    }
    function closeMenu(returnFocus){
      mobileNav.classList.remove('open');
      mobileNav.setAttribute('aria-hidden','true');
      menuOpen.setAttribute('aria-expanded','false');
      document.body.style.overflow='';
      if(returnFocus) menuOpen.focus();
    }
    menuOpen.addEventListener('click',openMenu);
    menuClose.addEventListener('click',function(){ closeMenu(true); });
    mobileNav.querySelectorAll('a').forEach(function(a){ a.addEventListener('click',function(){ closeMenu(false); }); });
    document.addEventListener('keydown',function(e){
      if(e.key==='Escape'&&mobileNav.classList.contains('open')) closeMenu(true);
      if(e.key==='Tab'&&mobileNav.classList.contains('open')){
        var focusable=mobileNav.querySelectorAll('a[href],button:not([disabled])');
        if(!focusable.length) return;
        var first=focusable[0],last=focusable[focusable.length-1];
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
        else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
      }
    });
  }

  /* The shared V2 pages use the older .mobile-nav/.menu-btn naming. Give
     that drawer the same accessible state, keyboard and focus behavior. */
  var legacyNav=document.querySelector('.mobile-nav');
  var legacyOpen=document.querySelector('.menu-btn');
  var legacyClose=legacyNav&&legacyNav.querySelector('.close');
  if(legacyNav&&legacyOpen&&legacyClose){
    if(!legacyNav.id) legacyNav.id='mobile-navigation';
    legacyOpen.setAttribute('aria-label','Open menu');
    legacyOpen.setAttribute('aria-controls',legacyNav.id);
    legacyOpen.setAttribute('aria-expanded','false');
    legacyClose.setAttribute('aria-label','Close menu');
    legacyNav.setAttribute('aria-hidden','true');
    function openLegacyMenu(){
      legacyNav.classList.add('open');
      legacyNav.setAttribute('aria-hidden','false');
      legacyOpen.setAttribute('aria-expanded','true');
      document.body.classList.add('mobile-menu-open');
      document.body.style.overflow='hidden';
      legacyClose.focus();
    }
    function closeLegacyMenu(returnFocus){
      legacyNav.classList.remove('open');
      legacyNav.setAttribute('aria-hidden','true');
      legacyOpen.setAttribute('aria-expanded','false');
      document.body.classList.remove('mobile-menu-open');
      document.body.style.overflow='';
      if(returnFocus) legacyOpen.focus();
    }
    legacyOpen.addEventListener('click',openLegacyMenu);
    legacyClose.addEventListener('click',function(){ closeLegacyMenu(true); });
    legacyNav.querySelectorAll('a').forEach(function(a){ a.addEventListener('click',function(){ closeLegacyMenu(false); }); });
    document.addEventListener('keydown',function(e){
      if(e.key==='Escape'&&legacyNav.classList.contains('open')) closeLegacyMenu(true);
      if(e.key==='Tab'&&legacyNav.classList.contains('open')){
        var focusable=legacyNav.querySelectorAll('a[href],button:not([disabled])');
        if(!focusable.length) return;
        var first=focusable[0],last=focusable[focusable.length-1];
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
        else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
      }
    });
  }

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

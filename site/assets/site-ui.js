(function () {
  'use strict';
  var menu = document.querySelector('.mnav, .mobile-nav');
  var trigger = document.querySelector('.burger, .menu-btn');
  var close = menu && menu.querySelector('.x, .close');
  if (menu && trigger && close) {
    menu.id = 'mobile-navigation'; trigger.setAttribute('aria-label', 'Open menu');
    trigger.setAttribute('aria-controls', menu.id); trigger.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true'); close.setAttribute('aria-label', 'Close menu');
    trigger.removeAttribute('onclick'); close.removeAttribute('onclick');
    var links = menu.querySelector('.lk'); if (links) links.removeAttribute('onclick');
    function toggle(open, returnFocus) {
      menu.classList.toggle('open', open); menu.setAttribute('aria-hidden', String(!open));
      trigger.setAttribute('aria-expanded', String(open)); document.body.style.overflow = open ? 'hidden' : '';
      document.body.classList.toggle('mobile-menu-open', open);
      if (open) close.focus(); else if (returnFocus) trigger.focus();
    }
    trigger.addEventListener('click', function () { toggle(true); });
    close.addEventListener('click', function () { toggle(false, true); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { toggle(false); }); });
    document.addEventListener('keydown', function (e) {
      if (!menu.classList.contains('open')) return;
      if (e.key === 'Escape') { e.preventDefault(); toggle(false, true); }
      if (e.key === 'Tab') {
        var items = Array.from(menu.querySelectorAll('a[href],button')).filter(function (el) { return el.getBoundingClientRect().width > 0; });
        var first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    window.addEventListener('resize', function () { if (getComputedStyle(trigger).display === 'none') toggle(false); });
  }
  // A selected color is a still photograph. No autoplay or motion-dependent content.
  var slides = Array.from(document.querySelectorAll('#led .sl'));
  var label = document.getElementById('ledName');
  if (slides.length && label) label.textContent = 'Explore the interior';
  // Keep install support without interrupting a quote with a timed install overlay.
  if ('serviceWorker' in navigator && /(^|\.)partybusrus\.com$/.test(location.hostname)) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('/sw.js').catch(function () {}); });
  }
})();

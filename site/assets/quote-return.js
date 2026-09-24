(function () {
  'use strict';
  var key='pbru_quote_pending_v2', pending;
  try { pending=JSON.parse(sessionStorage.getItem(key)); } catch (_) { return; }
  var token=new URLSearchParams(location.hash.slice(1)).get('request');
  var provider=false;
  try { var host=new URL(document.referrer).hostname;provider=host==='formsubmit.co'||host==='www.formsubmit.co'; } catch (_) {}
  if (!pending || typeof pending.id!=='string' || !/^[a-zA-Z0-9-]{8,80}$/.test(pending.id) || !Number.isFinite(pending.at) || !token || pending.id!==token || Date.now()-pending.at>1800000 || pending.at>Date.now() || !provider) return;
  // A one-use provider return is a diagnostic, not evidence of delivery to the business mailbox.
  try { sessionStorage.removeItem(key);sessionStorage.removeItem('pbru_trip_draft_v2'); } catch (_) { return; }
  var heading=document.getElementById('returnHeading');
  var message=document.getElementById('returnMessage');
  if(heading) heading.textContent='Thank you for your request.';
  if(message) message.textContent='You have returned from the form verification. Our team will confirm your trip details and availability. Your bus is reserved only when your booking is confirmed.';
  if(window.PBRUAnalytics) window.PBRUAnalytics.track('quote_provider_return',{form_id:'quote'});
  if(window.history && history.replaceState) history.replaceState(null,'',location.pathname);
})();

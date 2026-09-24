(function () {
  'use strict';
  var form = document.getElementById('quoteForm');
  if (!form) return;
  var current = 1, started = false, submitting = false;
  var DRAFT = 'pbru_trip_draft_v2', PENDING = 'pbru_quote_pending_v2';
  var safeDraftFields = ['qfDate', 'qfTime', 'qfHeadcount', 'qfHours', 'qfEventType', 'qfVehicle'];
  var names = ['When & how many', 'Your trip', 'Contact details'];
  var eventMap = {weddings:'Wedding',bachelorette:'Bachelorette party',birthdays:'Birthday','sweet-16':'Sweet 16',quinceaneras:'Quinceañera',prom:'Prom / Graduation','winery-tours':'Winery / Brewery tour','brewery-crawls':'Winery / Brewery tour','concerts-sports':'Sports event / Concert',corporate:'Corporate','nye-packages':'NYE / Holiday','holiday-light-tours':'NYE / Holiday',funerals:'Funeral / Memorial','out-of-town':'Out-of-town trip','college-greek':'Other',anniversaries:'Other','airport-shuttle':'Other','dc-monument-tours':'Other','casino-trips':'Other'};
  var areas = ['adams-morgan-dc','alexandria-va','annapolis-md','arlington-va','ashburn-va','bethesda-md','bowie-md','burke-va','capitol-hill-dc','college-park-md','columbia-md','dupont-circle-dc','fairfax-va','falls-church-va','foggy-bottom-dc','frederick-md','gaithersburg-md','georgetown-dc','germantown-md','h-street-dc','herndon-va','leesburg-va','manassas-va','maryland','mclean-va','national-harbor-md','navy-yard-dc','noma-dc','northern-virginia','potomac-md','reston-va','rockville-md','silver-spring-md','springfield-va','sterling-va','the-wharf-dc','tysons-mclean-va','tysons-va','u-street-dc','vienna-va','washington-dc'];
  var params = new URLSearchParams(location.search);
  var status = document.getElementById('qfStatus'), submit = document.getElementById('qfSubmit');
  function field(id) { return document.getElementById(id); }
  function track(name, data) { if (window.PBRUAnalytics) window.PBRUAnalytics.track(name, Object.assign({form_id:'quote'}, data || {})); }
  function read(key) { try { return JSON.parse(sessionStorage.getItem(key)); } catch (_) { return null; } }
  function write(key, data) { try { sessionStorage.setItem(key, JSON.stringify(data)); return true; } catch (_) { return false; } }
  function remove(key) { try { sessionStorage.removeItem(key); } catch (_) {} }
  function dateISO(d) { return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }
  function notice(message, error) {
    status.textContent = message; status.toggleAttribute('data-error', !!error);
  }
  function save() {
    var draft = {at:Date.now(), fields:{}};
    safeDraftFields.forEach(function (id) { if (field(id)) draft.fields[id] = field(id).value; });
    write(DRAFT, draft);
  }
  function show(n, focus, direction) {
    current = n;
    form.querySelectorAll('.qf-step').forEach(function (step) {
      var active = Number(step.dataset.step) === n;
      step.classList.toggle('active', active); step.hidden = !active;
    });
    field('qfFill').style.width = (n / 3 * 100) + '%';
    field('qfStepNum').textContent = n; field('qfStepName').textContent = names[n-1];
    if (focus) {
      var heading = form.querySelector('.qf-step.active h3'); heading.setAttribute('tabindex','-1'); heading.focus();
    }
    track('quote_step_view', {step:n,direction:direction || 'initial'});
  }
  function validate(n) {
    var controls = form.querySelector('.qf-step[data-step="'+n+'"]').querySelectorAll('input,select,textarea');
    var bad = Array.from(controls).find(function (el) {
      if (el.required && /^(text|tel|email)$/.test(el.type)) el.value = el.value.trim();
      if (el.id === 'qfPhone') {
        var digits = el.value.replace(/\D/g, '');
        el.setCustomValidity(el.value && (!/^[+0-9().\s-]+$/.test(el.value) || digits.length < 7 || digits.length > 15) ? 'Enter a phone number with 7 to 15 digits.' : '');
      }
      var valid = el.checkValidity(); el.setAttribute('aria-invalid', String(!valid)); return !valid;
    });
    if (!bad) return true;
    show(n, false, n < current ? 'back' : 'forward');
    notice('Please check the highlighted field before continuing.', true);
    bad.focus(); bad.reportValidity();
    track('quote_validation_error',{step:n,field_name:bad.name,error_code:bad.validity.valueMissing?'required':'invalid'});
    return false;
  }
  function selected() {
    var select = field('qfVehicle');
    field('qfSelection').textContent = select.value ? 'Vehicle preference: ' + select.options[select.selectedIndex].text + '. Availability and fit are confirmed with your quote.' : '';
  }
  function source() {
    var data = window.PBRUAnalytics ? window.PBRUAnalytics.getAttribution() : {};
    ['source_page','source_referrer','utm_source','utm_medium','utm_campaign','utm_content','utm_term'].forEach(function (key) {
      var el = form.elements.namedItem(key); if (el) el.value = data[key] || '';
    });
  }
  // Retire the old seven-day draft that included contact details and free text.
  try { localStorage.removeItem('pbru_quote_draft'); } catch (_) {}
  field('qfDate').min = dateISO(new Date());
  var draft = read(DRAFT);
  if (draft && Number.isFinite(draft.at) && draft.at <= Date.now() && draft.at > Date.now()-86400000 && draft.fields && typeof draft.fields === 'object' && !Array.isArray(draft.fields)) {
    safeDraftFields.forEach(function (id) { var value = draft.fields[id]; if (typeof value === 'string' && field(id)) field(id).value = value.slice(0,120); });
    if (field('qfDate').value < field('qfDate').min) field('qfDate').value = '';
  } else remove(DRAFT);
  var event = params.get('event');
  if (Object.prototype.hasOwnProperty.call(eventMap,event)) field('qfEventType').value = eventMap[event];
  var bus = params.get('bus');
  if (bus && Array.from(field('qfVehicle').options).some(function (o) { return o.value === bus; })) field('qfVehicle').value = bus;
  var area = params.get('area');
  if (!field('qfPickup').value && areas.indexOf(area) !== -1) {
    var special = {mclean:'McLean',noma:'NoMa',dc:'DC',md:'MD',va:'VA'};
    field('qfPickup').value = area.split('-').map(function (word) {
      return special[word] || word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ').replace(/ (DC|MD|VA)$/, ', $1');
  }
  if (params.get('asap') === '1') field('qfDate').value = dateISO(new Date());
  selected(); source();
  form.dataset.enhanced = 'true'; form.noValidate = true;
  show(1, false, 'initial');
  form.querySelectorAll('.qf-next').forEach(function (button) {
    button.addEventListener('click', function () { if (validate(current)) { notice(''); show(Number(button.dataset.next),true,'forward'); save(); } });
  });
  form.querySelectorAll('.qf-back').forEach(function (button) {
    button.addEventListener('click', function () { notice(''); show(Number(button.dataset.back),true,'back'); });
  });
  form.querySelectorAll('[data-quick]').forEach(function (button) {
    button.addEventListener('click', function () {
      var d = new Date(), kind = button.dataset.quick;
      if (kind === 'tomorrow') d.setDate(d.getDate()+1);
      if (kind === 'saturday' || kind === 'nextsat') d.setDate(d.getDate() + (6-d.getDay()+7)%7 + (kind==='nextsat'?7:0));
      field('qfDate').value = dateISO(d); field('qfDate').removeAttribute('aria-invalid'); save();
      if (!started) { started=true; track('quote_start'); }
    });
  });
  function changed(e) {
    if (!started) { started=true; track('quote_start'); }
    e.target.removeAttribute('aria-invalid'); save(); selected();
  }
  form.addEventListener('input',changed); form.addEventListener('change',changed);
  field('qfClearDraft').addEventListener('click',function (e) {
    e.preventDefault();
    form.reset(); remove(DRAFT); remove(PENDING); selected(); notice('Your form has been cleared.'); show(1,true,'back');
    form.querySelectorAll('[aria-invalid]').forEach(function (el) { el.removeAttribute('aria-invalid'); });
    field('qfPhone').setCustomValidity('');
    submitting=false;submit.disabled=false;submit.textContent='Send Quote Request →';
  });
  form.addEventListener('submit',function (e) {
    if (submitting) { e.preventDefault(); return; }
    for (var n=1;n<=3;n++) if (!validate(n)) { e.preventDefault(); return; }
    if (form.elements.namedItem('_honey').value) { e.preventDefault(); notice('Please call or text us to request a quote.',true); return; }
    if (navigator.onLine === false) {
      e.preventDefault(); notice('You appear to be offline. Your form is still here. Reconnect before sending, or call us.',true);
      track('quote_submit_error',{error_code:'offline'}); return;
    }
    source(); save();
    var id = window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID() : Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
    field('qfReference').value = id;
    var stored = write(PENDING,{id:id,at:Date.now()});
    form.elements.namedItem('_next').value = 'https://www.partybusrus.com/thank-you' + (stored ? '#request='+encodeURIComponent(id) : '');
    submitting = true; submit.disabled = true; submit.textContent = 'Continue to verification…';
    notice('Opening the secure form verification. Complete that step to send your request. If it fails, return here or call us.');
    track('quote_submit_attempt',{vehicle_id:field('qfVehicle').value || 'undecided',passenger_band:field('qfHeadcount').value,event_type:field('qfEventType').value.toLowerCase().replace(/[^a-z0-9]+/g,'_')});
    // Native FormSubmit handoff retains CAPTCHA and autoresponse. This is NOT an accepted-lead event.
  });
  window.addEventListener('pageshow',function () { submitting=false;submit.disabled=false;submit.textContent='Send Quote Request →'; });
})();

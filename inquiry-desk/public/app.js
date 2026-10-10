import {summary,sourceClass,STATUSES} from './model.mjs';
const $ = s => document.querySelector(s);
let records=[], metadata={}, selected=null, loaded=false, saving=false, dirty=false, view='overview', installPrompt;
const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const dateLabel=v=>v?new Date(v.slice(0,10)+'T12:00:00Z').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}):'Not recorded';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=v=>v==null?'Not recorded':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(v);
function toast(text){$('#toast').textContent=text;$('#toast').hidden=false;setTimeout(()=>{$('#toast').hidden=true;},4500);}
function safeLink(value){try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)?u.href:null;}catch{return null;}}
async function api(method='GET',body){
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),20000);
 try {
  const res=await fetch('/api/desk',{method,cache:'no-store',credentials:'same-origin',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,signal:controller.signal});
  if(res.redirected || !res.headers.get('content-type')?.includes('application/json'))throw new Error('Your sign-in may have expired. Reload this page to sign in again.');
  const data=await res.json();if(!res.ok)throw new Error(data.error||'Unable to save. Please try again.');return data;
 }catch(e){if(e.name==='AbortError')throw new Error('The connection timed out. Refresh to check the last saved version before retrying.');throw e;}finally{clearTimeout(timer);}
}
async function load(){
 $('#refresh').disabled=true;$('#load-error').hidden=true;
 try{const data=await api();records=data.records;metadata=data.metadata;loaded=true;$('#connection-status').textContent='Saved in the cloud · checked '+new Date().toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});render();}
 catch(e){$('#load-error').textContent=e.message;$('#load-error').hidden=false;$('#connection-status').textContent=loaded?'Connection lost · showing the last loaded records':'Unable to connect';if(!loaded)$('#cards').innerHTML='<p class="empty">Your inquiries could not be loaded. Use Refresh to try again.</p>';}
 finally{$('#refresh').disabled=false;$('#add-inquiry').disabled=!loaded;}
}
function render(){
 const s=summary(records,today());
 $('#stats').innerHTML=[['Customer inquiries',s.customers,''],['Follow-ups due',s.followUps,'accent'],['Confirmed bookings',s.booked,''],['Outcome to record',s.unrecorded,'']].map(([label,value,cls])=>`<article class="stat ${cls}"><span>${label}</span><strong>${value}</strong></article>`).join('');
 $('#focus-title').textContent=s.followUps?`${s.followUps} follow-up${s.followUps===1?'':'s'} ready for you.`:s.unrecorded?'Give each inquiry a next step.':'Your next move is clear.';
 $('#focus-copy').textContent=s.followUps?'Open each due inquiry, get in touch, and record the next step.':s.unrecorded?`${s.unrecorded} customer inquiries have no recorded outcome. Review them before marking anything booked or lost.`:'Add a call or email, update a trip, or schedule your next follow-up.';
 $('#focus-action').dataset.filter=s.followUps?'due':s.unrecorded?'unknown':'customers';
 const hist=metadata.history;
 $('#snapshot-date').textContent=hist?`Historical emails through ${dateLabel(hist.through)}. ${s.excluded} excluded record${s.excluded===1?'':'s'}.`:'Historical import pending.';
 $('#footer-count').textContent=`${s.emails} historical emails · ${s.customers} customer inquiries`;
 renderCards();renderSources();
}
function renderCards(){
 const term=$('#search').value.trim().toLowerCase(),filter=$('#filter').value;
 const list=records.filter(r=>{
  const isCustomer=r.recordType==='Inquiry';
  if(filter==='excluded' ? isCustomer : filter==='review' ? !r.groupingNeedsReview : !isCustomer)return false;
  if(filter==='due'&&(!r.followUp||r.followUp>today()||['Booked','Lost','Cancelled'].includes(r.status)))return false;
  if(filter==='unknown'&&r.status)return false;
  if(STATUSES.includes(filter)&&r.status!==filter)return false;
  return !term || ['customer','email','phone','tripDate','event','pickup','stops','notes'].some(k=>String(r[k]??'').toLowerCase().includes(term));
 }).sort((a,b)=>(b.firstReceived||'').localeCompare(a.firstReceived||''));
 $('#result-count').textContent=`${list.length} ${list.length===1?'inquiry':'inquiries'}`;
 $('#cards').innerHTML=list.length?list.map(r=>`<article class="card"><div class="card-top"><div class="avatar" aria-hidden="true">${esc(r.customer.split(/\s+/).filter(Boolean).slice(0,2).map(s=>s[0]).join('').toUpperCase())}</div><div class="card-name"><h3>${esc(r.customer||'Unnamed inquiry')}</h3><p class="received">${esc(r.channel)} · ${dateLabel(r.firstReceived)}</p></div><span class="badge ${r.status==='Booked'?'booked':r.status==='Quoted'?'quoted':''}">${esc(r.recordType!=='Inquiry'?r.recordType:r.status||'Not recorded')}</span></div><div class="card-detail"><div><span>Trip date</span><strong>${dateLabel(r.tripDate)}</strong></div><div><span>Event / group</span><strong>${esc(r.event||r.passengers||'Not recorded')}</strong></div></div>${r.groupingNeedsReview?'<p class="review-tag">↳ Repeat submissions · grouping needs review</p>':''}${r.followUp?`<p class="followup ${r.followUp<=today()&&!['Booked','Lost','Cancelled'].includes(r.status)?'overdue':''}">Follow up ${dateLabel(r.followUp)}</p>`:''}<div class="card-foot"><span class="source-tag">↗ ${esc(sourceClass(r))}</span><button class="open-card" data-id="${esc(r.id)}">Open inquiry →</button></div></article>`).join(''):'<p class="empty">No inquiries match this view. Try another filter or add a new inquiry.</p>';
}
function renderSources(){
 const leads=records.filter(r=>r.recordType==='Inquiry');const counts=new Map();for(const r of leads){const k=sourceClass(r);counts.set(k,(counts.get(k)||0)+1);}
 $('#source-bars').innerHTML=[...counts].sort((a,b)=>b[1]-a[1]).map(([name,count])=>`<div class="source-row"><div><strong>${esc(name)}</strong><span>${count} of ${leads.length}</span></div><div class="bar"><meter min="0" max="${Math.max(1,leads.length)}" value="${count}" aria-label="${esc(name)}: ${count} inquiries">${count}</meter></div></div>`).join('')||'<p class="empty">Sources will appear when inquiries are added.</p>';
}
function setView(next){view=next;for(const b of document.querySelectorAll('[data-view]')){b.classList.toggle('active',b.dataset.view===next);if(b.dataset.view===next)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');}
 $('#overview-panel').hidden=next!=='overview';$('#inquiry-section').hidden=next==='sources';$('#sources-section').hidden=next!=='sources';
 $('#page-title').innerHTML=next==='sources'?'Know where<br>interest starts<span>.</span>':next==='inquiries'?'Every inquiry.<br>A clear next step<span>.</span>':'Your next trip<br>starts here<span>.</span>';
 $('#intro').textContent=next==='sources'?'The source evidence behind your customer inquiries.':next==='inquiries'?'From the first hello to the confirmed booking.':'A clear view of every inquiry and what needs your attention.';
 window.scrollTo({top:0,behavior:'instant'});
}
function openRecord(id){
 selected=id?structuredClone(records.find(r=>r.id===id)):{id:crypto.randomUUID(),recordType:'Inquiry',channel:'Phone',status:'New',reportedSource:'Unknown',submissions:[]};
 if(!selected)return;
 $('#detail-form').reset();dirty=false;$('#save-error').hidden=true;$('#discard-prompt').hidden=true;
 $('#detail-title').textContent=id?selected.customer:'Add an inquiry';$('#detail-kicker').textContent=id?`${selected.channel} · ${dateLabel(selected.firstReceived)}`:'PHONE, EMAIL OR TEXT';
 for(const el of $('#detail-form').elements){if(!el.name)continue;if(el.type==='checkbox')el.checked=Boolean(selected[el.name]);else el.value=selected[el.name]??'';}
 $('#contact-actions').replaceChildren();
 const phone=String(selected.phone||'').replace(/[^+\d]/g,'');
 if(phone&&/\d{3}/.test(phone)){for(const [label,prefix] of [['Call','tel:'],['Text','sms:']]){const a=document.createElement('a');a.href=prefix+phone;a.textContent=label;$('#contact-actions').append(a);}}
 if(selected.email && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(selected.email)){const a=document.createElement('a');a.href='mailto:'+encodeURIComponent(selected.email);a.textContent='Email';$('#contact-actions').append(a);}
 const notices=[];if(selected.recordType==='Test')notices.push('Marked as a test. Excluded from customer totals.');if(selected.groupingNeedsReview)notices.push('These repeat submissions were grouped from matching details. Review their history before clearing the review flag.');
 if(selected.preferredContact)notices.push('Preferred contact: '+selected.preferredContact+'.');
 if(selected.originalTripNotes)notices.push('Original request: '+selected.originalTripNotes);
 $('#record-notice').textContent=notices.join(' ');$('#record-notice').hidden=!notices.length;
 $('#evidence-details').open=false;
 $('#evidence').innerHTML=(selected.submissions||[]).map(s=>`<article class="evidence-entry"><strong>${dateLabel(s.receivedDate)} · ${esc(s.channel)}</strong><dl>${[['Reference',s.reference],['Submitted UTC',s.submittedAt],['Received display',s.receivedDisplay],['Source page',s.sourcePage],['Raw referrer',s.referrer],['UTM source',s.attribution?.utm_source],['UTM medium',s.attribution?.utm_medium],['UTM campaign',s.attribution?.utm_campaign],['UTM term',s.attribution?.utm_term],['UTM content',s.attribution?.utm_content],['Grouping',s.groupingEvidence]].filter(([,v])=>v).map(([k,v])=>`<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl>${s.evidence?`<p>${esc(s.evidence)}</p>`:''}${safeLink(s.mailboxURL)?`<a href="${esc(safeLink(s.mailboxURL))}" target="_blank" rel="noreferrer">Open original email ↗</a>`:''}</article>`).join('')||'<p class="small">No imported email history. This is a manually recorded inquiry.</p>';
 $('#detail-dialog').showModal();$('#detail-form').elements.customer.focus();
}
function finishClose(){ $('#discard-prompt').hidden=true;$('#detail-dialog').close();selected=null;dirty=false; }
function closeDetail(){if(saving)return;if(dirty){$('#discard-prompt').hidden=false;$('#keep-editing').focus();return;}finishClose();}
$('#keep-editing').addEventListener('click',()=>{$('#discard-prompt').hidden=true;$('#detail-form').elements.customer.focus();});
$('#discard-changes').addEventListener('click',finishClose);
$('#detail-form').addEventListener('input',()=>{dirty=true;});
$('#detail-form').addEventListener('submit',async e=>{
 e.preventDefault();if(saving||!selected)return;saving=true;$('#save').disabled=true;$('#save').textContent='Saving…';$('#save-error').hidden=true;
 const data={};for(const el of e.target.elements){if(!el.name)continue;data[el.name]=el.type==='checkbox'?el.checked:['quotedAmount','bookingValue'].includes(el.name)?(el.value.trim()===''?null:Number(el.value)):el.value;}
 // Keep the visible form identical to the submitted snapshot until it settles.
 const controls=[...e.target.elements];for(const el of controls)el.disabled=true;
 e.target.setAttribute('aria-busy','true');$('#discard-prompt').hidden=true;
 try{const result=await api(selected.revision?'PATCH':'POST',{id:selected.id,revision:selected.revision,data});const i=records.findIndex(r=>r.id===result.id);if(i<0)records.push(result);else records[i]=result;dirty=false;$('#detail-dialog').close();selected=null;$('#connection-status').textContent='Saved in the cloud · just now';render();toast('Inquiry saved.');}
 catch(e){$('#save-error').textContent=e.message;$('#save-error').hidden=false;$('#save-error').scrollIntoView({block:'nearest'});}
 finally{saving=false;for(const el of controls)el.disabled=false;e.target.removeAttribute('aria-busy');$('#save').textContent='Save inquiry';}
});
$('#detail-dialog').addEventListener('cancel',e=>{e.preventDefault();closeDetail();});$('.close-dialog').addEventListener('click',closeDetail);
$('#cards').addEventListener('click',e=>{const b=e.target.closest('[data-id]');if(b)openRecord(b.dataset.id);});
$('#add-inquiry').disabled=true;$('#add-inquiry').addEventListener('click',()=>openRecord());$('#refresh').addEventListener('click',load);
$('#search').addEventListener('input',renderCards);$('#filter').addEventListener('change',renderCards);
for(const b of document.querySelectorAll('[data-view]'))b.addEventListener('click',()=>setView(b.dataset.view));
$('#focus-action').addEventListener('click',()=>{$('#search').value='';$('#filter').value=$('#focus-action').dataset.filter||'customers';setView('inquiries');renderCards();});
$('#install-help').addEventListener('click',()=>$('#help-dialog').showModal());$('#close-help').addEventListener('click',()=>$('#help-dialog').close());
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;$('#native-install').hidden=false;});
$('#native-install').addEventListener('click',async()=>{if(installPrompt){await installPrompt.prompt();installPrompt=null;$('#native-install').hidden=true;}});
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
window.addEventListener('offline',()=>{$('#connection-status').textContent='Offline · changes require a connection';});
window.addEventListener('online',()=>{if(!$('#detail-dialog').open)load();});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!$('#detail-dialog').open&&!saving)load();});
$('#today').textContent=new Intl.DateTimeFormat('en-US',{weekday:'long',month:'long',day:'numeric',timeZone:'America/New_York'}).format(new Date()).toUpperCase();
if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>{});
load();

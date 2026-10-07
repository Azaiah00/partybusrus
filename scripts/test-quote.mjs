import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import vm from 'node:vm';

const html = readFileSync(new URL('../site/quote.html', import.meta.url),'utf8');
const thanks = readFileSync(new URL('../site/thank-you.html', import.meta.url),'utf8');
const script = readFileSync(new URL('../site/assets/quote.js', import.meta.url),'utf8');
const returnScript = readFileSync(new URL('../site/assets/quote-return.js', import.meta.url),'utf8');
const DRAFT='pbru_trip_draft_v2', PENDING='pbru_quote_pending_v2';
function storage(data={}) {
  const map = new Map(Object.entries(data));
  return {getItem:key=>map.get(key)??null,setItem:(key,value)=>map.set(key,String(value)),removeItem:key=>map.delete(key),map};
}
function attrs(text) {
  const result={};
  for (const match of text.matchAll(/([\w-]+)(?:="([^"]*)")?/g)) result[match[1]]=match[2]??'';
  return result;
}
function boot(options={}) {
  const ids={}, names={}, controls=[], events=[], windowEvents={}, payloads=[]; let focused=null;
  function element(a={}) {
    const el={id:a.id||'',name:a.name||'',type:a.type||'text',required:'required' in a,value:a.value||'',defaultValue:a.value||'',checked:'checked' in a,defaultChecked:'checked' in a,dataset:{},listeners:{},style:{},attributes:{},textContent:'',disabled:'disabled' in a,hidden:false,customError:'',min:a.min||'',
      addEventListener(name,fn){this.listeners[name]=fn;},
      setAttribute(name,value){this.attributes[name]=String(value);},
      removeAttribute(name){delete this.attributes[name];},
      toggleAttribute(name,on){if(on)this.attributes[name]='';else delete this.attributes[name];},
      setCustomValidity(value){this.customError=value;},
      checkValidity(){
        this.validity={valueMissing:this.required&&!this.value};
        return !this.validity.valueMissing&&!this.customError&&
          !(this.type==='email'&&this.value&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value))&&
          !(this.type==='date'&&this.value&&(!/^\d{4}-\d{2}-\d{2}$/.test(this.value)||this.value<this.min));
      },
      reportValidity(){this.reported=true;return this.checkValidity();},
      focus(){focused=this;}
    };
    el.classList={toggle(name,on){el[name]=on;}};
    Object.entries(a).filter(([key])=>key.startsWith('data-')).forEach(([key,value])=>el.dataset[key.slice(5)]=value);
    if(el.id)ids[el.id]=el;if(el.name&&!names[el.name])names[el.name]=el;
    return el;
  }
  const formMarkup=html.match(/<form\b[^>]*id="quoteForm"[\s\S]*?<\/form>/)[0];
  const markers=Array.from(formMarkup.matchAll(/class="qf-step[^\"]*" data-step="([1-3])"/g),m=>({index:m.index,step:Number(m[1])}));
  const steps=[1,2,3].map(n=>{const step=element();step.dataset.step=String(n);step.heading=element();step.controls=[];step.querySelectorAll=()=>step.controls;return step;});
  for(const match of formMarkup.matchAll(/<(input|select|textarea)\b([^>]*)>/g)) {
    const a=attrs(match[2]); const el=element(a); controls.push(el);
    if(match[1]==='select') {
      const end=formMarkup.indexOf('</select>',match.index);
      el.options=Array.from(formMarkup.slice(match.index,end).matchAll(/<option([^>]*)>([^<]*)<\/option>/g),m=>{
        const at=attrs(m[1]);return {value:at.value??m[2],text:m[2]};
      });
      let selected=el.options[0]?.value||'';
      Object.defineProperty(el,'value',{get:()=>selected,set(value){selected=el.options.some(o=>o.value===value)?value:'';}});
      Object.defineProperty(el,'selectedIndex',{get:()=>el.options.findIndex(o=>o.value===selected)});
      el.type='select-one';
    }
    const marker=markers.filter(m=>m.index<=match.index).at(-1);
    if(marker)steps[marker.step-1].controls.push(el);
  }
  const buttons=Array.from(formMarkup.matchAll(/<button\b([^>]*)>/g),m=>{const a=attrs(m[1]);const el=element(a);el.className=a.class||'';return el;});
  for(const id of ['qfStatus','qfFill','qfStepNum','qfStepName','qfSelection'])if(!ids[id])element({id});
  const form=element({id:'quoteForm'});form.elements={namedItem:key=>names[key]};
  form.querySelectorAll=selector=>selector==='.qf-step'?steps:selector==='.qf-next'?buttons.filter(b=>b.className.includes('qf-next')):selector==='.qf-back'?buttons.filter(b=>b.className.includes('qf-back')):selector==='[data-quick]'?buttons.filter(b=>b.dataset.quick):selector==='[aria-invalid]'?controls.filter(el=>'aria-invalid' in el.attributes):[];
  form.querySelector=selector=>selector==='.qf-step.active h3'?steps.find(step=>step.active).heading:steps[Number(selector.match(/data-step="(\d)"/)?.[1])-1];
  form.reset=()=>{form.listeners.reset?.();controls.forEach(el=>{el.value=el.defaultValue;el.checked=el.defaultChecked;});};
  const session=options.session||storage();const local=options.local||storage({'pbru_quote_draft':'private legacy data'});
  const context={document:{getElementById:id=>ids[id]||null},location:new URL(options.url||'https://www.partybusrus.com/quote'),sessionStorage:session,localStorage:local,navigator:{onLine:options.online??true},crypto:{randomUUID:()=> 'test-request-1234'},URLSearchParams,console,
    PBRUAnalytics:{track:(name,data)=>events.push({name,data}),getAttribution:()=>typeof options.source==='function'?options.source():options.source||{source_page:'/fleet/bus-35pax',utm_source:'google'}},
    addEventListener:(name,fn)=>windowEvents[name]=fn};context.window=context;
  Object.entries(options.initialValues||{}).forEach(([id,value])=>ids[id].value=value);
  vm.createContext(context);if(options.enhanced!==false)vm.runInContext(script,context);
  function fire(target,name='click') {let prevented=false;target.listeners[name]?.({target,preventDefault(){prevented=true;}});return prevented;}
  function formdata() {
    // Model successful controls from the actual form markup, including only checked radios.
    const data=new FormData();
    for(const el of controls)if(el.name&&!el.disabled&&!/^(button|reset|submit)$/.test(el.type)&&(!/^(checkbox|radio)$/.test(el.type)||el.checked))data.append(el.name,el.value);
    form.listeners.formdata?.({formData:data});
    return data;
  }
  return {ids,names,controls,steps,form,session,local,context,events,buttons,payloads,formdata,focused:()=>focused,fire,
    next:n=>fire(buttons.find(b=>b.dataset.next===String(n))),
    input:id=>fire(ids[id],'input'),
    submit:()=>{const prevented=fire(form,'submit');if(!prevented)payloads.push(formdata());return prevented;},
    contact:value=>controls.filter(el=>el.name==='contact_pref').forEach(el=>{el.checked=el.value===value;}),
    change:id=>{let prevented=false;form.listeners.change({target:ids[id],preventDefault(){prevented=true;}});return prevented;},
    pageshow:()=>windowEvents.pageshow?.()
  };
}
function fill(app) {
  const d=new Date();d.setDate(d.getDate()+30);
  const date=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  Object.entries({qfDate:date,qfHeadcount:'21-24',qfHours:'4',qfEventType:'Birthday',qfPickup:'Arlington, VA',qfName:'Example Customer',qfPhone:'202-555-0123',qfEmail:'test@example.test'}).forEach(([id,value])=>app.ids[id].value=value);
}
function bootReturn(options={}) {
  const session=options.session||storage();const nodes={returnHeading:{textContent:'neutral'},returnMessage:{textContent:'neutral'}};const events=[];const paths=[];
  const context={document:{referrer:options.referrer??'https://formsubmit.co/',getElementById:id=>nodes[id]},location:new URL(options.url||'https://www.partybusrus.com/thank-you#request=test-request-1234'),sessionStorage:session,URL,URLSearchParams,
    PBRUAnalytics:{track:(name,data)=>events.push({name,data})},history:{replaceState:(_,__,path)=>paths.push(path)}};context.window=context;
  vm.createContext(context);vm.runInContext(returnScript,context);
  return {session,nodes,events,paths};
}

test('markup has native provider, required integration IDs and no false success/geolocation code',()=>{
  assert.match(html,/method="POST" action="https:\/\/formsubmit\.co\/info@partybusrus\.com"/);
  assert.match(html,/name="_captcha" value="true"/);
  assert.match(html,/name="_autoresponse"/);
  assert.equal((html.match(/src="\/assets\/quote\.js"/g)||[]).length,1);
  assert.equal((thanks.match(/src="\/assets\/quote-return\.js"/g)||[]).length,1);
  assert.doesNotMatch(html,/getCurrentPosition|nominatim|generate_lead|quote-form.*alert\(/);
  assert.doesNotMatch(thanks,/lead_confirmed|CompleteRegistration|Quote received/);
  assert.doesNotMatch(html,/<div class="qf-step[^>]*hidden/);
  assert.match(html,/<fieldset class="qf-contact-fieldset/);
});
test('empty form stays on first step and focuses required date',()=>{
  const app=boot();app.next(2);
  assert.equal(app.focused().id,'qfDate');
  assert.equal(app.steps[0].hidden,false);
  assert.equal(app.ids.qfDate.attributes['aria-invalid'],'true');
  assert.ok(app.events.some(event=>event.name==='quote_validation_error'));
});
test('step navigation validates, announces and focuses step headings',()=>{
  const app=boot();fill(app);app.next(2);
  assert.equal(app.steps[1].hidden,false);assert.equal(app.focused(),app.steps[1].heading);
  app.ids.qfPickup.value='   ';app.next(3);
  assert.equal(app.focused().id,'qfPickup');assert.equal(app.ids.qfPickup.value,'');
  app.ids.qfPickup.value='Arlington';app.next(3);
  assert.equal(app.steps[2].hidden,false);
});
test('past date and invalid email/phone cannot be submitted',()=>{
  const app=boot();fill(app);app.ids.qfDate.value='2000-01-01';assert.equal(app.submit(),true);assert.equal(app.focused().id,'qfDate');
  fill(app);app.ids.qfPhone.value='abcdefghi';assert.equal(app.submit(),true);assert.equal(app.focused().id,'qfPhone');
  fill(app);app.ids.qfEmail.value='not-an-email';assert.equal(app.submit(),true);assert.equal(app.focused().id,'qfEmail');
  assert.equal(app.session.getItem(PENDING),null);
});
test('seven vehicle preferences supported; only recognized query selections populate',()=>{
  const app=boot({url:'https://www.partybusrus.com/quote?bus=bus-35pax&event=weddings'});
  assert.equal(app.ids.qfVehicle.options.length,8);
  assert.equal(app.ids.qfVehicle.value,'bus-35pax');assert.equal(app.ids.qfEventType.value,'Wedding');
  assert.match(app.ids.qfSelection.textContent,/Imperial 35/);
  const other=boot({url:'https://www.partybusrus.com/quote?bus=evil&event=constructor'});
  assert.equal(other.ids.qfVehicle.value,'');assert.equal(other.ids.qfEventType.value,'');
});
test('source copied to hidden fields and contact details never stored in draft',()=>{
  const app=boot();fill(app);app.ids.qfNotes.value='private notes';app.change('qfName');
  assert.equal(app.names.utm_source.value,'google');
  const draft=JSON.parse(app.session.getItem(DRAFT));
  assert.deepEqual(Object.keys(draft.fields).sort(),['qfDate','qfTime','qfHeadcount','qfHours','qfEventType','qfVehicle'].sort());
  assert.doesNotMatch(app.session.getItem(DRAFT),/Customer|example.test|Arlington|private notes|202-555/);
  assert.equal(app.local.getItem('pbru_quote_draft'),null);
});
test('only known area handoffs populate editable pickup and never overwrite existing location',()=>{
  for(const file of readdirSync(new URL('../site/cities/',import.meta.url)).filter(name=>name.endsWith('.html')&&name!=='index.html')){
    const app=boot({url:'https://www.partybusrus.com/quote?area='+file.replace('.html','')});
    assert.ok(app.ids.qfPickup.value,file);
    assert.equal(app.events.some(event=>JSON.stringify(event).includes(app.ids.qfPickup.value)),false);
    app.change('qfPickup');
    assert.equal('qfPickup' in JSON.parse(app.session.getItem(DRAFT)).fields,false);
  }
  assert.equal(boot({url:'https://www.partybusrus.com/quote?area=northern-virginia'}).ids.qfPickup.value,'Northern Virginia');
  assert.equal(boot({url:'https://www.partybusrus.com/quote?area=mclean-va'}).ids.qfPickup.value,'McLean, VA');
  assert.equal(boot({url:'https://www.partybusrus.com/quote?area=arlington-va',initialValues:{qfPickup:'Already entered'}}).ids.qfPickup.value,'Already entered');
  assert.equal(boot({url:'https://www.partybusrus.com/quote?area=Unknown-Customer-Address'}).ids.qfPickup.value,'');
});
test('corrupt, expired and future drafts are discarded without breaking form',()=>{
  for(const value of ['{bad',JSON.stringify({at:1,fields:{qfHours:'4'}}),JSON.stringify({at:Date.now()+86400000,fields:{qfHours:'4'}}),JSON.stringify({fields:{qfHours:'4'}})]){
    const app=boot({session:storage({[DRAFT]:value})});
    assert.equal(app.ids.qfHours.value,'');assert.equal(app.form.dataset.enhanced,'true');
  }
});
test('native valid submission emits one attempt, retains draft, prevents duplicate',()=>{
  const app=boot();fill(app);
  assert.equal(app.submit(),false);assert.equal(app.ids.qfSubmit.disabled,true);
  assert.equal(app.ids.qfReference.value,'test-request-1234');
  assert.equal(app.names._next.value,'https://www.partybusrus.com/thank-you#request=test-request-1234');
  assert.ok(app.session.getItem(DRAFT));assert.ok(app.session.getItem(PENDING));
  assert.equal(app.submit(),true);
  assert.equal(app.events.filter(event=>event.name==='quote_submit_attempt').length,1);
  assert.equal(app.events.some(event=>/generate_lead|lead_confirmed/.test(event.name)),false);
  app.pageshow();assert.equal(app.ids.qfSubmit.disabled,false);
});
test('offline and honeypot attempts never leave page or create pending return',()=>{
  const offline=boot({online:false});fill(offline);assert.equal(offline.submit(),true);
  assert.equal(offline.session.getItem(PENDING),null);assert.match(offline.ids.qfStatus.textContent,/offline/);
  const bot=boot();fill(bot);bot.names._honey.value='spam';assert.equal(bot.submit(),true);assert.equal(bot.session.getItem(PENDING),null);
});
test('clear form removes safe draft/pending state, resets validity and recovers submit',()=>{
  const app=boot();fill(app);app.submit();app.fire(app.ids.qfClearDraft);
  assert.equal(app.ids.qfName.value,'');assert.equal(app.ids.qfVehicle.value,'');
  assert.equal(app.session.getItem(DRAFT),null);assert.equal(app.session.getItem(PENDING),null);
  assert.equal(app.ids.qfSubmit.disabled,false);assert.equal(app.steps[0].hidden,false);
});
test('blocked storage permits native form submission without false return token',()=>{
  const blocked={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');},removeItem(){throw Error('blocked');}};
  const app=boot({session:blocked,local:blocked});fill(app);assert.equal(app.submit(),false);
  assert.equal(app.names._next.value,'https://www.partybusrus.com/thank-you');
});
function emailEntries(data) {return Array.from(data).filter(([key])=>!key.startsWith('_'));}
test('outgoing email has ordered readable rows, all recorded attribution and intact provider controls',()=>{
  const source={source_page:'/blog/how-much-does-a-party-bus-cost-dmv',source_referrer:'chatgpt.com',utm_source:'newsletter',utm_medium:'email',utm_campaign:'autumn_trips',utm_content:'fleet_link',utm_term:'party_bus'};
  const app=boot({source});fill(app);
  Object.entries({qfDate:'2096-02-29',qfTime:'15:30',qfHeadcount:'36-plus',qfHours:'9-plus',qfVehicle:'bus-35pax',qfDest:'Example event venue',qfNotes:'Please call after 5 PM.\nTwo planned stops.'}).forEach(([id,value])=>app.ids[id].value=value);
  app.contact('call');
  const original=app.formdata(), live=app.controls.map(el=>[el.name,el.value,el.checked]);
  assert.equal(original.get('contact_pref'),'call');assert.equal(original.getAll('contact_pref').length,1);
  assert.equal(app.submit(),false);
  const data=app.payloads[0];
  assert.deepEqual(emailEntries(data),[
    ['name','Example Customer'],['email','test@example.test'],['Phone','202-555-0123'],['Preferred contact','Call'],
    ['Trip date','February 29, 2096'],['Pickup time','3:30 PM'],['Passengers','36+ (ask about multiple vehicles)'],['Duration','9+ hours'],
    ['Event','Birthday'],['Vehicle','Imperial 35 · up to 35 passengers'],['Pickup','Arlington, VA'],['Stops','Example event venue'],['Notes','Please call after 5 PM.\nTwo planned stops.'],
    ['Recorded source','newsletter'],['Recorded referrer','chatgpt.com'],['Landing page','/blog/how-much-does-a-party-bus-cost-dmv'],
    ['Campaign','Medium: email; Campaign: autumn_trips; Content: fleet_link; Term: party_bus'],['Reference','test-request-1234']
  ]);
  for(const [key,value] of original)if(key.startsWith('_'))assert.equal(data.get(key),key==='_next'?'https://www.partybusrus.com/thank-you#request=test-request-1234':value,key);
  assert.equal(data.get('_template'),'table');assert.equal(data.get('_captcha'),'true');assert.ok(data.get('_autoresponse'));assert.equal(data.get('_honey'),'');
  assert.equal(data.getAll('email').length,1);assert.equal(data.getAll('name').length,1);
  assert.deepEqual(app.controls.filter(el=>!['_next','request_reference'].includes(el.name)).map(el=>[el.name,el.value,el.checked]),live.filter(([name])=>!['_next','request_reference'].includes(name)));
});
test('empty attribution and optional fields produce no blank or invented email rows',()=>{
  const app=boot({source:{}});fill(app);app.ids.qfDest.value='   ';app.ids.qfNotes.value='\n ';
  assert.equal(app.submit(),false);
  const entries=emailEntries(app.payloads[0]);
  assert.deepEqual(entries.map(([key])=>key),['name','email','Phone','Preferred contact','Trip date','Passengers','Duration','Event','Pickup','Reference']);
  assert.equal(app.payloads[0].get('Preferred contact'),'Text');assert.equal(app.payloads[0].get('Duration'),'4 hours');
  assert.equal(entries.some(([,value])=>value===''),false);
  assert.doesNotMatch(JSON.stringify(entries),/direct|google|utm_|source_page|source_referrer|request_reference/);
});
test('all fleet labels and contact preferences reflect the selected successful control',()=>{
  for(const value of ['bus-20pax','bus-24pax','bus-25pax','bus-28pax','bus-30pax','bus-32pax','bus-35pax']) {
    const app=boot({source:{}});fill(app);app.ids.qfVehicle.value=value;app.ids.qfHours.value='unsure';app.contact('email');app.submit();
    assert.equal(app.payloads[0].get('Vehicle'),app.ids.qfVehicle.options.find(option=>option.value===value).text);
    assert.equal(app.payloads[0].get('Duration'),'Help me plan');assert.equal(app.payloads[0].get('Preferred contact'),'Email');
  }
});
test('date and time formatting keeps the entered calendar day and noon or midnight',()=>{
  for(const [time,expected] of [['00:00','12:00 AM'],['12:00','12:00 PM'],['23:59','11:59 PM'],['09:05','9:05 AM']]) {
    const app=boot({source:{}});fill(app);app.ids.qfDate.value='2099-12-31';app.ids.qfTime.value=time;app.submit();
    assert.equal(app.payloads[0].get('Trip date'),'December 31, 2099');assert.equal(app.payloads[0].get('Pickup time'),expected);
  }
});
test('retry rebuilds current customer fields and source after consent changes',()=>{
  let source={source_page:'/blog/how-much-does-a-party-bus-cost-dmv',source_referrer:'chatgpt.com'};
  const app=boot({source:()=>source});fill(app);app.submit();
  assert.equal(app.payloads[0].get('Recorded referrer'),'chatgpt.com');assert.equal(app.submit(),true);assert.equal(app.payloads.length,1);
  app.pageshow();source={};app.ids.qfName.value='Another Example';app.contact('call');app.ids.qfNotes.value='New trip note';
  assert.equal(app.submit(),false);assert.equal(app.payloads.length,2);
  assert.equal(app.payloads[1].get('name'),'Another Example');assert.equal(app.payloads[1].get('Preferred contact'),'Call');assert.equal(app.payloads[1].get('Notes'),'New trip note');
  assert.equal(app.payloads[1].has('Recorded referrer'),false);assert.equal(app.payloads[1].has('Landing page'),false);
  app.pageshow();source={utm_medium:'referral',utm_campaign:'return_visit'};app.submit();
  assert.equal(app.payloads[2].get('Campaign'),'Medium: referral; Campaign: return_visit');assert.equal(app.payloads[2].has('Recorded source'),false);
});
test('formdata inspections and reset or page restoration cannot reuse a prepared submission',()=>{
  const app=boot();fill(app);
  assert.equal(app.formdata().has('event_date'),true);assert.equal(app.formdata().has('Trip date'),false);
  assert.equal(app.fire(app.form,'submit'),false);app.pageshow();
  assert.equal(app.formdata().has('event_date'),true);assert.equal(app.formdata().has('Trip date'),false);
  assert.equal(app.fire(app.form,'submit'),false);app.form.reset();
  assert.equal(app.formdata().has('event_date'),true);assert.equal(app.formdata().has('Trip date'),false);
  app.pageshow();fill(app);app.submit();
  assert.equal(app.payloads[0].has('Trip date'),true);assert.equal(app.formdata().has('event_date'),true);
  app.fire(app.ids.qfClearDraft);fill(app);app.submit();assert.equal(app.payloads[1].get('Preferred contact'),'Text');
});
test('format construction failure preserves the entire original native payload',()=>{
  const app=boot();fill(app);
  Object.defineProperty(app.ids.qfHeadcount,'options',{get(){throw Error('Formatting unavailable');}});
  assert.equal(app.submit(),false);
  const data=app.payloads[0];
  assert.equal(data.get('name'),'Example Customer');assert.equal(data.get('email'),'test@example.test');assert.equal(data.get('headcount'),'21-24');assert.equal(data.get('phone'),'202-555-0123');
  assert.equal(data.get('request_reference'),'test-request-1234');assert.equal(data.get('_captcha'),'true');assert.equal(data.has('Trip date'),false);
});
test('JavaScript-disabled form retains original native fields and checked preference',()=>{
  const app=boot({enhanced:false});fill(app);app.contact('call');app.submit();const data=app.payloads[0];
  assert.equal(app.form.dataset.enhanced,undefined);assert.equal(data.get('name'),'Example Customer');assert.equal(data.get('email'),'test@example.test');
  assert.equal(data.get('contact_pref'),'call');assert.equal(data.getAll('contact_pref').length,1);assert.equal(data.get('headcount'),'21-24');assert.equal(data.has('Trip date'),false);
  assert.equal(data.get('_captcha'),'true');assert.equal(data.get('_template'),'table');assert.ok(data.get('_autoresponse'));assert.equal(data.get('_next'),'https://www.partybusrus.com/thank-you');
  assert.equal(app.events.length,0);
});
test('formatted notification details never enter analytics or browser storage',()=>{
  const app=boot({source:{source_page:'/blog/how-much-does-a-party-bus-cost-dmv',source_referrer:'chatgpt.com'}});fill(app);
  app.ids.qfDest.value='Fictional destination';app.ids.qfNotes.value='Private synthetic trip note';app.submit();
  assert.ok(app.payloads[0].get('Notes'));
  const outsideEmail=JSON.stringify({events:app.events,session:Array.from(app.session.map),local:Array.from(app.local.map)});
  assert.doesNotMatch(outsideEmail,/Customer|example.test|202-555|Arlington|Fictional destination|Private synthetic trip note|chatgpt.com|how-much-does-a-party-bus-cost-dmv/);
  assert.deepEqual(Array.from(app.session.map.keys()).sort(),[DRAFT,PENDING].sort());
  assert.deepEqual(Object.keys(JSON.parse(app.session.getItem(DRAFT)).fields).sort(),['qfDate','qfTime','qfHeadcount','qfHours','qfEventType','qfVehicle'].sort());
});
test('guarded provider return consumes token once and never emits accepted lead',()=>{
  const session=storage({[PENDING]:JSON.stringify({id:'test-request-1234',at:Date.now()}),[DRAFT]:'{}'});
  const result=bootReturn({session});
  assert.equal(result.events.length,1);assert.equal(result.events[0].name,'quote_provider_return');
  assert.equal(session.getItem(PENDING),null);assert.equal(session.getItem(DRAFT),null);
  assert.match(result.nodes.returnHeading.textContent,/Thank you/);
  assert.equal(result.paths[0],'/thank-you');
  assert.equal(bootReturn({session}).events.length,0);
});
test('direct, unrelated, stale, future, mismatched and malformed returns stay neutral',()=>{
  const cases=[
    {},{referrer:'https://evil.example/'},{url:'https://www.partybusrus.com/thank-you'},
    {url:'https://www.partybusrus.com/thank-you#request=wrong'},
    {pending:{id:'test-request-1234',at:Date.now()-1800001}},
    {pending:{id:'test-request-1234',at:Date.now()+86400000}},
    {pending:{id:'test-request-1234'}},
    {pending:{id:'test-request-1234',at:'bad'}}
  ];
  for(const [index,options] of cases.entries()) {
    const pending=options.pending??{id:'test-request-1234',at:Date.now()};
    const result=bootReturn({...options,session:index===0?storage():storage({[PENDING]:JSON.stringify(pending)})});
    assert.equal(result.events.length,0,JSON.stringify(options));assert.equal(result.nodes.returnHeading.textContent,'neutral');
  }
});

// Explicit opt-in artifact for a local preview; no provider request or default file writes.
if(process.env.PBRU_QUOTE_EMAIL_SAMPLE_PATH) {
  const app=boot({source:{source_page:'/blog/how-much-does-a-party-bus-cost-dmv',source_referrer:'chatgpt.com'}});fill(app);
  Object.entries({qfTime:'18:30',qfVehicle:'bus-24pax',qfName:'Avery Example',qfEmail:'avery@example.test',qfPhone:'202-555-0147',qfDest:'Example celebration venue',qfNotes:'Fictional preview request. Please text about availability.'}).forEach(([id,value])=>app.ids[id].value=value);
  assert.equal(app.submit(),false);
  writeFileSync(process.env.PBRU_QUOTE_EMAIL_SAMPLE_PATH,JSON.stringify({synthetic:true,sent:false,provider_controls:Array.from(app.payloads[0]).filter(([key])=>key.startsWith('_')),email_rows:emailEntries(app.payloads[0])},null,2)+'\n');
}

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
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
  const ids={}, names={}, controls=[], events=[], windowEvents={}; let focused=null;
  function element(a={}) {
    const el={id:a.id||'',name:a.name||'',type:a.type||'text',required:'required' in a,value:a.value||'',defaultValue:a.value||'',dataset:{},listeners:{},style:{},attributes:{},textContent:'',disabled:false,hidden:false,customError:'',min:a.min||'',
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
  form.reset=()=>controls.forEach(el=>{el.value=el.defaultValue;});
  const session=options.session||storage();const local=options.local||storage({'pbru_quote_draft':'private legacy data'});
  const context={document:{getElementById:id=>ids[id]||null},location:new URL(options.url||'https://www.partybusrus.com/quote'),sessionStorage:session,localStorage:local,navigator:{onLine:options.online??true},crypto:{randomUUID:()=> 'test-request-1234'},URLSearchParams,console,
    PBRUAnalytics:{track:(name,data)=>events.push({name,data}),getAttribution:()=>options.source||{source_page:'/fleet/bus-35pax',utm_source:'google'}},
    addEventListener:(name,fn)=>windowEvents[name]=fn};context.window=context;
  Object.entries(options.initialValues||{}).forEach(([id,value])=>ids[id].value=value);
  vm.createContext(context);vm.runInContext(script,context);
  function fire(target,name='click') {let prevented=false;target.listeners[name]?.({target,preventDefault(){prevented=true;}});return prevented;}
  return {ids,names,steps,form,session,local,context,events,buttons,focused:()=>focused,fire,
    next:n=>fire(buttons.find(b=>b.dataset.next===String(n))),
    input:id=>fire(ids[id],'input'),
    submit:()=>fire(form,'submit'),
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

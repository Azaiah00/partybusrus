import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {summary,sourceClass,STATUSES} from '../lib/model.mjs';
import {upcoming,followUps,reminder,backupPayload} from '../lib/workflow.mjs';

// Exercise actual UI event handlers with a small DOM and a controllable network.
const source=(await readFile(new URL('../public/app.js',import.meta.url),'utf8')).replace(/^import .*?;\r?\n/gm,'');
async function desk(){
 const nodes=new Map();const listeners=new Map();let settle;
 function element(){return {value:'',hidden:false,disabled:false,dataset:{},events:{},open:false,textContent:'',innerHTML:'',classList:{toggle(){}},addEventListener(k,f){this.events[k]=f;},setAttribute(){},removeAttribute(){},focus(){},scrollIntoView(){},replaceChildren(){},append(){},showModal(){this.open=true;},close(){this.open=false;}};}
 const $=s=>{if(!nodes.has(s))nodes.set(s,element());return nodes.get(s);};
 const form=$('#detail-form');const customer=Object.assign(element(),{name:'customer',type:'text'});const notes=Object.assign(element(),{name:'notes',type:'textarea'});
 form.elements=[customer,notes,$('#save')];form.elements.customer=customer;
 form.reset=()=>{customer.value='';notes.value='';};
 const context={summary,sourceClass,STATUSES,upcoming,followUps,reminder,backupPayload,Intl,Date,URL,AbortController,structuredClone,crypto:{randomUUID:()=> '00000000-0000-4000-8000-000000000001'},navigator:{},setTimeout:()=>1,clearTimeout(){},
 document:{querySelector:$,querySelectorAll:()=>[],addEventListener(k,f){listeners.set(k,f);}},window:{addEventListener(){},scrollTo(){}},
 fetch:async(_url,options)=> options.method==='GET'?{redirected:false,ok:true,headers:new Headers({'content-type':'application/json'}),json:async()=>({records:[],metadata:{}})}:new Promise(resolve=>{settle=resolve;})};
 vm.runInNewContext(source,context);await new Promise(resolve=>setImmediate(resolve));
 return {$,form,customer,notes,respond(status,data){settle({redirected:false,ok:status<400,headers:new Headers({'content-type':'application/json'}),json:async()=>data});}};
}
test('unsaved edits survive Keep editing and Discard closes without a native prompt',async()=>{
 const {$,customer,form}=await desk();$('#add-inquiry').events.click();customer.value='Draft customer';form.events.input();
 $('.close-dialog').events.click();assert.equal($('#discard-prompt').hidden,false);assert.equal($('#detail-dialog').open,true);
 $('#keep-editing').events.click();assert.equal(customer.value,'Draft customer');assert.equal($('#discard-prompt').hidden,true);
 $('.close-dialog').events.click();$('#discard-changes').events.click();assert.equal($('#detail-dialog').open,false);
});
test('saving locks the submitted snapshot; failed save preserves editable fields',async()=>{
 const d=await desk();const {$,customer,notes,form}=d;$('#add-inquiry').events.click();customer.value='Example';notes.value='Keep this note';form.events.input();
 const pending=form.events.submit({preventDefault(){},target:form});assert.ok(form.elements.every(el=>el.disabled));
 $('.close-dialog').events.click();assert.equal($('#detail-dialog').open,true);
 d.respond(409,{error:'Changed on another device'});await pending;
 assert.ok(form.elements.every(el=>!el.disabled));assert.equal(notes.value,'Keep this note');assert.equal($('#detail-dialog').open,true);assert.equal($('#save-error').textContent,'Changed on another device');
});
test('review action clears unrelated search before showing the selected queue',async()=>{
 const {$}=await desk();$('#search').value='Unrelated search';$('#focus-action').dataset.filter='due';$('#focus-action').events.click();
 assert.equal($('#search').value,'');assert.equal($('#filter').value,'due');assert.equal($('#inquiry-section').hidden,false);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {createHandler} from '../netlify/functions/desk.mjs';
const origin='https://desk.example';
const request=(method,body,from=origin)=>new Request(origin+'/api/desk',{method,headers:{Origin:from,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
test('data API fails closed until platform access is verified',async()=>{
 const handler=createHandler({isEnabled:()=>false,repository:()=>{throw Error('must not run');}});
 assert.equal((await handler(request('GET'))).status,503);
});
test('cross-origin writes and malformed inputs never reach database',async()=>{
 let called=false;const handler=createHandler({isEnabled:()=>true,repository:()=>{called=true;return {};}});
 assert.equal((await handler(request('POST',{data:{}},'https://other.example'))).status,403);assert.equal(called,false);
 assert.equal((await handler(request('DELETE'))).status,405);
 assert.equal((await handler(request('PATCH',{id:'x',revision:1,data:{status:'paid'}}))).status,400);
});
test('GET emits no-store and preserves database revision',async()=>{
 const handler=createHandler({isEnabled:()=>true,repository:()=>({readAll:async()=>({records:[{id:'fixture',status:'',revision:2}],metadata:{capture:{state:'Not configured'}}})})});
 const res=await handler(request('GET'));assert.match(res.headers.get('cache-control'),/no-store/);const body=await res.json();assert.equal(body.records[0].revision,2);assert.equal(body.records[0].status,'');
});
test('revision conflicts do not claim a successful save',async()=>{
 const handler=createHandler({isEnabled:()=>true,repository:()=>({update:async()=>null})});
 assert.equal((await handler(request('PATCH',{id:'fixture',revision:2,data:{status:'Booked'}}))).status,409);
});
test('database errors do not expose private query text',async()=>{
 const handler=createHandler({isEnabled:()=>true,repository:()=>{throw Error('customer private data');}});
 const res=await handler(request('GET'));assert.equal(res.status,503);assert.ok(!(await res.text()).includes('customer private data'));
});

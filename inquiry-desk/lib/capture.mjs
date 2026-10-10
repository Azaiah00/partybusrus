import {createHash} from 'node:crypto';
import core from './formsubmit-core.mjs';
import {createRecord,businessDate} from './model.mjs';
import {documentRepository} from './documents.mjs';
const sha=value=>createHash('sha256').update(value).digest('hex');
export async function captureArchive({store,key,fetcher=fetch,now=new Date()}){
 if(!key)return {state:'Not configured',message:'The private FormSubmit archive key has not been connected.'};
 const slot=Math.floor(now.getTime()/(8*3600*1000));
 // Immutable eight-hour reservation: at most four attempts in any rolling day,
 // including failures, competing requests and manual runs. Never retry the fetch.
 const claim=await store.setJSON(`capture-attempts/${slot}`,{attemptedAt:now.toISOString()},{onlyIfNew:true});
 if(!claim.modified)return {state:'Waiting',message:'This eight-hour capture window has already been used. The next window will run automatically.'};
 const report={attemptedAt:now.toISOString(),state:'Error',created:0,matched:0,review:0};
 try{
  const res=await fetcher('https://formsubmit.co/api/get-submissions/'+encodeURIComponent(key),{redirect:'error',signal:AbortSignal.timeout(15000)});
  if(!res.ok)throw Error('Provider request failed');
  const text=await res.text();const normalized=core.normalizeArchive(text,sha);
  const repo=documentRepository(store);const {records}=await repo.readAll();
  const previousKeys=await store.list({prefix:'captures/'});
  const previous=await Promise.all(previousKeys.blobs.map(b=>store.get(b.key,{type:'json'})));
  if(previous.some(r=>!r))throw Error('Previous capture unavailable');
  const plan=core.planImport(normalized,previous);let pending=0;
  for(const conflict of plan.referenceConflicts){
   for(const old of previous.filter(p=>p.requestReference===conflict.requestReference)){
    const r=records.find(r=>r.id===old.inquiryId);
    if(r&&!r.groupingNeedsReview){const saved=await repo.update(r.id,r.revision,{groupingNeedsReview:true});if(!saved)throw Error('Concurrent inquiry edit');Object.assign(r,saved);}
   }
  }
  for(const item of plan.newRecords){
   const objectKey=`captures/${item.recordKey}.json`;
   if(await store.get(objectKey,{type:'json'}))continue;
   if(report.created+report.matched>=40){pending++;continue;}
   const f=item.fields;
   const matches=item.requestReference?records.filter(r=>(r.submissions||[]).some(s=>s.reference===item.requestReference)):[];
   const matched=matches.length===1&&!item.referenceConflict?matches[0]:null;
   const legacy=normalized.length&&records.filter(r=>r.customer===f.name&&r.email===f.email&&r.tripDate===core.tripDateIso(f.event_date)&&(r.submissions||[]).some(s=>s.submittedAt&&Date.parse(s.submittedAt)===Date.parse(item.submittedAtUtc)));
   const known=matched||(!item.referenceConflict&&legacy.length===1?legacy[0]:null);
   let id=known?.id;
   if(!known){
    const review=item.referenceConflict||matches.length>1||item.submittedAtUtc<'2026-10-07T04:00:00.000000Z';
    id='archive-'+item.recordKey;
    const record=createRecord({customer:f.name||'Website inquiry',email:f.email,phone:f.phone,channel:'Web quote',tripDate:core.tripDateIso(f.event_date),pickupTime:f.pickup_time,passengers:f.headcount,duration:f.hours,event:f.event_type,vehicle:f.vehicle_preference,pickup:f.pickup_location,stops:f.destinations,notes:f.notes,status:'',recordType:review?'Unclear':'Inquiry',groupingNeedsReview:review},id,businessDate(now));
    record.preferredContact=f.contact_pref;
    record.submissions=[{kind:'archive',receivedDate:businessDate(now),submittedAt:item.submittedAtUtc,channel:'Web quote',reference:item.requestReference,sourcePage:f.source_page,referrer:f.source_referrer,attribution:{utm_source:f.utm_source,utm_medium:f.utm_medium,utm_campaign:f.utm_campaign,utm_content:f.utm_content,utm_term:f.utm_term},evidence:'Provider archive observation; does not confirm email delivery or booking. First observed '+now.toISOString()}];
    await repo.create(record); // Deterministic ID makes interrupted-run retries safe.
    report.created++;if(review)report.review++;
   }else report.matched++;
   await store.setJSON(objectKey,{...item,inquiryId:id,firstObservedAt:now.toISOString()},{onlyIfNew:true});
  }
  report.state=pending?'Partial':'Current';report.pending=pending;report.completedAt=new Date().toISOString();
  report.message=pending?'More archive entries remain for the next capture window.':'Available website submissions checked. Direct emails and calls remain manual.';
 }catch{report.message='Capture could not finish. Existing records are safe. Check the private key/provider connection; the next window can retry.';}
 await store.setJSON(`capture-results/${slot}`,report,{onlyIfNew:true});return report;
}
export async function captureHealth(store,now=new Date()){
 const {blobs}=await store.list({prefix:'capture-attempts/'});
 const latest=blobs.sort((a,b)=>Number(b.key.split('/').pop())-Number(a.key.split('/').pop()))[0];
 if(!latest)return {state:'Not configured',message:'Automatic capture has not completed its first connection.'};
 const slot=latest.key.split('/').pop();const attempt=await store.get(latest.key,{type:'json'});const result=await store.get(`capture-results/${slot}`,{type:'json'});
 const age=now-Date.parse(attempt?.attemptedAt);
 if(age>24*3600000)return {...result,...attempt,state:'Stale',message:'No capture attempt in more than 24 hours. Check the connection; new website inquiries may be missing.'};
 return result||{...attempt,state:age<60000?'Running':'Interrupted',message:age<60000?'Checking available website submissions. Refresh shortly.':'The last capture did not finish. Review the connection before relying on these totals.'};
}

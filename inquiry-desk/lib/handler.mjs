import {createRecord,validateInput,businessDate} from './model.mjs';
const headers = {'Cache-Control':'private, no-store','Netlify-CDN-Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow','X-Content-Type-Options':'nosniff'};
const json = (data,status=200) => Response.json(data,{status,headers});
// The dedicated site's ALL-deploy platform sign-in gate is mandatory.
// Never move this function to an unprotected site. The runtime switch fails
// closed until that protection has been independently verified.
export function createHandler({repository, isEnabled, capture,health}) { return async function handler(req) {
  if (!isEnabled()) return json({error:'Private access is being configured.'},503);
  if (!['GET','POST','PATCH'].includes(req.method)) return json({error:'Method not allowed.'},405);
  if (req.method !== 'GET') {
    if (req.headers.get('origin') !== new URL(req.url).origin) return json({error:'Open the inquiry desk to make changes.'},403);
    if (!(req.headers.get('content-type') || '').startsWith('application/json')) return json({error:'JSON required.'},415);
  }
  try {
    if (req.method === 'GET') {
      const url=new URL(req.url);
      if(url.searchParams.get('action')==='history'){
        const id=url.searchParams.get('id');if(!id||id.length>200)return json({error:'Invalid record ID.'},400);
        return json({versions:await repository().history(id)});
      }
      const data=await repository().readAll();if(health)data.metadata={...data.metadata,capture:await health()};
      return json({...data,fetchedAt:new Date().toISOString()});
    }
    const raw = await req.text();
    if (raw.length > 25000) return json({error:'Record is too large.'},413);
    let body; try { body=JSON.parse(raw); } catch { return json({error:'Invalid request.'},400); }
    if (!body || typeof body !== 'object' || Array.isArray(body)) return json({error:'Invalid request.'},400);
    if(body.action==='capture')return req.method==='POST'&&capture?json(await capture()):json({error:'Capture is not configured in this environment.'},503);
    if(body.action==='restore'){
      if(req.method!=='POST'||typeof body.id!=='string'||!body.id||body.id.length>200||!Number.isInteger(body.revision)||body.revision<1||body.revision>=9999999999||!Number.isInteger(body.fromRevision)||body.fromRevision<1||body.fromRevision>=body.revision)return json({error:'Select an earlier saved version.'},400);
      const repo=repository();const previous=await repo.snapshot(body.id,body.fromRevision);
      if(!previous)return json({error:'Saved version not found.'},404);
      // Restore editable business fields only. Newer source evidence is never removed.
      const fields=['customer','email','phone','channel','tripDate','pickupTime','passengers','duration','event','vehicle','pickup','stops','status','followUp','quotedAmount','bookingValue','notes','recordType','reportedSource','groupingNeedsReview'];
      const restored=await repo.update(body.id,body.revision,Object.fromEntries(fields.filter(k=>k in previous).map(k=>[k,previous[k]])));
      return restored?json(restored):json({error:'This inquiry changed. Refresh before restoring a version.'},409);
    }
    let data;
    try { data = validateInput(body.data,{create:req.method==='POST'}); } catch(e) { return json({error:e.message},400); }
    if (req.method === 'POST') {
      if (!/^[0-9a-f-]{36}$/.test(body.id || '')) return json({error:'Invalid record ID.'},400);
      const record = createRecord(data,body.id,businessDate());
      const result = await repository().create(record);
      if (!result) return json({error:'This entry already exists. Refresh to check it.'},409);
      return json(result,201);
    }
    if (typeof body.id !== 'string' || !body.id || body.id.length > 200 || !Number.isInteger(body.revision) || body.revision < 1 || body.revision >= 9999999999) return json({error:'Invalid record version.'},400);
    const result = await repository().update(body.id,body.revision,data);
    if (!result) return json({error:'This inquiry changed on another device. Your edits are still open. Copy any notes, then refresh and try again.'},409);
    return json(result);
  } catch {
    // Do not log query text or contact data.
    return json({error:'The desk could not reach its storage. Your edits have not been saved. Please try again.'},503);
  }
}; }

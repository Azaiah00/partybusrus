import { getStore } from '@netlify/blobs';
import { createRecord, validateInput, businessDate } from '../../lib/model.mjs';
import { documentRepository } from '../../lib/documents.mjs';
import { STORE_NAME } from '../../lib/deployment.mjs';
const headers = {'Cache-Control':'private, no-store','Netlify-CDN-Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow','X-Content-Type-Options':'nosniff'};
const json = (data,status=200) => Response.json(data,{status,headers});
// The dedicated site's ALL-deploy Netlify team-login gate is mandatory.
// Never move this function to an unprotected site. The runtime switch fails
// closed until that protection has been independently verified.
export function createHandler({repository, isEnabled}) { return async function handler(req) {
  if (!isEnabled()) return json({error:'Private access is being configured.'},503);
  if (!['GET','POST','PATCH'].includes(req.method)) return json({error:'Method not allowed.'},405);
  if (req.method !== 'GET') {
    if (req.headers.get('origin') !== new URL(req.url).origin) return json({error:'Open the inquiry desk to make changes.'},403);
    if (!(req.headers.get('content-type') || '').startsWith('application/json')) return json({error:'JSON required.'},415);
  }
  try {
    if (req.method === 'GET') {
      return json({...await repository().readAll(),fetchedAt:new Date().toISOString()});
    }
    const raw = await req.text();
    if (raw.length > 25000) return json({error:'Record is too large.'},413);
    let body; try { body=JSON.parse(raw); } catch { return json({error:'Invalid request.'},400); }
    if (!body || typeof body !== 'object' || Array.isArray(body)) return json({error:'Invalid request.'},400);
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
export default createHandler({isEnabled:()=>Netlify.env.get('DESK_ACCESS_VERIFIED') === 'team-login-all-deploys',repository:()=>{
  const name=STORE_NAME;
  if(!['inquiry-preview-v1','inquiry-production-v1'].includes(name))throw Error('Storage not configured');
  return documentRepository(getStore({name,consistency:'strong'}));
}});

// Recovery is deliberately separate from the live app: restore to an empty,
// isolated store, verify it, then explicitly choose whether to promote it.
export function recoveryPlan(text){
 if(Buffer.byteLength(text)>20_000_000)throw Error('Backup exceeds 20 MB.');
 const data=JSON.parse(text);
 if(data.format!=='pbru-inquiry-backup'||data.version!==1||!Array.isArray(data.records)||data.records.length>10000||!data.metadata||typeof data.metadata!=='object'||Array.isArray(data.metadata))throw Error('Unsupported backup.');
 const ids=new Set();
 const entries=data.records.map(record=>{
  if(!record||typeof record.id!=='string'||!record.id||record.id.length>200||ids.has(record.id)||!Number.isSafeInteger(record.revision)||record.revision<1||record.revision>9999999999||typeof record.customer!=='string'||!Array.isArray(record.submissions))throw Error('Invalid or duplicate backup record.');
  ids.add(record.id);
  return {key:`records/${encodeURIComponent(record.id)}/${String(record.revision).padStart(10,'0')}.json`,value:record};
 });
 return [...entries,{key:'metadata',value:{...data.metadata,capture:{state:'Not configured',message:'Recovered backup. Reconnect and verify capture before relying on automatic updates.'}}}];
}
export async function recoverEmptyStore(store,text){
 const entries=recoveryPlan(text);
 const {blobs}=await store.list({prefix:''});if(blobs.length)throw Error('Recovery requires an empty isolated store.');
 for(const entry of entries){const result=await store.setJSON(entry.key,entry.value,{onlyIfNew:true});if(!result.modified)throw Error('Recovery stopped: another writer used this store.');}
 for(const entry of entries){const value=await store.get(entry.key,{type:'json'});if(JSON.stringify(value)!==JSON.stringify(entry.value))throw Error('Recovery verification failed. Do not promote this store.');}
 return {records:entries.length-1,verified:true};
}

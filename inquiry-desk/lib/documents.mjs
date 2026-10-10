// Immutable document versions. No mutable shared index or counter.
// Atomic onlyIfNew elects one winner for a revision. A losing writer refreshes.
const key=(id,revision)=>`records/${encodeURIComponent(id)}/${String(revision).padStart(10,'0')}.json`;
export function documentRepository(store){
 async function latest(id){
  const prefix=`records/${encodeURIComponent(id)}/`;
  const {blobs}=await store.list({prefix});
  const versions=blobs.filter(b=>/^\d{10}\.json$/.test(b.key.slice(prefix.length))).sort((a,b)=>b.key.localeCompare(a.key));
  if(!versions.length)return null;
  const record=await store.get(versions[0].key,{type:'json'});if(!record)throw Error('Document unavailable');return record;
 }
 return {
  async readAll(){
   const {blobs}=await store.list({prefix:'records/'});const current=new Map();
   for(const b of blobs){const m=/^records\/([^/]+)\/(\d{10})\.json$/.exec(b.key);if(m&&(!current.has(m[1])||current.get(m[1]).key<b.key))current.set(m[1],b);}
   const records=await Promise.all([...current.values()].map(b=>store.get(b.key,{type:'json'})));
   if(records.some(r=>!r))throw Error('Document unavailable');
   const metadata=await store.get('metadata',{type:'json'})||{capture:{state:'Not configured'}};
   return {records,metadata};
  },
  async create(record){const saved={...record,revision:1,updatedAt:new Date().toISOString()};const result=await store.setJSON(key(record.id,1),saved,{onlyIfNew:true});return result.modified?saved:null;},
  async update(id,revision,data){
   const previous=await latest(id);if(!previous||previous.revision!==revision)return null;
   const saved={...previous,...data,revision:revision+1,updatedAt:new Date().toISOString()};
   const result=await store.setJSON(key(id,revision+1),saved,{onlyIfNew:true});return result.modified?saved:null;
  }
 };
}

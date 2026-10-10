// Private Vercel Blob adapter for immutable inquiry versions. The deployment
// must also require Vercel Authentication for ALL deployments and domains.
export function vercelDocumentStore(sdk,{environment='preview'}={}){
 const prefix=environment==='production'?'inquiry-production-v1/':'inquiry-preview-v1/';
 const pathname=key=>{if(typeof key!=='string'||key.startsWith('/')||key.includes('..')||key.includes('\\'))throw Error('Invalid object key');return prefix+key;};
 return {
  async list({prefix:subprefix=''}){
   const blobs=[];let cursor;
   do{const page=await sdk.list({prefix:pathname(subprefix),cursor,limit:1000});
    for(const b of page.blobs){if(!b.pathname.startsWith(prefix))throw Error('Storage namespace mismatch');blobs.push({key:b.pathname.slice(prefix.length)});}
    cursor=page.hasMore?page.cursor:undefined;if(page.hasMore&&!cursor)throw Error('Incomplete storage listing');
   }while(cursor);
   return {blobs};
  },
  async get(key){
   const result=await sdk.get(pathname(key),{access:'private',useCache:false});
   if(!result)return null;if(result.statusCode!==200||!result.stream)throw Error('Object unavailable');
   return new Response(result.stream).json();
  },
  async setJSON(key,value,{onlyIfNew=true}={}){
   if(!onlyIfNew)throw Error('Mutable overwrite is disabled');
   try{await sdk.put(pathname(key),JSON.stringify(value),{access:'private',addRandomSuffix:false,allowOverwrite:false,contentType:'application/json',cacheControlMaxAge:60});return {modified:true};}
   catch(e){
    // The SDK does not expose a distinct already-exists error class. Check the
    // immutable path after a failed create; never retry with overwrite enabled.
    try{if(await sdk.get(pathname(key),{access:'private',useCache:false}))return {modified:false};}catch{}
    throw e;
   }
  }
 };
}

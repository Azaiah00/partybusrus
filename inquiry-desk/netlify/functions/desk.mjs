import {getStore} from '@netlify/blobs';
import {documentRepository} from '../../lib/documents.mjs';
import {STORE_NAME} from '../../lib/deployment.mjs';
import {captureArchive,captureHealth} from '../../lib/capture.mjs';
import {createHandler} from '../../lib/handler.mjs';
export {createHandler};
const privateStore=()=>getStore({name:STORE_NAME,consistency:'strong'});
export default createHandler({isEnabled:()=>Netlify.env.get('DESK_ACCESS_VERIFIED') === 'team-login-all-deploys',health:()=>captureHealth(privateStore()),capture:()=>STORE_NAME==='inquiry-production-v1'?captureArchive({store:privateStore(),key:Netlify.env.get('FORMSUBMIT_ARCHIVE_KEY')}):{state:'Preview',message:'Provider capture is disabled in previews.'},repository:()=>{
  const name=STORE_NAME;
  if(!['inquiry-preview-v1','inquiry-production-v1'].includes(name))throw Error('Storage not configured');
  return documentRepository(getStore({name,consistency:'strong'}));
}});

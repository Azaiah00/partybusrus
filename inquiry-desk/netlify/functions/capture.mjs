import {getStore} from '@netlify/blobs';
import {captureArchive} from '../../lib/capture.mjs';
import {STORE_NAME} from '../../lib/deployment.mjs';
export default async()=>{
 if(STORE_NAME!=='inquiry-production-v1'||Netlify.env.get('DESK_ACCESS_VERIFIED')!=='team-login-all-deploys')return;
 await captureArchive({store:getStore({name:STORE_NAME,consistency:'strong'}),key:Netlify.env.get('FORMSUBMIT_ARCHIVE_KEY')});
};
// Every eight hours, UTC (04:00/12:00/20:00 EDT, 03:00/11:00/19:00 EST).
export const config={schedule:'0 0,8,16 * * *'};

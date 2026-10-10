import * as blob from '@vercel/blob';
import {createHandler} from '../lib/handler.mjs';
import {documentRepository} from '../lib/documents.mjs';
import {vercelDocumentStore} from '../lib/vercel-store.mjs';
import {captureArchive,captureHealth} from '../lib/capture.mjs';
const store=()=>vercelDocumentStore(blob,{environment:process.env.VERCEL_ENV});
// This flag is a fail-closed operational check, not authentication. Set it only
// after independently verifying the project's all-deployment platform gate.
const handler=createHandler({
 isEnabled:()=>process.env.DESK_ACCESS_VERIFIED==='vercel-auth-all-deploys',
 repository:()=>documentRepository(store()),health:()=>captureHealth(store()),
 capture:()=>process.env.VERCEL_ENV==='production'?captureArchive({store:store(),key:process.env.FORMSUBMIT_ARCHIVE_KEY}):{state:'Preview',message:'Provider capture is disabled in previews.'}
});
export const GET=handler;export const POST=handler;export const PATCH=handler;

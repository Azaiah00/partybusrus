// Installable shell with network-only requests. Never cache customer data,
// authenticated responses, login pages or stale records on a shared phone.
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{
 if(event.request.mode==='navigate')event.respondWith(fetch(event.request).catch(()=>new Response('<!doctype html><html lang="en"><meta name="viewport" content="width=device-width"><title>Inquiry Desk offline</title><body><h1>You’re offline.</h1><p>Reconnect to securely view your inquiries, then reload this page.</p></body></html>',{status:503,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}})));
});

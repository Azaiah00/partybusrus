export function upcoming(records,today){return records.filter(r=>r.recordType==='Inquiry'&&r.tripDate&&r.tripDate>=today&&!['Lost','Cancelled'].includes(r.status)).sort((a,b)=>a.tripDate.localeCompare(b.tripDate));}
export function followUps(records,today){return records.filter(r=>r.recordType==='Inquiry'&&r.followUp&&!['Booked','Lost','Cancelled'].includes(r.status)).sort((a,b)=>a.followUp.localeCompare(b.followUp));}
const escapeICS=s=>String(s||'').replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
export function reminder(record,now=new Date(),deskUrl){
 const origin=deskUrl?new URL(deskUrl).origin:null;if(origin&&!/^https?:\/\//.test(origin))throw Error('Invalid desk URL.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(record.followUp||''))throw Error('Choose and save a follow-up date first.');
 const day=new Date(record.followUp+'T14:00:00Z');if(Number.isNaN(+day)||day.toISOString().slice(0,10)!==record.followUp)throw Error('Choose a valid follow-up date.');
 const hour=Number(new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',hour:'2-digit',hourCycle:'h23'}).format(day));
 const start=new Date(+day+(9-hour)*3600000),stamp=d=>d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Party Bus R Us//Inquiry Desk//EN','BEGIN:VEVENT','UID:'+escapeICS(record.id)+'@inquiry-desk.partybusrus.com','DTSTAMP:'+stamp(now),'DTSTART:'+stamp(start),'DTEND:'+stamp(new Date(+start+15*60000)),'SUMMARY:'+escapeICS('Follow up: '+record.customer),'DESCRIPTION:Open your private Inquiry Desk for details.',...(origin?['URL:'+origin+'/']:[]),'BEGIN:VALARM','TRIGGER:-PT15M','ACTION:DISPLAY','DESCRIPTION:Inquiry follow-up','END:VALARM','END:VEVENT','END:VCALENDAR'];
 // UTF-8 aware folding keeps names from producing invalid long calendar lines.
 return lines.map(line=>{let result='',bytes=0;for(const c of line){const n=new TextEncoder().encode(c).length;if(bytes+n>73){result+='\r\n ';bytes=1;}result+=c;bytes+=n;}return result;}).join('\r\n')+'\r\n';
}
export function backupPayload(data,now=new Date()){return {format:'pbru-inquiry-backup',version:1,exportedAt:now.toISOString(),records:data.records,metadata:data.metadata};}

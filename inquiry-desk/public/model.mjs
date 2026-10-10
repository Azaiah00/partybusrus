export const STATUSES = ['', 'New', 'Contacted', 'Qualified', 'Quoted', 'Booked', 'Lost', 'Cancelled'];
export const TYPES = ['Inquiry', 'Test', 'Spam', 'Unclear'];
export const CHANNELS = ['Web quote', 'Email', 'Phone', 'Text'];
export const SOURCES = ['Unknown', 'Google Search', 'Google Maps', 'Referral', 'Repeat', 'Social', 'Other'];
export const businessDate = (now = new Date()) => new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
const editable = ['customer','email','phone','channel','tripDate','pickupTime','passengers','duration','event','vehicle','pickup','stops','status','followUp','quotedAmount','bookingValue','notes','recordType','reportedSource','groupingNeedsReview'];
function date(value) { return value === '' || (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value); }
export function validateInput(input, { create = false } = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid record.');
  const out = {};
  for (const key of Object.keys(input)) {
    if (!editable.includes(key)) throw new Error('Unexpected field: ' + key);
    const value = input[key];
    if (['quotedAmount','bookingValue'].includes(key)) {
      if (value !== null && (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 10000000)) throw new Error('Enter a valid amount or leave it blank.');
    } else if (key === 'groupingNeedsReview') {
      if (typeof value !== 'boolean') throw new Error('Invalid review state.');
    } else if (typeof value !== 'string' || value.length > (key === 'notes' ? 12000 : 1500)) throw new Error('Invalid or oversized ' + key + '.');
    out[key] = typeof value === 'string' ? value.trim() : value;
  }
  for (const [key, options] of [['status',STATUSES],['recordType',TYPES],['channel',CHANNELS],['reportedSource',SOURCES]]) {
    if (key in out && !options.includes(out[key])) throw new Error('Invalid ' + key + '.');
  }
  for (const key of ['tripDate','followUp']) if (key in out && !date(out[key])) throw new Error('Enter a valid calendar date.');
  if (out.email && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(out.email)) throw new Error('Enter a valid email address.');
  if (out.phone && !/^[+\d\s().x-]{3,40}$/i.test(out.phone)) throw new Error('Enter a valid phone number.');
  if ((create || 'customer' in out) && !out.customer) throw new Error('Enter a customer name or reference.');
  return out;
}
export function sourceClass(record) {
  const refs = record.submissions?.map(s => s.referrer) ?? [];
  const hosts = refs.filter(Boolean).map(ref => { try { return new URL(ref.includes('://') ? ref : 'https://' + ref).hostname.toLowerCase(); } catch { return ''; } });
  if (hosts.some(h => h === 'chatgpt.com' || h.endsWith('.chatgpt.com'))) return 'ChatGPT referral';
  if (record.reportedSource && record.reportedSource !== 'Unknown') return record.reportedSource + ' · reported';
  if (hosts.some(h => h && h !== 'partybusrus.com' && !h.endsWith('.partybusrus.com'))) return 'Other recorded referral';
  return 'Unknown';
}
export function summary(records, today) {
  const leads = records.filter(r => r.recordType === 'Inquiry');
  const active = leads.filter(r => !['Booked','Lost','Cancelled'].includes(r.status));
  return {
    customers: leads.length,
    followUps: active.filter(r => r.followUp && r.followUp <= today).length,
    booked: leads.filter(r => r.status === 'Booked').length,
    bookedValue: leads.filter(r => r.status === 'Booked').reduce((s,r) => s + (r.bookingValue ?? 0),0),
    unrecorded: leads.filter(r => !r.status).length,
    excluded: records.length-leads.length,
    review: records.filter(r => r.groupingNeedsReview).length,
    emails: records.reduce((s,r) => s + (r.submissions?.filter(s=>s.kind!=='archive').length ?? 0),0)
  };
}
export function createRecord(input, id, today) {
  return {id,customer:'',email:'',phone:'',channel:'Phone',tripDate:'',pickupTime:'',passengers:'',duration:'',event:'',vehicle:'',pickup:'',stops:'',status:'New',followUp:'',quotedAmount:null,bookingValue:null,notes:'',recordType:'Inquiry',reportedSource:'Unknown',groupingNeedsReview:false,firstReceived:today,submissions:[],...validateInput(input,{create:true})};
}

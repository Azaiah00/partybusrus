import test from 'node:test';
import assert from 'node:assert/strict';
import {createRecord,validateInput,summary,sourceClass,businessDate} from '../lib/model.mjs';
test('new inquiry dates follow Eastern business date across UTC midnight',()=>{
 assert.equal(businessDate(new Date('2026-10-10T00:15:00Z')),'2026-10-09');
});
test('unknown outcomes are preserved and tests excluded from customer metrics',()=>{
 const records=[{recordType:'Inquiry',status:'',submissions:[{},{}]}, {recordType:'Test',status:'Booked',bookingValue:999,submissions:[{}]},{recordType:'Inquiry',status:'Quoted',quotedAmount:1500}];
 const s=summary(records,'2026-10-09');assert.equal(s.customers,2);assert.equal(s.booked,0);assert.equal(s.bookedValue,0);assert.equal(s.unrecorded,1);assert.equal(s.emails,3);
});
test('due followups exclude finished and test inquiries',()=>{
 const base={recordType:'Inquiry',followUp:'2026-10-08',status:'Contacted'};
 assert.equal(summary([base,{...base,status:'Booked'},{...base,recordType:'Test'},{...base,followUp:'2026-10-10'}],'2026-10-09').followUps,1);
});
test('internal referrer and missing attribution stay unknown',()=>{
 assert.equal(sourceClass({submissions:[{referrer:'https://partybusrus.com/quote'}]}),'Unknown');assert.equal(sourceClass({}),'Unknown');
});
test('source classification uses host boundaries and labels reported sources',()=>{
 assert.equal(sourceClass({submissions:[{referrer:'https://chatgpt.com/a'}]}),'ChatGPT referral');
 assert.equal(sourceClass({submissions:[{referrer:'https://chatgpt.com.evil.test/'}]}),'Other recorded referral');
 assert.equal(sourceClass({reportedSource:'Google Search'}),'Google Search · reported');
});
test('validation rejects unknown fields, invalid dates, amounts, URLs and outcomes',()=>{
 for(const value of [{revision:3},{tripDate:'2026-02-30'},{bookingValue:-1},{bookingValue:Infinity},{email:'bad\n@example.com'},{phone:'javascript:alert(1)'},{recordType:'Customer'},{status:'Paid'}])assert.throws(()=>validateInput(value));
});
test('new inquiries retain null amounts, unknown source and stable ID',()=>{
 const r=createRecord({customer:'Example guest'},'fixed-id','2026-10-09');assert.equal(r.id,'fixed-id');assert.equal(r.bookingValue,null);assert.equal(r.reportedSource,'Unknown');assert.equal(r.status,'New');
});

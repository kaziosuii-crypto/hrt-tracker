import test from 'node:test';
import assert from 'node:assert/strict';
import { createPhotoHandler, MAX_PHOTO_BYTES } from '../lib/meal-photo-upload.mjs';
const jpeg = new Uint8Array([255,216,255,224,0,0]);
function fixture(overrides = {}) {
  const calls = [];
  const deps = {
    authorize: async () => 200,
    findMeal: async () => ({ id: 5, record_date: '2026-10-16', photo_before_url: 'old', photo_after_url: 'after' }),
    upload: async (...args) => { calls.push(['upload', ...args]); return { url: 'https://blob/new' }; },
    save: async (...args) => { calls.push(['save', ...args]); return { id:5, photo_before_url:args[2], photo_after_url:'after' }; },
    remove: async (...args) => { calls.push(['remove', ...args]); },
    ...overrides,
  };
  return { calls, run: (req, id = '5') => createPhotoHandler(deps)(req, { params: Promise.resolve({ id }) }) };
}
function request(role = 'before', bytes = jpeg, type = 'image/jpeg') {
  const form = new FormData(); form.set('role', role); form.set('file', new File([bytes], 'photo.jpg', {type}));
  return new Request('http://localhost/api/food-logs/5/photos', {method:'POST',body:form});
}
test('unauthenticated and non-owner requests never write', async () => {
  for (const status of [401,403]) { const f = fixture({authorize: async () => status}); assert.equal((await f.run(request())).status,status); assert.equal(f.calls.length,0); }
});
test('upload replaces only selected slot and compares its original URL', async () => {
  const f=fixture(); const res=await f.run(request()); assert.equal(res.status,200);
  assert.deepEqual(f.calls[1],['save','5','photo_before_url','https://blob/new','old']);
  assert.equal((await res.json()).photo_after_url,'after');
});
test('invalid ID, role, format, empty image and missing meal never upload', async () => {
  for (const [req,id,status] of [[request(),'../5',400],[request('x'),'5',400],[request('before',new Uint8Array([1,2])),'5',415],[request('before',new Uint8Array()),'5',400]]) {
    const f=fixture(); assert.equal((await f.run(req,id)).status,status); assert.equal(f.calls.length,0);
  }
  const f=fixture({findMeal:async()=>null}); assert.equal((await f.run(request())).status,404); assert.equal(f.calls.length,0);
});
test('oversized bodies are rejected even without Content-Length', async () => {
  const f=fixture(); assert.equal((await f.run(request('before',new Uint8Array(MAX_PHOTO_BYTES+1)))).status,413); assert.equal(f.calls.length,0);
});
test('failed DB update removes only newly uploaded blob', async () => {
  const f=fixture({save:async()=>{throw Error('db');}}); assert.equal((await f.run(request())).status,500); assert.deepEqual(f.calls.at(-1),['remove','https://blob/new']);
});
test('concurrent replacement returns conflict and removes new orphan', async () => {
  const f=fixture({save:async()=>null}); assert.equal((await f.run(request())).status,409); assert.deepEqual(f.calls.at(-1),['remove','https://blob/new']);
});
test('upload failure leaves the database untouched', async () => {
  const f=fixture({upload:async()=>{throw Error('blob');}}); assert.equal((await f.run(request())).status,500); assert.equal(f.calls.length,0);
});

const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.join(__dirname,'..');
(async()=>{
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest')));
 assert.equal(manifest.display,'standalone');assert.equal(manifest.scope,'./');assert.equal(manifest.start_url,'./');
 for(const icon of manifest.icons){const data=fs.readFileSync(path.join(root,icon.src));assert.equal(data.subarray(1,4).toString(),'PNG');assert.equal(data.readUInt32BE(16),Number(icon.sizes.split('x')[0]));}
 const handlers={},deleted=[],scope='https://example.test/szuper-titkos-szovetseg/';let files,activated=false,networkCalls=0;
 const cache={addAll:async list=>{files=list;for(const f of list)assert.ok(fs.existsSync(path.join(root,f.split('?')[0])),f);},match:async r=>r==='offline.html'?'OFFLINE':'CACHED'};
 const context={URL,Set,Promise,caches:{open:async()=>cache,keys:async()=>['szovetseg-pwa-old','other-app'],delete:async k=>deleted.push(k)},fetch:async()=>{networkCalls++;throw Error('offline');},self:{registration:{scope},location:{origin:'https://example.test'},clients:{claim:async()=>{}},skipWaiting:()=>{activated=true;},addEventListener:(n,h)=>handlers[n]=h}};
 vm.runInNewContext(fs.readFileSync(path.join(root,'sw.js'),'utf8'),context);
 let pending;handlers.install({waitUntil:p=>pending=p});await pending;assert.ok(files.includes('offline.html'));assert.ok(!files.some(f=>f.includes('supabase')));
 handlers.activate({waitUntil:p=>pending=p});await pending;assert.deepEqual(deleted,['szovetseg-pwa-old']);
 const request=(url,mode='cors',method='GET')=>{let response;handlers.fetch({request:{url,mode,method},respondWith:p=>response=p});return response;};
 assert.equal(request('https://api.test/state'),undefined);assert.equal(request(scope+'anything-private.json'),undefined);assert.equal(request(scope+'script.js?v=1.8.0','cors','POST'),undefined);
 assert.equal(await request(scope,'navigate'),'OFFLINE');assert.equal(await request(scope+'script.js?v=1.8.0'),'CACHED');assert.equal(networkCalls,1);
 handlers.message({data:{type:'unknown'}});assert.equal(activated,false);handlers.message({data:{type:'ACTIVATE_UPDATE'}});assert.equal(activated,true);
 console.log('PASS PWA: manifest, icon dimensions, complete precache, isolated cache cleanup, no API/POST caching, offline navigation, cached assets, explicit update');
})().catch(e=>{console.error(e);throw e;});

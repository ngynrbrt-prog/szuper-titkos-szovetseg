const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
(async()=>{
 const sent=[],browser=[],window={AndroidHost:{postMessage:raw=>sent.push(JSON.parse(raw))},fetch:async(url)=>{browser.push(url);return new Response('browser')}};
 const c={window,location:{href:'https://ngynrbrt-prog.github.io/szuper-titkos-szovetseg/'},Map,Promise,URL,Headers,Response,setTimeout,clearTimeout};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../native-bridge.js'),'utf8'),c);assert.equal(window.NativeBridge.available,true);assert.equal(window.NativeBridge.platform,'android');
 const pending=window.fetch('https://lpjgrmfzteuwjgrcgxqa.supabase.co/functions/v1/game-api',{method:'POST',body:'{"action":"state"}',headers:{Authorization:'Bearer token'}});assert.equal(sent[0].type,'http');assert.equal(sent[0].data.path,'/functions/v1/game-api');assert.equal(sent[0].data.authorization,'token');window.NativeBridge.receive(sent[0].id,JSON.stringify({data:{status:200,body:'{"ok":true}'},error:null}));assert.equal((await (await pending).json()).ok,true);
 await window.fetch('https://geocoding-api.open-meteo.com/v1/search');assert.equal(browser.length,1);
 const logout=window.fetch('https://lpjgrmfzteuwjgrcgxqa.supabase.co/auth/v1/logout?scope=local',{method:'POST'});window.NativeBridge.receive(sent.at(-1).id,JSON.stringify({data:{status:204,body:''},error:null}));assert.equal((await logout).status,204);
 const fail=window.NativeBridge.request('start');window.NativeBridge.receive(sent.at(-1).id,JSON.stringify({data:null,error:'Pontos helyengedély szükséges'}));await assert.rejects(fail,/helyengedély/);
 const normal={window:{fetch:()=>{}},location:c.location};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../native-bridge.js'),'utf8'),normal);assert.equal(normal.window.NativeBridge,undefined);
 console.log('PASS: native detection, request/reply, auth forwarding, 204 response, explicit permission errors, external fetch untouched, no bridge in ordinary browser');
})().catch(e=>{console.error(e);throw e;});

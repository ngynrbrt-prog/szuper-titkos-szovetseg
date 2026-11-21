'use strict';
(() => {
 const android=typeof window.AndroidHost?.postMessage==='function',ios=!!window.webkit?.messageHandlers?.SzovetsegNative;
 if(!android&&!ios)return;
 const pending=new Map();let sequence=0;
 function request(type,data={}){return new Promise((resolve,reject)=>{const id=String(++sequence),timer=setTimeout(()=>{pending.delete(id);reject(new Error('A natív művelet nem válaszolt. Ellenőrizd a telefon engedélyeit.'));},60000);pending.set(id,{resolve,reject,timer});const raw=JSON.stringify({id,type,data});if(android)window.AndroidHost.postMessage(raw);else window.webkit.messageHandlers.SzovetsegNative.postMessage(raw);});}
 function receive(id,raw){const callback=pending.get(String(id));if(!callback)return;pending.delete(String(id));clearTimeout(callback.timer);try{const result=JSON.parse(raw);if(result.error)callback.reject(new Error(result.error));else callback.resolve(result.data);}catch(e){callback.reject(e);}}
 window.NativeBridge={available:true,platform:android?'android':'ios',request,receive};
 const original=window.fetch.bind(window),base='https://lpjgrmfzteuwjgrcgxqa.supabase.co';
 window.fetch=async(input,options={})=>{
  const url=new URL(typeof input==='string'?input:input.url,location.href);
  if(url.origin!==base)return original(input,options);
  if(!['/functions/v1/game-api','/functions/v1/player-auth','/auth/v1/token','/auth/v1/logout'].includes(url.pathname))return original(input,options);
  if((options.method||'GET').toUpperCase()!=='POST')throw new Error('A natív játék API csak POST kérést fogad.');
  const headers=new Headers(options.headers),result=await request('http',{path:url.pathname+url.search,body:options.body||'{}',authorization:(headers.get('Authorization')||'').replace(/^Bearer /i,'')});
  return new Response(result.status===204?null:result.body,{status:result.status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
 };
})();

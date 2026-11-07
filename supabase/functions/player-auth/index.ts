// No third-party runtime dependency. Server keys never leave this function.
const URL = Deno.env.get('SUPABASE_URL')!;
const KEY = Deno.env.get('GAME_SERVER_KEY') || JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}').default || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ORIGIN = 'https://ngynrbrt-prog.github.io';
function headers(req: Request) {
 return {'Content-Type':'application/json','Cache-Control':'no-store','Access-Control-Allow-Origin':ORIGIN,'Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS','Vary':'Origin'};
}
async function request(path: string, body?: unknown, method='POST') {
 const r=await fetch(URL+path,{method,headers:{apikey:KEY,...(KEY.startsWith('eyJ')?{Authorization:`Bearer ${KEY}`}:{ }),'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
 const data=await r.json();
 if(!r.ok) throw new Error(data.message || data.msg || 'Szerverhiba.');
 return data;
}
const rpc=(name: string,body: unknown)=>request('/rest/v1/rpc/'+name,body);
Deno.serve(async(req: Request)=>{
 const respond=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers:headers(req)});
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:headers(req)});
 if(req.method!=='POST')return respond({error:'Csak POST engedélyezett.'},405);
 if(req.headers.has('origin') && req.headers.get('origin')!==ORIGIN)return respond({error:'Tiltott eredet.'},403);
 try {
  const raw=await req.text(); if(raw.length>4096)return respond({error:'Túl nagy kérés.'},413);
  let b;try{b=JSON.parse(raw);}catch{return respond({error:'Érvénytelen kérés.'},400);}
  if(!b || Array.isArray(b) || !['login','register'].includes(b.action))return respond({error:'Érvénytelen művelet.'},400);
  const name=typeof b.character_name==='string'?b.character_name.normalize('NFC').trim():'';
  if(!/^[\p{L}\p{N}_ -]{3,24}$/u.test(name) || typeof b.pin!=='string' || !/^\d{6,12}$/.test(b.pin))return respond({error:'3–24 karakteres név és 6–12 számjegyes PIN szükséges.'},400);
  // Global quota cannot be bypassed by forging forwarded IP headers.
  if(!await rpc('game_rate_limit',{p_bucket:'auth-global',p_max:40,p_seconds:60}))return respond({error:'Túl sok kérés. Próbáld újra egy perc múlva.'},429);
  if(b.action==='register'){
   if(typeof b.invite!=='string' || b.invite.length>100 || !await rpc('game_invite_valid',{p_token:b.invite}))return respond({error:'Érvénytelen vagy lejárt meghívó.'},400);
   const secret=Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,'0')).join('');
   const user=await request('/auth/v1/admin/users',{email:`${crypto.randomUUID()}@players.example.invalid`,password:secret,email_confirm:true});
   try{await rpc('game_register_invited',{p_name:name,p_pin:b.pin,p_auth_user_id:user.id,p_invite:b.invite,p_avatar:b.avatar||{}});}
   catch{await request('/auth/v1/admin/users/'+user.id,undefined,'DELETE');return respond({error:'A név foglalt, a meghívó lejárt vagy betelt a hat hely.'},400);}
   return respond({success:true,message:'A karakter elkészült. Most jelentkezz be.'});
  }
  const id=await rpc('game_verify_player',{p_name:name,p_pin:b.pin});
  if(!id)return respond({error:'Hibás belépési adatok vagy 15 perces zárolás.'},401);
  const user=await request('/auth/v1/admin/users/'+id,undefined,'GET');
  const link=await request('/auth/v1/admin/generate_link',{type:'magiclink',email:user.email});
  const session=await request('/auth/v1/verify',{token_hash:link.hashed_token || link.properties?.hashed_token,type:'magiclink'});
  return respond({access_token:session.access_token,refresh_token:session.refresh_token,expires_in:session.expires_in});
 }catch(e){console.error('player-auth service error', (e as Error).message);return respond({error:'A hitelesítési szolgáltatás nem elérhető.'},503);}
});

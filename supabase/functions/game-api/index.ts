const URL = Deno.env.get('SUPABASE_URL')!;
const KEY = Deno.env.get('GAME_SERVER_KEY') || JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}').default || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ORIGIN='https://ngynrbrt-prog.github.io';
const headers={'Content-Type':'application/json','Cache-Control':'no-store','Access-Control-Allow-Origin':ORIGIN,'Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS','Vary':'Origin'};
async function rpc(name:string,body:unknown){
 const r=await fetch(URL+'/rest/v1/rpc/'+name,{method:'POST',headers:{apikey:KEY,...(KEY.startsWith('eyJ')?{Authorization:`Bearer ${KEY}`}:{ }),'Content-Type':'application/json'},body:JSON.stringify(body)});
 const data=await r.json();if(!r.ok)throw new Error(data.message || 'Sikertelen művelet.');return data;
}
Deno.serve(async(req:Request)=>{
 const respond=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers});
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
 if(req.method!=='POST')return respond({error:'Csak POST engedélyezett.'},405);
 if(req.headers.has('origin')&&req.headers.get('origin')!==ORIGIN)return respond({error:'Tiltott eredet.'},403);
 const token=req.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
 if(!token)return respond({error:'Bejelentkezés szükséges.'},401);
 try{
  const auth=await fetch(URL+'/auth/v1/user',{headers:{apikey:KEY,Authorization:'Bearer '+token}});
  if(!auth.ok)return respond({error:'Lejárt munkamenet.'},401);
  const user=await auth.json();
  // Claims are read only after Supabase has verified this exact token.
  const claim=JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));
  if(!claim.session_id)return respond({error:'Érvénytelen munkamenet.'},401);
  const raw=await req.text();if(raw.length>20000)return respond({error:'Túl nagy kérés.'},413);
  let b;try{b=JSON.parse(raw);}catch{return respond({error:'Érvénytelen kérés.'},400);}
  if(!b || typeof b.action!=='string' || Array.isArray(b))return respond({error:'Érvénytelen művelet.'},400);
  if(!await rpc('game_rate_limit',{p_bucket:'game:'+user.id,p_max:120,p_seconds:60}))return respond({error:'Túl sok kérés.'},429);
  try{return respond(await rpc('game_action',{p_auth:user.id,p_session:claim.session_id,p_action:b.action,p_data:b.data || {}}));}
  catch(e){return respond({error:(e as Error).message},400);}
 }catch{return respond({error:'A játék szolgáltatása nem elérhető.'},503);}
});

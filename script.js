'use strict';
(()=>{
 const $=id=>document.getElementById(id), cfg=window.GAME_CONFIG;
 let session=null,state=null,map=null,layer=null,draftLayer=null,watch=null,lastGPS=0,editing=false,queue=Promise.resolve(),epoch=0;
 let draft={points:[],route:[],mordor:null};
 try{session=JSON.parse(sessionStorage.getItem('fellowship-session'));draft=JSON.parse(localStorage.getItem('fellowship-draft'))||draft;}catch{}
 let messageTimer;
 function message(text,error=false){$('message').textContent=text;$('message').classList.toggle('error',error);$('message').hidden=false;clearTimeout(messageTimer);messageTimer=setTimeout(()=>$('message').hidden=true,9000);}
 function show(page){document.querySelectorAll('.page').forEach(el=>el.classList.toggle('active',el.id===page));document.querySelectorAll('[data-page]').forEach(el=>el.classList.toggle('selected',el.dataset.page===page));if(page==='map')setTimeout(()=>map?.invalidateSize(),50);}
 function saveSession(s){session=s;if(s)sessionStorage.setItem('fellowship-session',JSON.stringify(s));else sessionStorage.removeItem('fellowship-session');}
 async function http(path,body,token){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
  try{const r=await fetch(cfg.url+path,{method:'POST',headers:{apikey:cfg.key,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(body),signal:controller.signal});let b;try{b=await r.json();}catch{throw new Error('Érvénytelen szerverválasz.');}if(!r.ok){const err=new Error(b.error||b.msg||'A kérés sikertelen.');err.status=r.status;throw err;}return b;}finally{clearTimeout(timer);}
 }
 async function token(){if(!session)throw new Error('Előbb jelentkezz be.');if(session.expires_at<Date.now()+60000){try{const s=await http('/auth/v1/token?grant_type=refresh_token',{refresh_token:session.refresh_token});saveSession({...s,expires_at:Date.now()+s.expires_in*1000});}catch(e){saveSession(null);throw e;}}return session.access_token;}
 function api(action,data={}){
  const generation=epoch;
  const work=queue.catch(()=>{}).then(async()=>{if(generation!==epoch)throw new Error('A munkamenet megváltozott.');const t=await token();const b=await http('/functions/v1/game-api',{action,data},t);if(b.me&&generation===epoch){state=b;render();}return b;});queue=work;return work;
 }
 function bindButton(id,fn){$(id).addEventListener('click',async()=>{const button=$(id);button.disabled=true;try{await fn();}catch(e){message(e.message||'Kapcsolati hiba.',true);}finally{button.disabled=false;buttons();}});}
 function addButton(parent,label,fn){const b=document.createElement('button');b.textContent=label;b.type='button';b.addEventListener('click',async()=>{b.disabled=true;try{await fn();}catch(e){message(e.message,true);}finally{b.disabled=false;}});parent.append(b);return b;}
 function text(parent,tag,content,className){const e=document.createElement(tag);e.textContent=content;if(className)e.className=className;parent.append(e);return e;}
 function empty(id){const e=$(id);e.replaceChildren();return e;}
 const name=id=>state?.players.find(p=>p.id===id)?.character_name||'Ismeretlen vándor';
 const fmt=n=>Number(n||0).toLocaleString('hu-HU');
 const stamp=t=>new Date(t).toLocaleString('hu-HU');
 function itemCard(parent,it){const el=document.createElement('div');el.className='item';text(el,'strong',(it.item_type==='ring'?'💍 ':'💎 ')+it.item_name);text(el,'p',it.item_type==='gem'?fmt(it.value_sestertius)+' sestertius':it.item_description||'Különleges gyűrű');parent.append(el);return el;}
 function buttons(){const active=!!session&&state?.game?.status==='active';$('gps').disabled=!active||watch!==null;$('stopGps').disabled=watch===null;$('startGame').disabled=state?.game?.status!=='preparation';$('finishGame').disabled=!['preparation','active'].includes(state?.game?.status);}
 function render(){
  const s=state,g=s?.game;if(!s)return;
  $('identity').textContent=s.me.character_name;$('logout').hidden=false;$('adminNav').hidden=!s.me.is_admin;$('adminTools').hidden=!s.me.is_admin;$('adminLocked').hidden=s.me.is_admin;
  $('phase').textContent=g?({preparation:'Előkészület',active:'A vadászat tart',finished:'Lezárt krónika'}[g.status]):'Még nincs játék';
  $('connection').textContent='Közös állapot · '+new Date(s.server_time).toLocaleTimeString('hu-HU');$('cityTitle').textContent=g?g.city_name:'Közös kaland, hat vándor';
  $('ringCount').textContent=g?`${s.items.filter(i=>i.item_type==='ring'&&i.status==='ground').length} szabad gyűrű · ${s.items.filter(i=>i.item_type==='gem'&&i.status==='ground').length} drágakő`:'6 gyűrű · 40 drágakő';
  const ground=empty('groundItems');s.items.filter(i=>i.status==='ground').forEach(it=>addButton(itemCard(ground,it),'Felveszem · 50 m',()=>api('pickup',{item:it.id})));
  const bag=empty('inventory');s.items.filter(i=>i.owner_id===s.me.id&&i.status==='owned').forEach(it=>{const c=itemCard(bag,it);if(it.item_type==='ring')addButton(c,'Megsemmisítés Mordornál',async()=>{if(confirm('Végleg megsemmisíted ezt a gyűrűt?'))await api('destroy',{item:it.id});});});
  const recover=empty('recoverItems');s.items.filter(i=>s.recoverable.includes(i.id)).forEach(it=>addButton(itemCard(recover,it),'Visszaszerzem · 1 km',()=>api('recover',{item:it.id})));
  const players=empty('playerList');for(const p of s.players){const card=document.createElement('div');card.className='card';text(card,'h3',p.character_name+(p.id===s.me.id?' · Te':''));text(card,'p',(p.avatar?.race||'Vándor')+' · '+(p.avatar?.weapon||''),'muted');text(card,'p',s.locations.some(l=>l.player_id===p.id)?'● Helye megosztva':'○ Helye nem látható','muted');const items=s.items.filter(i=>i.owner_id===p.id&&i.status==='owned');text(card,'p',`${items.filter(i=>i.item_type==='ring').length} gyűrű · ${items.filter(i=>i.item_type==='gem').length} drágakő`);if(p.id!==s.me.id)for(const it of items)addButton(card,'Elrablom: '+it.item_name,()=>api('rob',{item:it.id}));players.append(card);}
  const scores=empty('scores');[...s.results].sort((a,b)=>b.sestertius_earned-a.sestertius_earned||b.rings_destroyed-a.rings_destroyed||b.ring_seconds-a.ring_seconds).forEach(r=>{const tr=document.createElement('tr');[name(r.player_id),fmt(r.sestertius_earned),r.gems_collected,r.successful_robberies,r.rings_destroyed,(r.ring_seconds/60).toFixed(1)].forEach(v=>text(tr,'td',v));scores.append(tr);});
  const archive=empty('archive');for(const a of s.archive)text(archive,'div',a.city_name+' · '+stamp(a.finished_at)+' · Győztes: '+name(a.winner_id),'event');
  const events=empty('events');const labels={pickup:'felvett egy tárgyat',rob:'elrabolt egy tárgyat',destroy:'megsemmisített egy gyűrűt',recover:'visszaszerzett egy gyűrűt',sauron:'elvesztett egy gyűrűt Sauronnal szemben'};for(const e of s.events)text(events,'div',stamp(e.created_at)+' · '+name(e.player_id)+' '+(labels[e.event_type]||e.event_type),'event');
  $('adminGame').textContent=g?`${g.city_name} · ${$('phase').textContent} · ${s.items.length} tárgy`:'Nincs játék. Jelöld ki az első kaland helyszíneit.';
  $('sauronInfo').textContent=!g?'Sauron a történet kezdetére vár.':g.status!=='active'?'Sauron jelenleg nem támad.':!s.sauron?'Sauron rejtve marad, és nem támad.':Date.now()-new Date(g.started_at).getTime()<1800000?'Sauron felkészül. Az első 30 percben nem támad.':'Sauron a kijelölt gyalogosútvonalon járőrözik. Kapcsold be a helymegosztást a közös játékhoz.';
  buttons();renderMap();
 }
 function marker(lat,lng,symbol,label,callback){if(!map)return;const icon=L.divIcon({className:'map-icon',html:symbol,iconSize:[32,32],iconAnchor:[16,16]});const m=L.marker([lat,lng],{icon}).addTo(layer);const box=document.createElement('div');text(box,'strong',label);if(callback)addButton(box,'Felveszem · 50 m',callback);m.bindPopup(box);}
 function renderMap(){if(!map)return;layer.clearLayers();if(!state?.game)return;const s=state,g=s.game;
  if(g.config?.route?.length)L.polyline(g.config.route,{color:'#b092dc',weight:3,dashArray:'5 7'}).addTo(layer);
  marker(g.mordor_lat,g.mordor_lng,'🌋','Mordor · Gyűrűmegsemmisítés');
  for(const it of s.items.filter(i=>i.status==='ground'))marker(it.latitude,it.longitude,it.item_type==='ring'?'💍':'💎',it.item_name,()=>api('pickup',{item:it.id}));
  for(const loc of s.locations)marker(loc.latitude,loc.longitude,loc.player_id===s.me.id?'🧙':'⚔️',name(loc.player_id));
  if(s.sauron)marker(s.sauron[0],s.sauron[1],'👁️','Sauron');
 }
 function renderDraft(){
  const summary=`${draft.points.length} tárgyhelyszín · ${draft.route.length} útvonalpont · Mordor: ${draft.mordor?'kijelölve':'hiányzik'}`;$('draftSummary').textContent=summary;$('editSummary').textContent=summary;localStorage.setItem('fellowship-draft',JSON.stringify(draft));
  if(!draftLayer)return;draftLayer.clearLayers();if(!editing)return;
  draft.points.forEach((p,i)=>L.circleMarker(p,{color:'#e4c879',radius:9}).bindTooltip('Helyszín '+(i+1)).addTo(draftLayer));
  if(draft.mordor)L.circleMarker(draft.mordor,{color:'#e68872',radius:12}).bindTooltip('Mordor').addTo(draftLayer);
  if(draft.route.length)L.polyline(draft.route,{color:'#bf9df2',weight:5}).addTo(draftLayer);
  draft.route.forEach((p,i)=>L.circleMarker(p,{color:'#bf9df2',radius:5}).bindTooltip('Útvonal '+(i+1)).addTo(draftLayer));
 }
 async function stopGPS(){if(watch!==null)navigator.geolocation.clearWatch(watch);watch=null;lastGPS=0;$('gpsStatus').textContent='Helymegosztás kikapcsolva.';buttons();if(session)await api('stop');}
 function beginGPS(){if(!navigator.geolocation)throw new Error('Ez a böngésző nem támogatja a helymeghatározást.');if(document.hidden)throw new Error('Nyisd meg a játék lapját.');watch=navigator.geolocation.watchPosition(p=>{
  const c=p.coords;$('gpsStatus').textContent='GPS-pontosság: '+Math.round(c.accuracy)+' m · A helyed a Szövetség számára látható.';
  if(c.accuracy>50){$('gpsStatus').textContent='A GPS még pontatlan: '+Math.round(c.accuracy)+' m. Várj pontosabb mérésre.';return;}
  if(Date.now()-lastGPS<10000 || document.hidden)return;lastGPS=Date.now();api('location',{lat:c.latitude,lng:c.longitude,accuracy:c.accuracy}).catch(e=>{message(e.message,true);$('gpsStatus').textContent='A helyzetet nem sikerült megosztani: '+e.message;});
 },e=>{stopGPS().catch(()=>{});message(e.code===1?'A helymeghatározás engedélye szükséges.':'Nem érkezett GPS-jel. Próbáld újra szabad ég alatt.',true);},{enableHighAccuracy:true,maximumAge:0,timeout:20000});buttons();}
 document.querySelectorAll('[data-page]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.page)));
 for(const action of ['login','register'])$(action+'Form').addEventListener('submit',async e=>{e.preventDefault();const form=e.currentTarget,button=form.querySelector('button'),b=Object.fromEntries(new FormData(form));button.disabled=true;try{const response=await http('/functions/v1/player-auth',{action,character_name:b.character_name,pin:b.pin,invite:b.invite,avatar:{race:b.race,weapon:b.weapon}});form.elements.pin.value='';if(action==='register'){message(response.message);$('loginForm').elements.character_name.value=b.character_name;form.reset();}else{epoch++;saveSession({...response,expires_at:Date.now()+response.expires_in*1000});await api('state');show('map');fit();}}catch(err){message(err.message||'Kapcsolati hiba.',true);}finally{button.disabled=false;}});
 bindButton('gps',beginGPS);bindButton('stopGps',stopGPS);
 bindButton('logout',async()=>{await stopGPS().catch(()=>{});const t=await token();await http('/auth/v1/logout',{scope:'local'},t);epoch++;saveSession(null);state=null;$('identity').textContent='Vár a Szövetség';$('logout').hidden=true;$('adminNav').hidden=true;$('adminTools').hidden=true;$('adminLocked').hidden=false;['groundItems','inventory','recoverItems','playerList','scores','archive','events'].forEach(empty);layer?.clearLayers();$('connection').textContent='Kijelentkezve';show('auth');message('Kijelentkeztél.');});
 bindButton('invite',async()=>{$('inviteValue').textContent=(await api('invite')).invite;});
 bindButton('startGame',async()=>{await api('start');message('A közös kaland elindult.');});
 bindButton('finishGame',async()=>{if(confirm('Lezárod a játékot? Az eredmények megmaradnak.')){await api('finish');await stopGPS().catch(()=>{});message('A játék lezárult.');}});
 function fit(){if(!map)return;if(state?.game)map.setView([state.game.city_lat,state.game.city_lng],15);else map.setView([50.0875,14.4213],14);}
 bindButton('fit',fit);
 bindButton('editMap',()=>{if(!map)throw new Error('A térkép nem töltődött be.');editing=true;$('mapEditor').hidden=false;show('map');const f=$('createForm').elements;map.setView([Number(f.lat.value),Number(f.lng.value)],15);renderDraft();});
 bindButton('undoPoint',()=>{const mode=$('editMode').value;if(mode==='mordor')draft.mordor=null;else draft[mode].pop();renderDraft();});
 bindButton('closeEditor',()=>{editing=false;$('mapEditor').hidden=true;renderDraft();show('admin');});
 $('createForm').addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget,button=f.querySelector('button.primary');button.disabled=true;try{const b=Object.fromEntries(new FormData(f));await api('create',{city:b.city,lat:Number(b.lat),lng:Number(b.lng),...draft,safe:f.elements.safe.checked});message('A játék előkészítve. Indítás előtt ellenőrizd a térképet.');fit();}catch(err){message(err.message,true);}finally{button.disabled=false;}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){const t=session?.access_token;if(t)fetch(cfg.url+'/functions/v1/game-api',{method:'POST',headers:{apikey:cfg.key,'Content-Type':'application/json',Authorization:'Bearer '+t},body:JSON.stringify({action:'stop'}),keepalive:true}).catch(()=>{});stopGPS().catch(()=>{});}});
 window.addEventListener('offline',()=>{$('connection').textContent='Nincs internetkapcsolat';stopGPS().catch(()=>{});});
 window.addEventListener('pagehide',()=>{if(session)fetch(cfg.url+'/functions/v1/game-api',{method:'POST',headers:{apikey:cfg.key,'Content-Type':'application/json',Authorization:'Bearer '+session.access_token},body:JSON.stringify({action:'stop'}),keepalive:true}).catch(()=>{});});
 async function poll(){if(session&&!document.hidden)try{await api('state');}catch(e){$('connection').textContent='Kapcsolat megszakadt · '+e.message;}setTimeout(poll,10000);}
 if(window.L){map=L.map('mapCanvas').setView([50.0875,14.4213],14);L.tileLayer(cfg.tiles,{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map).on('tileerror',()=>{ $('gpsStatus').textContent='A térképháttér nem elérhető. A tárgyak listája és a játék továbbra is használható.'; });layer=L.layerGroup().addTo(map);draftLayer=L.layerGroup().addTo(map);map.on('click',e=>{if(!editing||!state?.me.is_admin)return;const point=[Number(e.latlng.lat.toFixed(6)),Number(e.latlng.lng.toFixed(6))],mode=$('editMode').value;if(mode==='mordor')draft.mordor=point;else if(draft[mode].length<100)draft[mode].push(point);renderDraft();});}else message('A térképet nem sikerült betölteni. A listás játékfelület továbbra is használható.',true);
 renderDraft();buttons();if(!session)show('auth');poll();
})();

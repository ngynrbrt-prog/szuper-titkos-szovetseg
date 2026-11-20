'use strict';
(()=>{
 if(location.protocol==='file:'){location.replace('https://ngynrbrt-prog.github.io/szuper-titkos-szovetseg/?v=1.3.0');return;}
 const $=id=>document.getElementById(id), cfg=window.GAME_CONFIG;
 let session=null,state=null,map=null,layer=null,draftLayer=null,watch=null,lastGPS=0,heartbeat=null,editing=false,queue=Promise.resolve(),epoch=0;
 let sauronMarker=null,lastSauronKey=null,lastMapGame=null;
 let placementContext="draft",pendingPlacement=null,randomPlacement=false;
 let draft={points:[],route:[],mordor:null};
 try{session=JSON.parse(sessionStorage.getItem('fellowship-session'));draft=JSON.parse(localStorage.getItem('fellowship-draft'))||draft;}catch{}
 draft=window.PlacementModel.normalizeDraft(draft);
 let messageTimer,lastProfileRace;
 function message(text,error=false){$('message').textContent=text;$('message').classList.toggle('error',error);$('message').hidden=false;clearTimeout(messageTimer);messageTimer=setTimeout(()=>$('message').hidden=true,9000);}
 function show(page){if((page==='admin'&&!state?.me.is_admin)||(page==='settings'&&!state?.me))page='auth';document.querySelectorAll('.page').forEach(el=>el.classList.toggle('active',el.id===page));document.querySelectorAll('[data-page]').forEach(el=>el.classList.toggle('selected',el.dataset.page===page));if(page==='map')setTimeout(()=>map?.invalidateSize(),50);}
 function saveSession(s){session=s;if(s)sessionStorage.setItem('fellowship-session',JSON.stringify(s));else sessionStorage.removeItem('fellowship-session');}
 async function http(path,body,token){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
  try{const r=await fetch(cfg.url+path,{method:'POST',headers:{apikey:cfg.key,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(body),signal:controller.signal});if(r.status===204)return {};let b;try{b=await r.json();}catch{throw new Error('Érvénytelen szerverválasz.');}if(!r.ok){const err=new Error(b.error||b.msg||'A kérés sikertelen.');err.status=r.status;throw err;}return b;}finally{clearTimeout(timer);}
 }
 async function token(){if(!session)throw new Error('Előbb jelentkezz be.');if(session.expires_at<Date.now()+60000){try{const s=await http('/auth/v1/token?grant_type=refresh_token',{refresh_token:session.refresh_token});saveSession({...s,expires_at:Date.now()+s.expires_in*1000});}catch(e){epoch++;state=null;saveSession(null);accountView();throw e;}}return session.access_token;}
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
 function buttons(){const active=!!session&&state?.game?.status==='active';$('gps').disabled=!active||watch!==null;$('stopGps').disabled=watch===null;$('startGame').disabled=state?.game?.status!=='preparation';$('finishGame').disabled=!['preparation','active'].includes(state?.game?.status);$('editRings').disabled=!state?.me.is_admin||!['preparation','active'].includes(state?.game?.status)||!state.items.some(i=>i.item_type==='ring'&&i.status==='ground');$('saveRingPosition').disabled=!pendingPlacement||!$('placementSafe').checked||selectedLiveRing()?.status!=='ground';}

 let appearancePlayer=null;
 function accountView(){
  const me=session?state?.me:null,a=window.Appearance.account(me);
  $('identity').textContent=a.label;$('logout').hidden=!a.loggedIn;
  document.querySelectorAll('[data-page="auth"]').forEach(el=>el.hidden=a.loggedIn);
  $('settingsNav').hidden=!a.loggedIn;$('adminNav').hidden=!a.admin;
  $('adminTools').hidden=!a.admin;$('adminLocked').hidden=a.admin;
  $('discoveryCard').hidden=a.loggedIn;
  if(!a.admin&&editing){editing=false;pendingPlacement=null;randomPlacement=false;$('mapEditor').hidden=true;document.body.classList.remove('map-editing');draftLayer?.clearLayers();}
  if((!a.admin&&$('admin').classList.contains('active'))||(!a.loggedIn&&$('settings').classList.contains('active')))show('map');
  if(appearancePlayer!==(me?.id||null)){appearancePlayer=me?.id||null;const theme=window.Appearance.apply(me?window.Appearance.read(me.id):'light');$('themeChoice').value=theme;}
 }
 function render(){
  const s=state,g=s?.game;accountView();if(!s){renderMap();return;}
  $('characterForm').hidden=false;
  if(lastProfileRace!==s.me.avatar?.race){lastProfileRace=s.me.avatar?.race;$('characterForm').elements.race.value=lastProfileRace||'Ember';}
  accountView();
  $('phase').textContent=g?({preparation:'Előkészület',active:'A vadászat tart',finished:'Lezárt krónika'}[g.status]):'Még nincs játék';
  $('connection').textContent='Közös állapot · '+new Date(s.server_time).toLocaleTimeString('hu-HU');$('cityTitle').textContent=g?g.city_name:'A kaland itt kezdődik.';
  $('ringCount').textContent=g?`${s.items.filter(i=>i.item_type==='ring'&&i.status==='ground').length} szabad gyűrű · ${s.items.filter(i=>i.item_type==='gem'&&i.status==='ground').length} drágakő`:'6 gyűrű · 40 drágakő';
  empty('groundItems');
  const bag=empty('inventory');
  const owned=s.items.filter(item=>item.owner_id===s.me.id&&item.status==='owned');
  const rings=owned.filter(item=>item.item_type==='ring');
  owned.forEach(item=>{
   const card=itemCard(bag,item);
   if(item.item_type!=='ring'||g?.status!=='active')return;
   addButton(card,'Megsemmisítés Mordornál',async()=>{
    if(confirm('Megsemmisíted ezt a gyűrűt és lezárod a kört?'))await api('destroy',{item:item.id});
   });
   if(rings.length>1&&item.id===rings[0].id)addButton(card,'Összes gyűrű megsemmisítése',async()=>{
    if(confirm('Megsemmisíted az összes saját gyűrűdet és lezárod a kört?'))await api('destroy_all');
   });
  });
  const recover=empty('recoverItems');s.items.filter(i=>s.recoverable.includes(i.id)).forEach(it=>addButton(itemCard(recover,it),'Visszaszerzem · 1 km',()=>api('recover',{item:it.id})));
  const players=empty('playerList');for(const p of s.players){const card=document.createElement('div');card.className='card';text(card,'h3',p.character_name+(p.id===s.me.id?' · Te':''));text(card,'p',(p.avatar?.race||'Vándor')+' · '+(p.avatar?.weapon||''),'muted');text(card,'p',s.locations.some(l=>l.player_id===p.id)?'● Helye megosztva':'○ Helye nem látható','muted');const items=s.items.filter(i=>i.owner_id===p.id&&i.status==='owned');text(card,'p',`${items.filter(i=>i.item_type==='ring').length} gyűrű · ${items.filter(i=>i.item_type==='gem').length} drágakő`);if(p.id!==s.me.id)for(const it of items)addButton(card,'Elrablom: '+it.item_name,()=>api('rob',{item:it.id}));players.append(card);}
  const scores=empty('scores');[...s.results].sort((a,b)=>b.sestertius_earned-a.sestertius_earned||b.rings_destroyed-a.rings_destroyed||b.ring_seconds-a.ring_seconds).forEach(r=>{const tr=document.createElement('tr');[name(r.player_id),fmt(r.sestertius_earned),r.gems_collected,r.successful_robberies,r.rings_destroyed,(r.ring_seconds/60).toFixed(1)].forEach(v=>text(tr,'td',v));scores.append(tr);});
  const archive=empty('archive');for(const a of s.archive)text(archive,'div',a.city_name+' · '+stamp(a.finished_at)+' · Győztes: '+(a.reason==='sauron'?'Sauron':name(a.winner_id)),'event');
  const events=empty('events');const labels={pickup:'felvett egy tárgyat',rob:'elrabolt egy tárgyat',destroy:'megsemmisített egy gyűrűt',destroy_all:'megsemmisítette az összes saját gyűrűjét',recover:'visszaszerzett egy gyűrűt',sauron:'elvesztett egy gyűrűt Sauronnal szemben',place_ring:'módosította egy gyűrű helyét'};for(const e of s.events)text(events,'div',stamp(e.created_at)+' · '+name(e.player_id)+' '+(labels[e.event_type]||e.event_type),'event');
  $('adminGame').textContent=g?`${g.city_name} · ${$('phase').textContent} · ${s.items.length} tárgy`:'Nincs játék. Jelöld ki az első kaland helyszíneit.';
  updateRoundClock();
  showRoundResults(s);
  if(g?.status==='finished'&&watch!==null)void stopGPS().catch(()=>{});
  buttons();renderMap();renderRingSummary();if(editing)renderDraft();
 }
 function updateRoundClock(){
  const game=state?.game, clock=$('roundClock');
  clock.hidden=!game?.started_at;
  if(clock.hidden)return;
  const end=game.finished_at?Date.parse(game.finished_at):Date.now();
  const seconds=Math.floor(Math.max(0,end-Date.parse(game.started_at))/1000);
  clock.textContent='Játékidő · '+Math.floor(seconds/60)+' perc '+String(seconds%60).padStart(2,'0')+' mp';
 }
 function showRoundResults(s){
  const round=s.last_round;
  if(!round||sessionStorage.getItem('seen-round:'+s.me.id)===round.id)return;
  const dialog=$('roundDialog');
  $('roundWinner').textContent='Győztes: '+(round.reason==='sauron'?'Sauron':round.winner_id?name(round.winner_id):'nincs kijelölt győztes');
  const results=empty('roundResults');
  for(const result of round.results){
   const row=document.createElement('div');
   row.className='round-result';
   text(row,'strong',name(result.player_id));
   text(row,'p',fmt(result.sestertius_earned)+' sestertius · '+result.gems_collected+' drágakő gyűjtve · '+result.rings_held+' gyűrű a kör végén · '+result.rings_destroyed+' megsemmisítve · '+result.successful_robberies+' rablás');
   results.append(row);
  }
  if(!dialog.open)dialog.showModal();
  sessionStorage.setItem('seen-round:'+s.me.id,round.id);
 }
 setInterval(updateRoundClock,1000);
 function marker(lat,lng,symbol,label,callback,options={}){if(!map)return;const icon=L.divIcon({className:'map-icon',html:symbol,iconSize:[32,32],iconAnchor:[16,16]});const m=L.marker([lat,lng],{icon,...options}).addTo(layer);const box=document.createElement('div');text(box,'strong',label);if(callback)addButton(box,'Felveszem · 50 m',callback);m.bindPopup(box);}
 function ringSearchCenter(item){
  let hash=0;
  for(const character of item.id)hash=(Math.imul(hash,31)+character.charCodeAt(0))>>>0;
  const angle=(hash%360)*Math.PI/180;
  const lat=item.latitude+Math.cos(angle)*25/111320;
  const lng=item.longitude+Math.sin(angle)*25/(111320*Math.max(0.01,Math.cos(item.latitude*Math.PI/180)));
  return [Math.max(-90,Math.min(90,lat)),((lng+540)%360)-180];
 }
 function currentSauron(){return window.SauronMap.sauronView(state);}
 function updateSauron(){
  if(!map)return;
  const view=currentSauron();
  $('sauronTitle').textContent=view.title;$('sauronCity').textContent=view.city;
  $('sauronInfo').textContent=view.detail+(view.nextChange?' Következő észlelés: '+new Date(view.nextChange).toLocaleTimeString('hu-HU',{hour:'2-digit',minute:'2-digit'})+'.':'');
  $('sauronMode').textContent=view.mode==='rumor'?'Bizonytalan hír':view.visible?'Látható':'Rejtve';
  $('focusSauron').disabled=!view.visible;
  $('focusSauron').textContent=view.visible?'Sauron mutatása':'Sauron most rejtve van';
  $('joinCTA').hidden=!!session;document.querySelectorAll('.header-join').forEach(el=>el.hidden=!!session);
  if(!state?.game)$('phase').textContent='Előkészület';
  if(!view.visible){if(sauronMarker)map.removeLayer(sauronMarker);sauronMarker=null;lastSauronKey=view.key;return;}
  if(!sauronMarker){
   const icon=L.divIcon({className:'sauron-marker',html:'<img src="assets/sauron-helmet.svg" alt="Sauron fekete sisakja" width="52" height="68">',iconSize:[52,68],iconAnchor:[26,64],tooltipAnchor:[0,-65],popupAnchor:[0,-60]});
   sauronMarker=L.marker(view.position,{icon,zIndexOffset:10000,keyboard:true,alt:'Sauron fekete sisakja',title:'Sauron'}).addTo(map);
   sauronMarker.bindTooltip('Sauron',{permanent:true,direction:'top',className:'sauron-tooltip',offset:[0,0]});
  }
  sauronMarker.setLatLng(view.position);
  const box=document.createElement('div');text(box,'strong',view.label);text(box,'p',view.detail);sauronMarker.bindPopup(box);
  if(!editing&&(lastSauronKey===null||(view.mode==='rumor'&&lastSauronKey!==view.key)))map.setView(view.position,3);
  lastSauronKey=view.key;
 }
 function renderMap(){
  if(!map)return;layer.clearLayers();const s=state,g=s?.game;
  if(g&&!editing){
   if(g.config?.route?.length)L.polyline(g.config.route,{color:'#aa8136',weight:3,dashArray:'5 7'}).addTo(layer);
   marker(g.mordor_lat,g.mordor_lng,'🌋','Mordor · Gyűrűmegsemmisítés');
   const hasRing=s.items.some(item=>item.item_type==='ring'&&item.status==='owned'&&item.owner_id===s.me.id);
   const preciseRings=hasRing&&g.status==='active'&&watch!==null&&s.locations.some(location=>location.player_id===s.me.id&&Date.now()-Date.parse(location.updated_at)<30000);
   for(const item of s.items.filter(item=>item.status==='ground')){
    const pickup=()=>api('pickup',{item:item.id});
    if(item.item_type!=='ring'||preciseRings){
     marker(item.latitude,item.longitude,item.item_type==='ring'?'💍':'💎',item.item_name,pickup,item.item_type==='ring'?{zIndexOffset:1000}:{});
     continue;
    }
    const [lat,lng]=ringSearchCenter(item);
    L.circle([lat,lng],{radius:50,color:'#88662b',fillColor:'#e5bd5f',fillOpacity:.28,weight:2,interactive:false}).addTo(layer);
    marker(lat,lng,'<span class="ring-search-icon" aria-hidden="true"></span>',item.item_name+' · keresési terület',pickup,{zIndexOffset:1000,title:'Gyűrű keresési területe'});
   }
   for(const person of window.SauronMap.sharedCharacters(s)){
    const symbol='<span class="player-map-icon'+(person.own?' player-map-own':'')+'">'+person.icon+'</span>';
    const label=person.label+(person.own?' · Te':'');
    marker(person.latitude,person.longitude,symbol,label,null,{title:label,zIndexOffset:person.own?2200:2100});
   }
  }
  updateSauron();
  const gameViewKey=g?g.id+':'+g.status:null;
  if(gameViewKey!==lastMapGame){lastMapGame=gameViewKey;if(g&&g.status!=='preparation')fit();}
 }
 function selectedLiveRing(){const id=$('editMode').value.replace('live:','');return state?.items.find(i=>i.id===id&&i.item_type==='ring');}
 function formatPoint(p){return p?p[0].toFixed(6)+', '+p[1].toFixed(6):'Még nincs kijelölve';}
 function renderRingSummary(){
  const parent=empty('liveRingSummary');
  for(const it of state?.items.filter(i=>i.item_type==='ring')||[]){
   const row=document.createElement('div');row.className='ring-summary-row';text(row,'strong',it.item_name);text(row,'span',formatPoint([it.latitude,it.longitude])+' · '+({ground:'A térképen',owned:'Játékosnál',destroyed:'Megsemmisítve',sauron:'Sauronnál'}[it.status]||it.status),'muted');
   if(it.status==='ground'&&['preparation','active'].includes(state?.game?.status))addButton(row,'Hely kiválasztása',()=>openPlacementEditor('live',it.id));parent.append(row);
  }
 }
 function renderDraft(){
  draft=window.PlacementModel.normalizeDraft(draft);
  const count=draft.points.slice(0,6).filter(Boolean).length;
  const summary=count+'/6 gyűrű elhelyezve · '+Math.max(0,draft.points.length-6)+' további drágakőhely ('+draft.gem_count+' drágakő) · '+draft.route.length+' útvonalpont · Mordor: '+(draft.mordor?'kijelölve':'hiányzik');
  $('draftSummary').textContent=summary;
  const list=empty('draftRingList');window.PlacementModel.ringNames.forEach((name,index)=>{const row=document.createElement('div');row.className='ring-summary-row';text(row,'strong',(index+1)+'. '+name);text(row,'span',formatPoint(draft.points[index]),'muted');addButton(row,'Hely kiválasztása',()=>openPlacementEditor('draft','ring:'+index));list.append(row);});
  localStorage.setItem('fellowship-draft',JSON.stringify(draft));
  if(!draftLayer)return;draftLayer.clearLayers();if(!editing)return;
  $('editSummary').textContent=placementContext==='live'?'A jelenlegi játék gyűrűit szerkeszted. A változás csak mentéskor lép életbe.':summary;
  const mode=$('editMode').value,it=placementContext==='live'?selectedLiveRing():null;
  const selected=placementContext==='live'?(pendingPlacement||(it?[it.latitude,it.longitude]:null)):/^ring:/.test(mode)?draft.points[Number(mode.split(':')[1])]:mode==='mordor'?draft.mordor:null;
  $('selectedPlacement').textContent=(placementContext==='live'?(pendingPlacement?'Új hely, még nincs mentve: ':'Jelenlegi hely: '):'A tervben mentett hely: ')+formatPoint(selected);
  if(selected&&!['placementLat','placementLng'].includes(document.activeElement?.id)){$('placementLat').value=selected[0];$('placementLng').value=selected[1];}
  if(placementContext==='live'){
   (state?.items.filter(i=>i.item_type==='ring'&&i.status==='ground')||[]).forEach(r=>{const idx=window.PlacementModel.ringNames.indexOf(r.item_name);ringPin(r.id===it?.id&&pendingPlacement?pendingPlacement:[r.latitude,r.longitude],idx,r.item_name,r.id===it?.id,point=>acceptPoint(point));});
  }else{
   draft.points.slice(0,6).forEach((point,index)=>{if(point)ringPin(point,index,window.PlacementModel.ringNames[index],true,p=>{$('editMode').value='ring:'+index;acceptPoint(p);});});
   draft.points.slice(6).forEach((p,i)=>{if(p)draftPin(p,'💎','Drágakőhely '+(i+1),point=>draft.points[i+6]=point);});
   if(draft.mordor)draftPin(draft.mordor,'🌋','Mordor',point=>draft.mordor=point);
   if(draft.route.length)L.polyline(draft.route,{color:'#6875a2',weight:4,interactive:false}).addTo(draftLayer);
   draft.route.forEach((p,i)=>draftPin(p,'●','Útvonal '+(i+1),point=>draft.route[i]=point));
   [...$('editMode').options].forEach(option=>{if(option.value.startsWith('ring:')){const index=Number(option.value.split(':')[1]);option.textContent=(draft.points[index]?'✓ ':'○ ')+(index+1)+'. '+window.PlacementModel.ringNames[index];}});
  }
  buttons();
 }
 function ringPin(point,index,name,draggable,onMove){
  const pin=L.marker(point,{draggable,interactive:draggable,zIndexOffset:2000,icon:L.divIcon({className:'ring-placement-pin',html:'<span>💍<b>'+(index+1)+'</b></span>',iconSize:[38,46],iconAnchor:[19,42]})}).addTo(draftLayer);
  pin.bindTooltip((index+1)+'. '+name,{direction:'top',offset:[0,-35]});if(draggable)pin.on('dragend',()=>{const p=pin.getLatLng();try{onMove([Number(p.lat.toFixed(6)),Number(p.lng.toFixed(6))]);}catch(e){message(e.message,true);renderDraft();}});
 }
 function draftPin(point,symbol,label,assign){
  const pin=L.marker(point,{draggable:true,icon:L.divIcon({className:'draft-point-pin',html:'<span>'+symbol+'</span>',iconSize:[28,28],iconAnchor:[14,14]})}).addTo(draftLayer);pin.bindTooltip(label);
  pin.on('dragend',()=>{const p=pin.getLatLng(),point=[Number(p.lat.toFixed(6)),Number(p.lng.toFixed(6))],f=$('createForm').elements;if(map.distance(point,[Number(f.lat.value),Number(f.lng.value)])>10000){message('A helyszín maradjon a város 10 km-es körzetében.',true);}else{assign(point);f.safe.checked=false;}renderDraft();});
 }
 function acceptPoint(point){
  if(!window.PlacementModel.validPoint(point))throw new Error('Érvényes koordináták szükségesek.');
  const f=$('createForm').elements,center=placementContext==='live'?[state.game.city_lat,state.game.city_lng]:[Number(f.lat.value),Number(f.lng.value)];
  if(map.distance(point,center)>10000)throw new Error('Válassz helyet a városközpont 10 km-es körzetében.');
  if(placementContext==='live'){if(selectedLiveRing()?.status!=='ground')throw new Error('Ezt a gyűrűt már felvették.');pendingPlacement=point;}
  else if(randomPlacement){
   const radius=Number($('randomRadius').value);
   if(!Number.isFinite(radius)||radius<100||radius>5000)throw new Error('A sugár 100 és 5000 méter között legyen.');
   if(map.distance(point,center)+radius>9999)throw new Error('A teljes véletlen kör maradjon a városközpont 10 km-es körzetében.');
   if((draft.points.some(Boolean)||draft.route.length||draft.mordor)&&!confirm('A véletlen elhelyezés lecseréli a jelenlegi pályatervet. Folytatod?'))return;
   draft=window.PlacementModel.randomDraft(point,radius);$('createForm').elements.safe.checked=false;setRandomPlacement(false);message('Elkészült a terv: 6 gyűrű, 20 drágakő, Mordor és Sauron útvonala. Ellenőrizd a helyeket és az útszakaszokat.');
  }else {draft=window.PlacementModel.assignPoint(draft,$('editMode').value,point);$('createForm').elements.safe.checked=false;}
  renderDraft();
 }
 function openPlacementEditor(context,selection){
  if(context==='draft')validateCity();setRandomPlacement(false);$('randomPlacementControls').hidden=context!=='draft';
  if(!map)throw new Error('A térkép nem töltődött be.');if(!state?.me.is_admin)throw new Error('Adminjog szükséges.');
  placementContext=context;pendingPlacement=null;$('placementLat').value='';$('placementLng').value='';editing=true;document.body.classList.add('map-editing');$('mapEditor').hidden=false;$('placementSafe').checked=false;$('livePlacementControls').hidden=context!=='live';
  $('editorTitle').textContent=context==='live'?'Gyűrű áthelyezése a jelenlegi játékban':'Az új játék gyűrűinek elhelyezése';$('editMode').replaceChildren();
  const option=(value,label,disabled=false)=>{const o=document.createElement('option');o.value=value;o.textContent=label;o.disabled=disabled;$('editMode').append(o);};
  if(context==='live'){
   const rings=state.items.filter(i=>i.item_type==='ring');rings.forEach(it=>option('live:'+it.id,it.item_name+(it.status==='ground'?'':' · már nincs a földön'),it.status!=='ground'));
   $('editMode').value='live:'+(selection||rings.find(i=>i.status==='ground')?.id);
  }else{window.PlacementModel.ringNames.forEach((name,i)=>option('ring:'+i,(i+1)+'. '+name));option('points','További drágakőhelyszín');option('mordor','Mordor helye');option('route','Sauron útvonalpontja');$('editMode').value=selection||'ring:'+Math.max(0,draft.points.slice(0,6).findIndex(p=>!p));}
  show('map');renderMap();renderDraft();
  requestAnimationFrame(()=>{map.invalidateSize();const it=selectedLiveRing(),f=$('createForm').elements,point=context==='live'&&it?[it.latitude,it.longitude]:/^ring:/.test($('editMode').value)?draft.points[Number($('editMode').value.split(':')[1])]:null;map.setView(point||(context==='live'?[state.game.city_lat,state.game.city_lng]:[Number(f.lat.value),Number(f.lng.value)]),16);$('mapEditor').scrollIntoView({block:'start',behavior:'smooth'});});
 }
 async function stopGPS(){if(heartbeat!==null)clearInterval(heartbeat);heartbeat=null;if(watch!==null)navigator.geolocation.clearWatch(watch);watch=null;lastGPS=0;$('gpsStatus').textContent='Helymegosztás kikapcsolva.';buttons();renderMap();if(session)await api('stop');}
 function beginGPS(){
  if(!navigator.geolocation)throw new Error('Ez a böngésző nem támogatja a helymeghatározást.');
  if(document.hidden)throw new Error('Nyisd meg a játék lapját.');
  const options={enableHighAccuracy:true,maximumAge:0,timeout:20000};
  const onPosition=p=>{
   if(watch===null||document.hidden)return;
   const c=p.coords;$('gpsStatus').textContent='GPS-pontosság: '+Math.round(c.accuracy)+' m · A helyed a Szövetség számára látható.';
   if(c.accuracy>50){$('gpsStatus').textContent='A GPS még pontatlan: '+Math.round(c.accuracy)+' m. Várj pontosabb mérésre.';return;}
   if(Date.now()-lastGPS<10000)return;lastGPS=Date.now();
   api('location',{lat:c.latitude,lng:c.longitude,accuracy:c.accuracy}).catch(e=>{message(e.message,true);$('gpsStatus').textContent='A helyzetet nem sikerült megosztani: '+e.message;});
  };
  const onError=e=>{stopGPS().catch(()=>{});message(e.code===1?'A helymeghatározás engedélye szükséges.':'Nem érkezett GPS-jel. Próbáld újra szabad ég alatt.',true);};
  watch=navigator.geolocation.watchPosition(onPosition,onError,options);
  // Stationary browsers may not emit watchPosition updates: request a fresh fix too.
  heartbeat=setInterval(()=>{if(watch!==null&&!document.hidden)navigator.geolocation.getCurrentPosition(onPosition,onError,options);},12000);
  buttons();
 }
 document.querySelectorAll('[data-page]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.page)));
 for(const action of ['login','register'])$(action+'Form').addEventListener('submit',async e=>{e.preventDefault();const form=e.currentTarget,button=form.querySelector('button'),b=Object.fromEntries(new FormData(form));button.disabled=true;try{const response=await http('/functions/v1/player-auth',{action,character_name:b.character_name,pin:b.pin,avatar:{race:b.race,weapon:b.weapon}});form.elements.pin.value='';if(action==='register'){message(response.message);$('loginForm').elements.character_name.value=b.character_name;form.reset();}else{epoch++;saveSession({...response,expires_at:Date.now()+response.expires_in*1000});await api('state');show('map');fit();}}catch(err){message(err.message||'Kapcsolati hiba.',true);}finally{button.disabled=false;}});
 const characterForm=$('characterForm');
 for(const select of [characterForm.elements.race,$('registerForm').elements.race]){
  select.replaceChildren(...Object.entries(window.SauronMap.characterIcons).map(([race,icon])=>new Option(icon+' '+race,race)));
 }
 characterForm.addEventListener('submit',async event=>{
  event.preventDefault();
  if(!state?.me)return;
  const button=characterForm.querySelector('button');
  button.disabled=true;
  try{
   await api('profile',{race:characterForm.elements.race.value,weapon:state.me.avatar?.weapon});
   message('A térképes karakterikon elmentve.');
  }catch(error){message(error.message,true);}
  finally{button.disabled=false;}
 });
 bindButton('gps',beginGPS);bindButton('stopGps',stopGPS);
 bindButton('logout',async()=>{await stopGPS().catch(()=>{});let logoutError=false;try{const t=await token();await http('/auth/v1/logout?scope=local',{},t);}catch(e){logoutError=e.status!==401&&e.status!==403;}epoch++;saveSession(null);state=null;lastProfileRace=undefined;$('characterForm').hidden=true;updateRoundClock();accountView();$('logout').hidden=true;$('adminNav').hidden=true;$('adminTools').hidden=true;$('adminLocked').hidden=false;['groundItems','inventory','recoverItems','playerList','scores','archive','events'].forEach(empty);layer?.clearLayers();renderMap();$('connection').textContent='Kijelentkezve';show('auth');message(logoutError?'Kiléptél ezen a lapon; a szerveroldali lezárást nem sikerült ellenőrizni.':'Kijelentkeztél.',logoutError);});
 bindButton('startGame',async()=>{await api('start');message('A közös kaland elindult.');});
 bindButton('finishGame',async()=>{if(confirm('Lezárod a játékot? Az eredmények megmaradnak.')){await api('finish');await stopGPS().catch(()=>{});message('A játék lezárult.');}});
 function fit(){if(!map)return;if(editing){const f=$('createForm').elements;map.setView(placementContext==='live'?[state.game.city_lat,state.game.city_lng]:[Number(f.lat.value),Number(f.lng.value)],16);return;}const g=state?.game,view=currentSauron();if(g){const points=[[g.city_lat,g.city_lng],...(g.config?.route||[])];for(const item of state.items)if(item.item_type==='ring'&&item.status==='ground')points.push(ringSearchCenter(item),[item.latitude,item.longitude]);if(view.visible&&view.mode!=='rumor')points.push(view.position);map.fitBounds(L.latLngBounds(points).pad(.18),{maxZoom:15});}else if(view.visible)map.setView(view.position,3);}
 bindButton('fit',fit);
 bindButton('focusSauron',()=>{const view=currentSauron();if(!view.visible)return;show('map');map.setView(view.position,Math.max(5,map.getZoom()));sauronMarker?.openPopup();});
 const cityFields=$('createForm').elements;
 const cityKey=value=>value.trim().normalize('NFD').replace(/\p{M}/gu,'').toLowerCase();
 let acceptedCity=cityKey(cityFields.city.value), cityMatches=[];
 try{
  const saved=JSON.parse(localStorage.getItem('fellowship-city'));
  if(saved&&typeof saved.name==='string'&&window.PlacementModel.validPoint([saved.latitude,saved.longitude])){
   cityFields.city.value=saved.name;cityFields.lat.value=saved.latitude;cityFields.lng.value=saved.longitude;acceptedCity=cityKey(saved.name);
  }
 }catch{}
 function validateCity(){
  if(cityKey(cityFields.city.value)!==acceptedCity)throw new Error('A helyszínek kijelölése előtt kattints a Város elfogadása gombra.');
 }
 function applyCity(city){
  const changed=Number(cityFields.lat.value)!==city.latitude||Number(cityFields.lng.value)!==city.longitude;
  const hasPoints=draft.points.some(Boolean)||draft.route.length||draft.mordor;
  if(changed&&hasPoints&&!confirm('Városváltáskor törlődnek a terv korábbi helyszínei. Folytatod?'))return;
  if(changed){
   draft=window.PlacementModel.normalizeDraft(null);
   cityFields.safe.checked=false;
  }
  cityFields.city.value=city.name;
  cityFields.lat.value=city.latitude;
  cityFields.lng.value=city.longitude;
  acceptedCity=cityKey(city.name);
  localStorage.setItem('fellowship-city',JSON.stringify({name:city.name,latitude:city.latitude,longitude:city.longitude}));
  $('cityStatus').textContent=city.name+' elfogadva. Itt jelölheted ki a játék helyszíneit.';
  renderDraft();
 }
 cityFields.city.addEventListener('input',()=>{
  $('cityMatchesLabel').hidden=true;
  $('cityStatus').textContent='';
 });
 bindButton('acceptCity',async()=>{
  const query=cityFields.city.value.trim();
  if(query.length<2)throw new Error('Írd be a város nevét.');
  if(cityKey(query)==='gardony'){applyCity({name:'Gárdony',latitude:47.2094,longitude:18.6361});return;}
  const params=new URLSearchParams({name:query,count:'10',language:'hu'});
  const response=await fetch('https://geocoding-api.open-meteo.com/v1/search?'+params,{signal:AbortSignal.timeout(10000)});
  if(cityFields.city.value.trim()!==query)return;
  if(!response.ok)throw new Error('A városkeresés most nem érhető el.');
  const data=await response.json();
  if(cityFields.city.value.trim()!==query)return;
  cityMatches=(data.results||[]).filter(city=>city.feature_code?.startsWith('PPL')&&Number.isFinite(city.latitude)&&Number.isFinite(city.longitude));
  if(!cityMatches.length)throw new Error('Nem találtam ilyen települést. Próbáld meg a teljes nevét.');
  if(cityMatches.length===1){applyCity(cityMatches[0]);return;}
  $('cityMatches').replaceChildren(new Option('Válassz települést',''),...cityMatches.map((city,index)=>new Option([city.name,city.admin1,city.country].filter(Boolean).join(' · '),String(index))));
  $('cityMatchesLabel').hidden=false;
  $('cityStatus').textContent='Válaszd ki a megfelelő települést a találatok közül.';
 });
 $('cityMatches').addEventListener('change',event=>{
  if(event.target.value!=='')applyCity(cityMatches[Number(event.target.value)]);
 });
 function setRandomPlacement(active){randomPlacement=active;$('randomPlacement').setAttribute('aria-pressed',String(active));$('randomPlacement').textContent=active?'Bökj a térképre · Mégse':'Random elhelyezés';$('randomHint').textContent=active?'A következő térképkattintás lesz a véletlen pálya közepe. A sugár teljes egészében maradjon a város 10 km-es körzetében.':'6 gyűrű, 20 drágakő, Mordor és egy geometrikus Sauron-útvonal. A generált helyeket és útszakaszokat mentés előtt ellenőrizni kell.';}
 $('randomPlacement').addEventListener('click',()=>{if(placementContext==='draft'&&state?.me.is_admin)setRandomPlacement(!randomPlacement);});
 $('settingsForm').addEventListener('submit',e=>{e.preventDefault();if(!state?.me)return;const saved=window.Appearance.save(state.me.id,$('themeChoice').value);message(saved?'A megjelenítést elmentettem.':'A megjelenítés változott, de a böngésző nem engedte a mentést.',!saved);});
 bindButton('editMap',()=>openPlacementEditor('draft'));
 bindButton('editRings',()=>openPlacementEditor('live'));
 $('editMode').addEventListener('change',()=>{setRandomPlacement(false);pendingPlacement=null;$('placementSafe').checked=false;$('placementLat').value='';$('placementLng').value='';renderDraft();});
 $('placementSafe').addEventListener('change',buttons);
 bindButton('applyPoint',()=>{if(!$('placementLat').value||!$('placementLng').value)throw new Error('Add meg mindkét koordinátát.');acceptPoint([Number($('placementLat').value),Number($('placementLng').value)]);map.setView([Number($('placementLat').value),Number($('placementLng').value)],16);});
 bindButton('saveRingPosition',async()=>{const it=selectedLiveRing();if(!it||!pendingPlacement)throw new Error('Előbb válaszd ki a gyűrű új helyét a térképen.');await api('place_ring',{item:it.id,lat:pendingPlacement[0],lng:pendingPlacement[1],safe:$('placementSafe').checked});pendingPlacement=null;$('placementSafe').checked=false;renderDraft();message('A gyűrű új helyét elmentettem a közös játékba.');});
 bindButton('undoPoint',()=>{if(placementContext==='live')pendingPlacement=null;else{const mode=$('editMode').value;if(mode.startsWith('ring:'))draft.points[Number(mode.split(':')[1])]=null;else if(mode==='mordor')draft.mordor=null;else if(mode==='points'){if(draft.points.length>6)draft.points.pop();}else draft.route.pop();}renderDraft();});
 bindButton('closeEditor',()=>{if(placementContext==='live'&&pendingPlacement&&!confirm('Az új hely még nincs mentve. Elveted a kijelölést?'))return;editing=false;pendingPlacement=null;document.body.classList.remove('map-editing');$('mapEditor').hidden=true;draftLayer.clearLayers();renderMap();show('admin');});
 $('createForm').addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget,button=f.querySelector('button.primary');button.disabled=true;try{validateCity();const b=Object.fromEntries(new FormData(f));if(draft.points.slice(0,6).some(p=>!p))throw new Error('Jelöld ki mind a hat gyűrű helyét a szerkesztőben.');await api('create',{city:b.city,lat:Number(b.lat),lng:Number(b.lng),...draft,safe:f.elements.safe.checked});draft=window.PlacementModel.normalizeDraft(null); f.elements.safe.checked=false; renderDraft();message('A játék előkészítve. Indítás előtt ellenőrizd a térképet.');fit();}catch(err){message(err.message,true);}finally{button.disabled=false;}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){const t=session?.access_token;if(t)fetch(cfg.url+'/functions/v1/game-api',{method:'POST',headers:{apikey:cfg.key,'Content-Type':'application/json',Authorization:'Bearer '+t},body:JSON.stringify({action:'stop'}),keepalive:true}).catch(()=>{});stopGPS().catch(()=>{});}});
 window.addEventListener('offline',()=>{$('connection').textContent='Nincs internetkapcsolat';stopGPS().catch(()=>{});});
 window.addEventListener('pagehide',()=>{if(session)fetch(cfg.url+'/functions/v1/game-api',{method:'POST',headers:{apikey:cfg.key,'Content-Type':'application/json',Authorization:'Bearer '+session.access_token},body:JSON.stringify({action:'stop'}),keepalive:true}).catch(()=>{});});
 async function poll(){if(!session)updateSauron();if(session&&!document.hidden)try{await api('state');}catch(e){$('connection').textContent='Kapcsolat megszakadt · '+e.message;}setTimeout(poll,10000);}
 if(window.L){map=L.map('mapCanvas').setView([50.0875,14.4213],14);L.tileLayer(cfg.tiles,{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map).on('tileerror',()=>{ $('gpsStatus').textContent='A térképháttér nem elérhető. A jelölők látszódhatnak, de a helyszínek ellenőrzéséhez várd meg a háttértérkép betöltését.'; });layer=L.layerGroup().addTo(map);draftLayer=L.layerGroup().addTo(map);map.on('click',e=>{if(!editing||!state?.me.is_admin)return;try{acceptPoint([Number(e.latlng.lat.toFixed(6)),Number(e.latlng.lng.toFixed(6))]);}catch(error){message(error.message,true);}});}else message('A térképet nem sikerült betölteni. A listás játékfelület továbbra is használható.',true);
 accountView();renderDraft();buttons();renderMap();poll();
})();

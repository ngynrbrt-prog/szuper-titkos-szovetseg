(()=>{'use strict';
const cfg=window.GAME_CONFIG;
const $=id=>document.getElementById(id);
const storeKey='szovetseg_demo_v1';
let state;try{state=JSON.parse(localStorage.getItem(storeKey))||{players:[],current:null}}catch{state={players:[],current:null}}
const save=()=>localStorage.setItem(storeKey,JSON.stringify(state));
if(typeof state.ringsAssigned!=='boolean')state.ringsAssigned=true;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const map=L.map('mapCanvas',{zoomControl:true}).setView([49.2,16.8],7);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap közreműködők',maxZoom:19}).addTo(map);
const cityLookup=Object.fromEntries(cfg.cities.map(c=>[c.name,c]));
const bounds=L.latLngBounds([]);
cfg.routes.forEach((route,i)=>{const points=route.cities.map(name=>cityLookup[name]).filter(Boolean).map(c=>[c.lat,c.lng]);if(points.length>1){L.polyline(points,{color:i?'#8c6b40':'#5d4028',weight:4,dashArray:i?'8 8':null,opacity:.8}).addTo(map).bindPopup(esc(route.name)+'<br><small>Vázlatos összekötés, nem navigációs útvonal.</small>');points.forEach(p=>bounds.extend(p));}});
cfg.cities.forEach(c=>L.circleMarker([c.lat,c.lng],{radius:6,color:'#65472b',fillColor:'#c6a45c',fillOpacity:1}).addTo(map).bindPopup(`<b>${esc(c.fantasy)}</b><br>${esc(c.name)}`));
L.circle(cfg.hunting.center,{radius:cfg.hunting.radiusKm*1000,color:'#ad4c39',weight:2,fillOpacity:.04,dashArray:'8 7'}).addTo(map).bindPopup('Prágai vadászterület');
if(bounds.isValid())map.fitBounds(bounds.pad(.12));
const sauron=L.marker([cfg.startCity.lat,cfg.startCity.lng],{icon:L.divIcon({className:'',html:'<span class="sauron">👁️</span>',iconSize:[34,34]})}).addTo(map).bindPopup('Sauron • utazási bemutató mód');
// Európai 'utolsó észlelés': kizárólag fiktív jelzés, nem a mozgó Sauron valódi GPS-helye.
const rumorKey='szovetseg_sauron_rumor_v1';
let rumor;try{rumor=JSON.parse(localStorage.getItem(rumorKey))}catch{}
const rumorMs=cfg.rumor.refreshHours*3600000;
function updateRumor(){
 const slot=Math.floor(Date.now()/rumorMs);
 if(!rumor||rumor.slot!==slot){const choices=cfg.rumor.locations;let idx=Math.floor(Math.random()*choices.length);if(rumor&&choices.length>1&&idx===rumor.index)idx=(idx+1)%choices.length;rumor={slot,index:idx};localStorage.setItem(rumorKey,JSON.stringify(rumor));}
 rumorMarker.setLatLng(cfg.rumor.locations[rumor.index]);
 rumorMarker.bindPopup('<strong>👁️ Sauron – utolsó ismert észlelés</strong><br>⚠️ Bizonytalan információ, nem valós idejű pozíció.<br>Az észlelés 3 óránként változik.');
}
const rumorMarker=L.marker(cfg.rumor.locations[0],{icon:L.divIcon({className:'',html:'<span class="rumor-sauron">👁️?</span>',iconSize:[42,36]})});
function syncRumorVisibility(){const visible=map.getZoom()<=cfg.rumor.visibleAtZoom;if(visible&&!map.hasLayer(rumorMarker))rumorMarker.addTo(map);if(!visible&&map.hasLayer(rumorMarker))map.removeLayer(rumorMarker);}
map.on('zoomend',syncRumorVisibility);updateRumor();syncRumorVisibility();setInterval(()=>{updateRumor();syncRumorVisibility()},60000);
$('showEurope').addEventListener('click',()=>{document.querySelector('[data-page="map"]').click();map.fitBounds(cfg.rumor.europeBounds);});
$('ringsAssigned').checked=state.ringsAssigned;
$('applyRingMode').addEventListener('click',()=>{if(watchId!==null)stopTracking();state.ringsAssigned=$('ringsAssigned').checked;save();render();$('adminStatus').textContent=state.ringsAssigned?'💍 A gyűrűk kiosztva (helyi demó).':'🧙 Gyűrű nélküli játék bekapcsolva (helyi demó).';});
let watchId=null,ownMarker=null,activeStart=null;
function stopTracking(){if(watchId!==null){navigator.geolocation.clearWatch(watchId);watchId=null}if(activeStart!==null&&state.current){const p=state.players.find(x=>x.id===state.current);if(p){if(state.ringsAssigned)p.ringSeconds+=(Date.now()-activeStart)/1000;save()}}activeStart=null;if(ownMarker){map.removeLayer(ownMarker);ownMarker=null}$('gps').disabled=false;$('stopGps').disabled=true;$('gpsStatus').textContent='🌫️ Letért az útról';render();}
function beginTracking(){if(!state.current){$('gpsStatus').textContent='Előbb jelentkezz be egy karakterrel!';return}if(!navigator.geolocation){$('gpsStatus').textContent='Ez a böngésző nem támogatja a GPS-t.';return}if(!window.isSecureContext){$('gpsStatus').textContent='GPS-hez HTTPS vagy localhost szükséges.';return}if(document.hidden){$('gpsStatus').textContent='A GPS csak látható lapon aktív.';return}if(watchId!==null)return;
watchId=navigator.geolocation.watchPosition(pos=>{const ll=[pos.coords.latitude,pos.coords.longitude];if(!ownMarker){ownMarker=L.marker(ll,{icon:L.divIcon({className:'',html:'<span class="hero">🧙</span>',iconSize:[32,32]})}).addTo(map).bindPopup('A karaktered');map.setView(ll,14)}else ownMarker.setLatLng(ll);if(activeStart===null)activeStart=Date.now();$('gpsStatus').textContent='📍 GPS aktív • ±'+Math.round(pos.coords.accuracy)+' m';render();},err=>{$('gpsStatus').textContent='GPS hiba: '+err.message;stopTracking()},{enableHighAccuracy:true,maximumAge:5000,timeout:20000});$('gps').disabled=true;$('stopGps').disabled=false;}
$('gps').addEventListener('click',beginTracking);$('stopGps').addEventListener('click',stopTracking);document.addEventListener('visibilitychange',()=>{if(document.hidden&&watchId!==null)stopTracking()});window.addEventListener('pagehide',stopTracking);
$('fit').addEventListener('click',()=>map.fitBounds(bounds.pad(.12)));
document.querySelectorAll('[data-bearing]').forEach(b=>b.addEventListener('click',()=>{$('mapStatus').textContent='🧭 '+({0:'Észak',90:'Kelet',180:'Dél',270:'Nyugat'}[b.dataset.bearing])+' kiválasztva. A tényleges térképforgatás a MapLibre-verzióban készül el.'}));
document.querySelectorAll('[data-page]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id===btn.dataset.page));document.querySelectorAll('[data-page]').forEach(b=>b.classList.toggle('selected',b===btn));if(btn.dataset.page==='map')setTimeout(()=>map.invalidateSize(),40);render()}));
$('cityList').innerHTML=cfg.cities.map(c=>`<div class="card"><strong>${esc(c.fantasy)}</strong> – ${esc(c.name)} <small>(${c.lat.toFixed(4)}, ${c.lng.toFixed(4)})</small></div>`).join('');
$('routeList').innerHTML=cfg.routes.map(r=>`<div class="card"><strong>${esc(r.name)}</strong><br>${r.cities.map(esc).join(' → ')}</div>`).join('');
const makeId=()=>crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random();
function render(){const p=state.players.find(x=>x.id===state.current);$('myCharacter').textContent=p?`Bejelentkezve: ${p.nickname} (${p.race}) • ${state.ringsAssigned?'💍 '+p.ring:'◯ Gyűrű nélkül'}`:'Még nem választottál karaktert.';const ordered=[...state.players].sort((a,b)=>b.ringSeconds-a.ringSeconds);const sec=x=>Math.floor(x+(state.ringsAssigned&&activeStart!==null&&p&&x===p.ringSeconds?(Date.now()-activeStart)/1000:0));$('players').innerHTML=ordered.map(x=>`<div class="card">🧙 <strong>${esc(x.nickname)}</strong> – ${esc(x.race)}, ${esc(x.weapon)}<br>${state.ringsAssigned?'💍 '+esc(x.ring):'◯ Nincs kiosztott gyűrű'} • Gyűrűvel: ${Math.floor(sec(x.ringSeconds)/60)} perc • Gyűrű nélkül: 0 perc<br><small>${x.id===state.current?(watchId!==null?'📍 Aktív':'🌫️ Letért az útról'):'🌫️ Nincs élő GPS-adat'}</small></div>`).join('')||'<p>Még nincsenek karakterek.</p>';$('leaderboard').innerHTML=ordered.map((x,i)=>`<div class="card">${i+1}. ${esc(x.nickname)} – ${Math.floor(sec(x.ringSeconds)/60)} perc</div>`).join('')||'<p>Még nincsenek eredmények.</p>';}
$('registerForm').addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.target);const nickname=String(f.get('nickname')).trim();const pin=String(f.get('pin'));if(!nickname||!/^[0-9]{4,8}$/.test(pin))return;$('registerStatus').textContent='';if(state.players.length>=cfg.maxPlayers){$('registerStatus').textContent='A hat karakterhely betelt.';return}if(state.players.some(p=>p.nickname.toLocaleLowerCase('hu')===nickname.toLocaleLowerCase('hu'))){$('registerStatus').textContent='Ez a becenév már foglalt.';return}if(String(f.get('adminPassword')).trim()){$('registerStatus').textContent='Figyelem: az adminjelszó csak a szerveres verzióban ellenőrizhető; ebben a demóban nem ad adminjogot.';}stopTracking();const p={id:makeId(),nickname,race:f.get('race'),weapon:f.get('weapon'),ring:cfg.rings[state.players.length],ringSeconds:0,pinDemo:pin};state.players.push(p);state.current=p.id;save();render();e.target.reset();if(!$('registerStatus').textContent)$('registerStatus').textContent='Karakter létrehozva! Kapcsold be a GPS-t a Térkép fülön.';});
$('loginForm').addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.target);const p=state.players.find(x=>x.nickname.toLocaleLowerCase('hu')===String(f.get('nickname')).trim().toLocaleLowerCase('hu')&&x.pinDemo===String(f.get('pin')));if(!p){$('loginStatus').textContent='Hibás becenév vagy PIN.';return}stopTracking();state.current=p.id;save();render();$('loginStatus').textContent='Sikeres belépés: '+p.nickname;e.target.reset()});
setInterval(()=>{if(activeStart!==null&&state.current){const p=state.players.find(x=>x.id===state.current);if(p){if(state.ringsAssigned)p.ringSeconds+=(Date.now()-activeStart)/1000;activeStart=Date.now();save();render()}}},10000);
render();
})();

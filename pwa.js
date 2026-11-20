(() => {
 'use strict';
 const install=document.getElementById('installApp'), update=document.getElementById('updateApp'), status=document.getElementById('appStatus'), dialog=document.getElementById('installDialog');
 let prompt=null, registration=null, applying=false;
 const standalone=() => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
 function connection(){status.textContent=navigator.onLine ? '' : 'Nincs internetkapcsolat. A játékhoz kapcsolódj újra; a látható játékállapot elavulhat.';}
 connection(); window.addEventListener('online',connection); window.addEventListener('offline',connection);
 install.hidden=standalone();
 window.addEventListener('beforeinstallprompt', e => {e.preventDefault();prompt=e;install.hidden=false;});
 window.addEventListener('appinstalled', () => {prompt=null;install.hidden=true;status.textContent='A Szövetség telepítve.';});
 install.addEventListener('click',async () => {
  if(!prompt){dialog.showModal();return;}
  const pending=prompt;prompt=null;
  try{await pending.prompt();await pending.userChoice;}catch{dialog.showModal();}
 });
 update.addEventListener('click', () => {
  if(!registration?.waiting) return;
  if(!confirm('Az alkalmazás újratöltődik, a helymegosztás leáll. Frissítés után szükség esetén jelentkezz be és indítsd újra a helymegosztást. Frissíted most?')) return;
  applying=true;registration.waiting.postMessage({type:'ACTIVATE_UPDATE'});
 });
 if('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.addEventListener('controllerchange', () => {if(applying)location.reload();});
  navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(r => {
   registration=r;
   const available=() => {if(r.waiting)update.hidden=false;};
   available();
   r.addEventListener('updatefound', () => {const w=r.installing;w?.addEventListener('statechange',available);});
  }).catch(() => {if(navigator.onLine)status.textContent='A webes játék használható. A telepítési előkészítéshez próbáld újratölteni az oldalt.';});
 }
})();

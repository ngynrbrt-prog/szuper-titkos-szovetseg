'use strict';
(()=>{
 const dialog=document.getElementById('rescueDialog'),title=document.getElementById('rescueNoticeTitle'),body=document.getElementById('rescueNoticeBody');
 const acknowledged=new Set();let owner=null,current=null,pending=[];
 function key(event){return 'fellowship-rescue-notice:'+event.owner+':'+event.game+':'+event.kind+':'+event.time;}
 function seen(event){try{return acknowledged.has(key(event))||localStorage.getItem(key(event))==='seen';}catch{return acknowledged.has(key(event));}}
 function remember(event){acknowledged.add(key(event));try{localStorage.setItem(key(event),'seen');}catch{}}
 function drain(){
  if(current||!pending.length||document.getElementById('roundDialog')?.open)return;
  current=pending.shift();title.textContent=current.kind==='started'?'Gyűrűvisszaszerzés folyamatban':'A közös gyűrűvisszaszerzés sikerült';
  body.textContent=current.kind==='started'?'Minden regisztrált játékos elkezdte a helymegosztást, és a térképen maradt gyűrűk játékosoknál vannak. Elindult a közös öt perc. Tartsátok fenn a friss helymegosztást; megszakítás vagy elfogás újrakezdi az időt.':current.count+' gyűrű visszakerült Saurontól az eredeti helyére, és ismét felvehető. Ha a helymegosztásod aktív, a popup bezárása után is az marad.';
  dialog.showModal();
 }
 function reset(){owner=null;current=null;pending=[];if(dialog.open)dialog.close();}
 function update(state){
  if(!state?.me||!state.game){reset();return;}
  if(owner!==state.me.id){reset();owner=state.me.id;}
  const game=state.game,config=game.config||{},events=[];
  if(game.status==='active'&&config.rescue_started_at)events.push({kind:'started',time:config.rescue_started_at});
  if(config.rescue_completed_at&&Number(config.rescue_released)>0)events.push({kind:'completed',time:config.rescue_completed_at,count:Number(config.rescue_released)});
  for(const event of events){Object.assign(event,{owner,game:game.id});if(!seen(event)&&(!current||key(current)!==key(event))&&!pending.some(e=>key(e)===key(event)))pending.push(event);}
  drain();
 }
 dialog.addEventListener('close',()=>{if(current){remember(current);current=null;}drain();});
 document.getElementById('roundDialog')?.addEventListener('close',drain);
 window.RescueNotices=Object.freeze({update,reset});
})();

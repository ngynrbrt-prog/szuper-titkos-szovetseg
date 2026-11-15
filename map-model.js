'use strict';
// A rumor is explicitly separate from the authoritative, server-provided game position.
(()=>{
 const sightings=[
  {city:'Tokió · Ázsia',position:[35.6762,139.6503]},
  {city:'Sydney · Ausztrália',position:[-33.8688,151.2093]},
  {city:'New York · Észak-Amerika',position:[40.7128,-74.006]},
  {city:'Nairobi · Afrika',position:[-1.2921,36.8219]},
  {city:'Buenos Aires · Dél-Amerika',position:[-34.6037,-58.3816]},
  {city:'Delhi · Ázsia',position:[28.6139,77.209]}
 ];
 function sauronView(state,now=Date.now()){
  const game=state?.game;
  if(!game||game.status==='preparation'){
   const slot=Math.floor(now/7200000),sighting=sightings[slot%sightings.length];
   return {nextChange:(slot+1)*7200000,key:'rumor:'+slot,mode:'rumor',visible:true,position:sighting.position,city:sighting.city,title:'Utolsó ismert észlelés',label:'Sauron · bizonytalan észlelés',detail:'A játék előtt egy másik kontinensről érkezik hír. Az észlelés kétóránként változik; ez nem Sauron valódi, élő helyzete.'};
  }
  if(!state.sauron)return {key:game.id+':hidden',mode:'hidden',visible:false,position:null,city:game.city_name,title:game.status==='finished'?'A kaland lezárult':'Sauron rejtve marad',detail:game.status==='finished'?'Ennek a játéknak a vadászata véget ért.':'A rablást követő rejtőzési idő alatt Sauron nem látható és nem támad.'};
  return {key:game.id+':'+game.status,mode:game.status,visible:true,position:state.sauron,city:game.city_name,title:game.status==='finished'?'Utolsó játékbeli helyzet':'Sauron a térképen',label:'Sauron',detail:game.status==='finished'?'A lezárt játék utolsó helyzete.':game.config?.sauron_target?'Sauron egy helyzetét megosztó gyűrűbirtokost üldöz.':'Sauron helyzetet megosztó gyűrűbirtokost keres.'};
 }
 const characterIcons=Object.freeze({Ember:'🧑',Tünde:'🧝',Törp:'⛏️',Hobbit:'🌿',Varázsló:'🧙',Ork:'👹'});
 function characterIcon(race){return Object.hasOwn(characterIcons,race)?characterIcons[race]:'👤';}
 function sharedCharacters(state){
  const players=new Map(state.players.map(player=>[player.id,player]));
  return state.locations.flatMap(location=>{
   const player=players.get(location.player_id);
   if(!player)return [];
   return [{...location,icon:characterIcon(player.avatar?.race),label:player.character_name,own:player.id===state.me.id}];
  });
 }
 const api=Object.freeze({sauronView,characterIcons,characterIcon,sharedCharacters});
 if(typeof window!=='undefined')window.SauronMap=api;
 if(typeof module!=='undefined')module.exports=api;
})();

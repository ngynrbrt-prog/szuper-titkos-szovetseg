'use strict';
(() => {
 const colors=Object.freeze([{id:1,name:'Piros',hex:'#dc2626'},{id:2,name:'Kék',hex:'#2563eb'},{id:3,name:'Zöld',hex:'#15803d'},{id:4,name:'Sárga',hex:'#ca8a04'},{id:5,name:'Narancs',hex:'#ea580c'},{id:6,name:'Lila',hex:'#9333ea'},{id:7,name:'Rózsaszín',hex:'#db2777'},{id:8,name:'Barna',hex:'#92400e'}]);
 function color(id){return colors.find(c=>c.id===Number(id))||{id:0,name:'Nincs korábbi színadat',hex:'#64748b'};}
 function ringProgress(item){const seconds=Math.min(3600,Math.max(0,Math.floor(Number(item.ring_share_seconds)||0)));return {seconds,eligible:seconds>=3600,label:Math.floor(seconds/60)+' perc '+String(seconds%60).padStart(2,'0')+' mp / 60 perc'};}
 function canChangeColor(game){return game?.status!=='active';}
 function rescueProgress(rescue){return {seconds:Math.min(300,Math.max(0,Math.floor(Number(rescue?.elapsed_seconds)||0))),sharing:Number(rescue?.sharing_players)||0,required:Number(rescue?.required_players)||0,captive:Number(rescue?.captive_rings)||0};}
 const api={colors,color,ringProgress,canChangeColor,rescueProgress};if(typeof window!=='undefined')window.PlayerRules=api;if(typeof module!=='undefined')module.exports=api;
})();

'use strict';
(()=>{
 const ringNames=['Anor Arany Fénye','Barad Rubin Lángja','Elbereth Kék Csillaga','Lórien Zöld Álma','Khazad Ezüst Pajzsa','Ithil Lila Árnya'];
 function validPoint(p){return Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)&&Math.abs(p[0])<=90&&Math.abs(p[1])<=180;}
 function normalizeDraft(value){const d=value||{},points=Array.isArray(d.points)?d.points.slice(0,100).map(p=>validPoint(p)?p:null):[];while(points.length<6)points.push(null);return {gem_count:d.gem_count===20?20:40,points,route:Array.isArray(d.route)?d.route.filter(validPoint).slice(0,100):[],mordor:validPoint(d.mordor)?d.mordor:null};}
 function assignPoint(value,mode,point){
  if(!validPoint(point))throw new Error('Érvényes szélességi és hosszúsági koordináta szükséges.');
  const d=normalizeDraft(value);
  if(/^ring:[0-5]$/.test(mode))d.points[Number(mode.split(':')[1])]=point;
  else if(mode==='mordor')d.mordor=point;
  else if(mode==='route'){if(d.route.length>=100)throw new Error('Legfeljebb 100 útvonalpont lehet.');d.route.push(point);}
  else if(mode==='points'){if(d.points.slice(0,6).some(p=>!p))throw new Error('Előbb jelöld ki mind a hat gyűrű helyét.');if(d.points.length>=100)throw new Error('Legfeljebb 100 helyszín lehet.');d.points.push(point);}
  else throw new Error('Előbb válassz gyűrűt vagy helyszíntípust.');
  return d;
 }

 function randomDraft(center,radius,random=Math.random){
  if(!validPoint(center)||!Number.isFinite(radius)||radius<100||radius>5000)throw new Error('A sugár 100 és 5000 méter között legyen.');
  function at(distance,angle){const d=distance/6371000,lat=center[0]*Math.PI/180,lng=center[1]*Math.PI/180;
   const y=Math.asin(Math.sin(lat)*Math.cos(d)+Math.cos(lat)*Math.sin(d)*Math.cos(angle));
   const x=lng+Math.atan2(Math.sin(angle)*Math.sin(d)*Math.cos(lat),Math.cos(d)-Math.sin(lat)*Math.sin(y));
   return [y*180/Math.PI,((x*180/Math.PI+540)%360)-180];}
  const sample=()=>at(radius*Math.sqrt(random()),random()*2*Math.PI);
  const points=Array.from({length:26},sample),mordor=sample();
  const route=Array.from({length:8},(_,i)=>at(radius*(.55+.25*random()),i*Math.PI/4));route.push([...route[0]]);
  return {points,mordor,route,gem_count:20};
 }
 const api=Object.freeze({ringNames,validPoint,normalizeDraft,assignPoint,randomDraft});
 if(typeof window!=='undefined')window.PlacementModel=api;
 if(typeof module!=='undefined')module.exports=api;
})();

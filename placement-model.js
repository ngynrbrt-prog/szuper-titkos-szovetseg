'use strict';
(()=>{
 const ringNames=['Anor Arany Fénye','Barad Rubin Lángja','Elbereth Kék Csillaga','Lórien Zöld Álma','Khazad Ezüst Pajzsa','Ithil Lila Árnya'];
 function validPoint(p){return Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)&&Math.abs(p[0])<=90&&Math.abs(p[1])<=180;}
 function normalizeDraft(value){const d=value||{},points=Array.isArray(d.points)?d.points.slice(0,100).map(p=>validPoint(p)?p:null):[];while(points.length<6)points.push(null);return {points,route:Array.isArray(d.route)?d.route.filter(validPoint).slice(0,100):[],mordor:validPoint(d.mordor)?d.mordor:null};}
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
 const api=Object.freeze({ringNames,validPoint,normalizeDraft,assignPoint});
 if(typeof window!=='undefined')window.PlacementModel=api;
 if(typeof module!=='undefined')module.exports=api;
})();

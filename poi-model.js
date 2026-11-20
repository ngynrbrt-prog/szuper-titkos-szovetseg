'use strict';
(() => {
 const radii=[1000,3000,5000];
 const categories={restaurant:'Étterem',pub:'Kocsma',bar:'Bár',attraction:'Nevezetesség',museum:'Múzeum',viewpoint:'Kilátópont',castle:'Vár',monument:'Emlékmű',memorial:'Emlékhely',ruins:'Rom'};
 function distance(a,b){const r=Math.PI/180,x=(a[0]-b[0])*r,y=(a[1]-b[1])*r;return 12742000*Math.asin(Math.sqrt(Math.min(1,Math.sin(x/2)**2+Math.cos(a[0]*r)*Math.cos(b[0]*r)*Math.sin(y/2)**2)));}
 function validPoint(p){return Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)&&Math.abs(p[0])<=90&&Math.abs(p[1])<=180;}
 function category(tags={}){if(['restaurant','pub','bar'].includes(tags.amenity))return tags.amenity;if(['attraction','museum','viewpoint'].includes(tags.tourism))return tags.tourism;if(['castle','monument','memorial','ruins'].includes(tags.historic))return tags.historic;return null;}
 function query(center,radius){
  if(!validPoint(center)||!radii.includes(radius))throw new Error('Válassz 1, 3 vagy 5 km sugarat.');
  const around='(around:'+radius+','+center[0]+','+center[1]+')';
  return '[out:json][timeout:25];(nwr["amenity"~"^(restaurant|pub|bar)$"]'+around+';nwr["tourism"~"^(attraction|museum|viewpoint)$"]'+around+';nwr["historic"~"^(castle|monument|memorial|ruins)$"]'+around+';);out center tags;';
 }
 function places(payload,center,radius){
  const result=[];
  for(const el of payload?.elements||[]){const tags=el.tags||{},kind=category(tags),point=[el.lat??el.center?.lat,el.lon??el.center?.lon];
   if(!kind||!validPoint(point)||distance(point,center)>radius||['private','no'].includes(tags.access)||tags.disused==='yes'||tags.abandoned==='yes')continue;
   if(result.some(p=>p.id===el.type+'/'+el.id||distance(point,p.point)<30))continue;
   result.push({id:el.type+'/'+el.id,name:String(tags['name:hu']||tags.name||categories[kind]).slice(0,160),category:kind,point});
  }
  return result;
 }
 function choose(list,center,radius,random=Math.random){
  const candidates=list.filter(p=>validPoint(p.point)&&category({amenity:p.category,tourism:p.category,historic:p.category})&&distance(p.point,center)<=radius).slice();
  for(let i=candidates.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[candidates[i],candidates[j]]=[candidates[j],candidates[i]];}
  const selected=[];for(const p of candidates){if(!selected.some(s=>s.id===p.id||distance(s.point,p.point)<30))selected.push(p);if(selected.length===7)return selected;}
  throw new Error('Nincs legalább 7 különböző étterem, kocsma vagy nevezetesség ebben a körben. Válassz másik középpontot vagy nagyobb sugarat.');
 }
 const api={radii,categories,distance,query,places,choose};if(typeof window!=='undefined')window.PoiModel=api;if(typeof module!=='undefined')module.exports=api;
})();

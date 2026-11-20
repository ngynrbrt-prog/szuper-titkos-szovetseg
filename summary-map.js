'use strict';
(() => {
 function project(lat,lng,z){const size=256*2**z,s=Math.sin(Math.max(-85.05,Math.min(85.05,lat))*Math.PI/180);return [(lng+180)/360*size,(.5-Math.log((1+s)/(1-s))/(4*Math.PI))*size];}
 function layout(data,width=900,height=560){
  const points=[[data.city_lat,data.city_lng],...(data.tracks||[]).flatMap(t=>t.points.map(p=>p.slice(0,2)))].filter(p=>p.every(Number.isFinite));
  if(!points.length)throw new Error('Nincs városkoordináta.');
  let bounds,z;for(z=14;z>5;z--){const xy=points.map(p=>project(...p,z));bounds=[Math.min(...xy.map(p=>p[0])),Math.min(...xy.map(p=>p[1])),Math.max(...xy.map(p=>p[0])),Math.max(...xy.map(p=>p[1]))];if(bounds[2]-bounds[0]<width-100&&bounds[3]-bounds[1]<height-150)break;}
  const center=project(data.city_lat,data.city_lng,z),xy=points.map(p=>project(...p,z));bounds=[Math.min(center[0]-100,...xy.map(p=>p[0])),Math.min(center[1]-100,...xy.map(p=>p[1])),Math.max(center[0]+100,...xy.map(p=>p[0])),Math.max(center[1]+100,...xy.map(p=>p[1]))];
  return {z,left:(bounds[0]+bounds[2]-width)/2,top:(bounds[1]+bounds[3]-(height-80))/2,width,height:height-80};
 }
 function segments(points){const result=[];for(const p of points){if(!Array.isArray(p)||!Number.isFinite(p[0])||!Number.isFinite(p[1]))continue;const last=result.at(-1);if(!last||last.segment!==p[2])result.push({segment:p[2],points:[p]});else last.points.push(p);}return result;}
 async function render(data,canvas,tileTemplate){
  const width=900,height=560,l=layout(data,width,height),ctx=canvas.getContext('2d');canvas.width=width;canvas.height=height;ctx.fillStyle='#edf2ec';ctx.fillRect(0,0,width,height);
  let loaded=0,failed=0;const jobs=[];
  for(let y=Math.floor(l.top/256);y<=Math.floor((l.top+l.height)/256);y++)for(let x=Math.floor(l.left/256);x<=Math.floor((l.left+width)/256);x++){
   const tx=((x%2**l.z)+2**l.z)%2**l.z;if(y<0||y>=2**l.z)continue;
   jobs.push(new Promise(resolve=>{const image=new Image();let settled=false;image.crossOrigin='anonymous';const timer=setTimeout(()=>{if(settled)return;settled=true;image.src='';failed++;resolve();},12000);image.onload=()=>{if(settled)return;settled=true;clearTimeout(timer);ctx.drawImage(image,x*256-l.left,y*256-l.top);loaded++;resolve();};image.onerror=()=>{if(settled)return;settled=true;clearTimeout(timer);failed++;resolve();};image.src=tileTemplate.replace('{z}',l.z).replace('{x}',tx).replace('{y}',y);}));
  }
  await Promise.all(jobs);ctx.save();ctx.beginPath();ctx.rect(0,0,width,l.height);ctx.clip();
  const players=new Map((data.players||[]).map(p=>[p.id,p]));
  for(const track of data.tracks||[]){const player=players.get(track.player_id),color=window.PlayerRules.color(player?.color_id).hex;
   for(const segment of segments(track.points)){const xy=segment.points.map(p=>{const v=project(p[0],p[1],l.z);return [v[0]-l.left,v[1]-l.top]});for(const [stroke,size] of [['#ffffff',7],[color,4]]){ctx.strokeStyle=stroke;ctx.lineWidth=size;ctx.lineJoin='round';ctx.beginPath();xy.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.stroke();}for(const p of [xy[0],xy.at(-1)]){ctx.fillStyle=color;ctx.beginPath();ctx.arc(...p,5,0,Math.PI*2);ctx.fill();}}
  }
  ctx.restore();ctx.fillStyle='#ffffffee';ctx.fillRect(0,0,width,42);ctx.fillStyle='#182b24';ctx.font='bold 20px system-ui';ctx.fillText(data.city_name+' · A Szövetség megosztott útvonalai',18,28);
  ctx.fillStyle='#ffffff';ctx.fillRect(0,l.height,width,80);ctx.font='14px system-ui';(data.players||[]).slice(0,6).forEach((p,i)=>{const x=18+(i%3)*295,y=l.height+23+Math.floor(i/3)*24;ctx.fillStyle=window.PlayerRules.color(p.color_id).hex;ctx.fillRect(x,y-11,12,12);ctx.fillStyle='#182b24';ctx.fillText(String(p.character_name).slice(0,24),x+20,y);});
  ctx.fillStyle='#33443a';ctx.font='11px system-ui';ctx.fillText('© OpenStreetMap contributors · csak a bekapcsolt helymegosztás mintái',18,height-7);
  if(failed){ctx.fillStyle='#fff2d4';ctx.fillRect(0,42,width,26);ctx.fillStyle='#654818';ctx.fillText('A háttértérkép részben vagy egészben nem töltődött be.',18,60);}
  return {url:canvas.toDataURL('image/png'),loaded,failed,points:(data.tracks||[]).reduce((n,t)=>n+t.points.length,0)};
 }
 const api={project,layout,segments,render};if(typeof window!=='undefined')window.RoundMap=api;if(typeof module!=='undefined')module.exports=api;
})();

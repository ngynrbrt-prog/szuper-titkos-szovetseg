'use strict';
(()=>{
 const LEVELS=Object.freeze([2,5,8,11,14,17,20]);
 function random(level,x,y,salt){x=((x%2**level)+2**level)%2**level;let n=Math.imul(x^Math.imul(level,374761393),668265263)^Math.imul(y,1274126177)^Math.imul(salt,2246822519);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296;}
 // Coordinates are fractions of the fixed Web Mercator world at zoom zero.
 function folds(level,x,y){const unit=256/2**level,at=(a,b)=>[(x+a)*unit,(y+b)*unit],r=n=>random(level,x,y,n);
  return [
   [at(.2+.55*r(1),-.06),at(.2+.55*r(2),1.06)],
   [at(-.06,.25+.5*r(3)),at(1.06,.25+.5*r(4))],
   [at(.12+.2*r(5),.15+.5*r(6)),at(.48+.35*r(7),.35+.5*r(8))]
  ];
 }
 function tilePoint(point,coords,size=256){const scale=2**coords.z;return [point[0]*scale-coords.x*size,point[1]*scale-coords.y*size];}
 function shade(ctx,a,b,width,opacity){const dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);if(!length)return;
  const nx=-dy/length*width,ny=dx/length*width;
  const gradient=ctx.createLinearGradient(a[0]-nx,a[1]-ny,a[0]+nx,a[1]+ny);
  gradient.addColorStop(0,'rgba(84,49,18,0)');gradient.addColorStop(.33,'rgba(84,49,18,.14)');gradient.addColorStop(.49,'rgba(84,49,18,.28)');gradient.addColorStop(.53,'rgba(255,249,221,.48)');gradient.addColorStop(.72,'rgba(255,249,221,.15)');gradient.addColorStop(1,'rgba(255,249,221,0)');
  ctx.globalAlpha=opacity;ctx.fillStyle=gradient;ctx.beginPath();ctx.moveTo(a[0]-nx,a[1]-ny);ctx.lineTo(b[0]-nx,b[1]-ny);ctx.lineTo(b[0]+nx,b[1]+ny);ctx.lineTo(a[0]+nx,a[1]+ny);ctx.closePath();ctx.fill();
  ctx.globalAlpha=opacity*.28;ctx.strokeStyle='#735232';ctx.lineWidth=.65;ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke();
 }
 function draw(ctx,coords,size=256){let lines=0;for(const level of LEVELS){const cells=2**level,spacing=256*2**(coords.z-level);if(spacing<56)continue;
   const opacity=Math.min(1,700/spacing)*Math.min(1,(spacing-56)/72);if(opacity<.015)continue;
   const left=coords.x*size/2**coords.z/(256/cells),top=coords.y*size/2**coords.z/(256/cells),span=size/spacing;
   for(let y=Math.floor(top)-1;y<=Math.floor(top+span)+1;y++)for(let x=Math.floor(left)-1;x<=Math.floor(left+span)+1;x++){
    for(const [index,line] of folds(level,x,y).entries()){shade(ctx,tilePoint(line[0],coords,size),tilePoint(line[1],coords,size),Math.min(17,Math.max(2,spacing*.026))*(index===2?.5:1),opacity*(index===2?.36:.72));lines++;}
   }
  }ctx.globalAlpha=1;return lines;}
 function addTo(map,L=window.L){const pane=map.createPane('parchmentPaper');pane.style.zIndex='350';pane.style.pointerEvents='none';pane.setAttribute('aria-hidden','true');
  const Paper=L.GridLayer.extend({createTile(coords){const tile=document.createElement('canvas'),size=this.getTileSize().x,dpr=Math.min(2,window.devicePixelRatio||1);tile.width=tile.height=size*dpr;tile.setAttribute('role','presentation');const ctx=tile.getContext('2d');ctx.scale(dpr,dpr);draw(ctx,coords,size);return tile;}});
  return new Paper({pane:'parchmentPaper',tileSize:256,updateWhenIdle:true,updateWhenZooming:false,keepBuffer:1,maxZoom:19}).addTo(map);
 }
 const api=Object.freeze({folds,tilePoint,draw,addTo});if(typeof window!=='undefined')window.PapyrusMap=api;if(typeof module!=='undefined')module.exports=api;
})();

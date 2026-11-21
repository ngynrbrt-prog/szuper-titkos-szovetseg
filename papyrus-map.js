'use strict';
(()=>{
 const LEVELS=Object.freeze([2,5,8,11,14,17,20]);
 function random(level,x,y,salt){x=((x%2**level)+2**level)%2**level;let n=Math.imul(x^Math.imul(level,374761393),668265263)^Math.imul(y,1274126177)^Math.imul(salt,2246822519);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296;}
 // Coordinates are fractions of the fixed Web Mercator world at zoom zero.
 function folds(level,x,y){const unit=256/2**level,at=(a,b)=>[(x+a)*unit,(y+b)*unit],r=n=>random(level,x,y,n);
  return [
   [at(.2+.55*r(1),0),at(.2+.55*random(level,x,y+1,1),1)],
   [at(0,.25+.5*r(3)),at(1,.25+.5*random(level,x+1,y,3))],
   [at(.12+.2*r(5),.15+.5*r(6)),at(.48+.35*r(7),.35+.5*r(8))],
   [at(.1+.4*r(9),.08+.25*r(10)),at(.45+.4*r(11),.55+.35*r(12))],
   [at(.08+.25*r(13),.55+.35*r(14)),at(.55+.35*r(15),.1+.4*r(16))]
  ];
 }
 function tilePoint(point,coords,size=256){const scale=2**coords.z;return [point[0]*scale-coords.x*size,point[1]*scale-coords.y*size];}
 function shade(ctx,a,b,width,opacity){const dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);if(!length)return;
  const nx=-dy/length*width,ny=dx/length*width;
  const gradient=ctx.createLinearGradient(a[0]-nx,a[1]-ny,a[0]+nx,a[1]+ny);
  gradient.addColorStop(0,'rgba(84,49,18,0)');gradient.addColorStop(.33,'rgba(84,49,18,.14)');gradient.addColorStop(.49,'rgba(84,49,18,.2)');gradient.addColorStop(.53,'rgba(255,249,221,.28)');gradient.addColorStop(.72,'rgba(255,249,221,.15)');gradient.addColorStop(1,'rgba(255,249,221,0)');
  ctx.globalAlpha=opacity;ctx.strokeStyle=gradient;ctx.lineWidth=width*2;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke();
  ctx.globalAlpha=opacity*.28;ctx.strokeStyle='#735232';ctx.lineWidth=.65;ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke();
 }
 function ageMarks(level,x,y){const unit=256/2**level,r=n=>random(level,x,y,n),point=(a,b)=>[(x+a)*unit,(y+b)*unit];
  return {stains:Array.from({length:3},(_,i)=>({point:point(.1+.8*r(30+i*3),.1+.8*r(31+i*3)),radius:unit*(.16+.2*r(32+i*3))})),ring:{point:point(.2+.6*r(45),.2+.6*r(46)),radius:unit*(.17+.14*r(47))},speckles:Array.from({length:22},(_,i)=>({point:point(r(70+i*3),r(71+i*3)),radius:unit*(.001+.004*r(72+i*3))})),fibres:Array.from({length:14},(_,i)=>{const a=r(150+i*4),b=r(151+i*4);return [point(a,b),point(a+.025+.06*r(152+i*4),b-.025+.05*r(153+i*4))];})};
 }
 function age(ctx,coords,level,x,y,spacing,opacity,size){const marks=ageMarks(level,x,y),scale=2**coords.z;
  ctx.globalAlpha=opacity*.82;
  for(const stamp of marks.stains){const p=tilePoint(stamp.point,coords,size),radius=stamp.radius*scale,g=ctx.createRadialGradient(p[0],p[1],0,p[0],p[1],radius);g.addColorStop(0,'rgba(111,66,20,.24)');g.addColorStop(.42,'rgba(143,88,30,.18)');g.addColorStop(.78,'rgba(136,78,24,.08)');g.addColorStop(1,'rgba(136,78,24,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(p[0],p[1],radius,0,Math.PI*2);ctx.fill();}
  const ring=tilePoint(marks.ring.point,coords,size),radius=marks.ring.radius*scale;
  ctx.globalAlpha=opacity*.38;ctx.strokeStyle='#94602d';ctx.lineWidth=Math.max(.7,spacing*.004);ctx.beginPath();ctx.arc(ring[0],ring[1],radius,.08,Math.PI*1.88);ctx.stroke();
  ctx.globalAlpha=opacity*.2;ctx.strokeStyle='#fff1ca';ctx.lineWidth=Math.max(.6,spacing*.002);ctx.beginPath();ctx.arc(ring[0],ring[1],radius*.96,.13,Math.PI*1.84);ctx.stroke();
  ctx.globalAlpha=opacity*.58*Math.min(1,1024/spacing);ctx.fillStyle='#825224';for(const spot of marks.speckles){const p=tilePoint(spot.point,coords,size);ctx.beginPath();ctx.arc(p[0],p[1],spot.radius*scale,0,Math.PI*2);ctx.fill();}
  ctx.globalAlpha=opacity*.48*Math.min(1,1024/spacing);ctx.strokeStyle='#fff4d8';ctx.lineWidth=.7;for(const line of marks.fibres){ctx.beginPath();ctx.moveTo(...tilePoint(line[0],coords,size));ctx.lineTo(...tilePoint(line[1],coords,size));ctx.stroke();}
 }
 function draw(ctx,coords,size=256){let lines=0;for(const level of LEVELS){const cells=2**level,spacing=256*2**(coords.z-level);if(spacing<56)continue;
   const opacity=Math.min(1,700/spacing)*Math.min(1,(spacing-56)/72);if(opacity<.015)continue;
   const left=coords.x*size/2**coords.z/(256/cells),top=coords.y*size/2**coords.z/(256/cells),span=size/spacing;
   for(let y=Math.floor(top)-1;y<=Math.floor(top+span)+1;y++)for(let x=Math.floor(left)-1;x<=Math.floor(left+span)+1;x++){
    age(ctx,coords,level,x,y,spacing,opacity,size);
    for(const [index,line] of folds(level,x,y).entries()){shade(ctx,tilePoint(line[0],coords,size),tilePoint(line[1],coords,size),Math.min(17,Math.max(2,spacing*.026))*(index>=2?.5:1),opacity*(index>=2?.52:.8));lines++;}
   }
  }ctx.globalAlpha=1;return lines;}
 function addTo(map,L=window.L){const pane=map.createPane('parchmentPaper');pane.style.zIndex='350';pane.style.pointerEvents='none';pane.setAttribute('aria-hidden','true');
  const Paper=L.GridLayer.extend({createTile(coords){const tile=document.createElement('canvas'),size=this.getTileSize().x,dpr=Math.min(2,window.devicePixelRatio||1);tile.width=tile.height=size*dpr;tile.setAttribute('role','presentation');const ctx=tile.getContext('2d');ctx.scale(dpr,dpr);draw(ctx,coords,size);return tile;}});
  return new Paper({pane:'parchmentPaper',tileSize:256,updateWhenIdle:true,updateWhenZooming:false,keepBuffer:1,maxZoom:19}).addTo(map);
 }
 const api=Object.freeze({folds,ageMarks,tilePoint,draw,addTo});if(typeof window!=='undefined')window.PapyrusMap=api;if(typeof module!=='undefined')module.exports=api;
})();

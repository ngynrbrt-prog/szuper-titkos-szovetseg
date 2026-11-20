const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');const root=path.join(__dirname,'..');
(async()=>{
 const r={module:{exports:{}}};vm.runInNewContext(fs.readFileSync(path.join(root,'player-rules.js'),'utf8'),r);
 let fail=false,requests=0;class FakeImage{set src(url){if(!url)return;requests++;Promise.resolve().then(()=>fail?this.onerror():this.onload());}}
 const box={module:{exports:{}},window:{PlayerRules:r.module.exports},Image:FakeImage,setTimeout,clearTimeout,Promise};vm.runInNewContext(fs.readFileSync(path.join(root,'summary-map.js'),'utf8'),box);const m=box.module.exports;
 assert.equal(m.project(0,0,0)[0],128);assert.equal(m.project(0,0,0)[1],128);assert.equal(m.segments([[47,18,'a'],[47.01,18,'a'],[47.02,18,'b']]).length,2);
 const strokes=[],context={fillRect(){},drawImage(){},save(){},beginPath(){},rect(){},clip(){},moveTo(){},lineTo(){},stroke(){strokes.push(this.strokeStyle)},arc(){},fill(){},restore(){},fillText(){}};
 const canvas={getContext:()=>context,toDataURL:()=> 'data:image/png;base64,fixture'};
 const data={city_name:'Fixture city',city_lat:47.2,city_lng:18.6,players:[{id:'one',character_name:'Player',color_id:2}],tracks:[{player_id:'one',points:[[47.2,18.6,'a'],[47.21,18.61,'a'],[47.205,18.605,'b']]}]};
 const result=await m.render(data,canvas,'https://tile.openstreetmap.org/{z}/{x}/{y}.png');assert.ok(result.url.startsWith('data:image/png'));assert.equal(result.points,3);assert.ok(result.loaded>0&&result.loaded<=16);assert.ok(strokes.includes('#2563eb'));fail=true;const failed=await m.render(data,canvas,'https://tile.openstreetmap.org/{z}/{x}/{y}.png');assert.ok(failed.failed>0);assert.equal(failed.loaded,0);
 console.log('PASS: Mercator center, sharing-gap segmentation, snapshot player color, bounded visible tiles, PNG export, tile failure reporting');
})().catch(e=>{console.error(e);throw e;});

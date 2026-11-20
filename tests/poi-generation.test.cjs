const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..'),req=require('node:module').createRequire(path.join(root,'script.js'));
const real=JSON.parse(fs.readFileSync(path.join(root,'tests/fixtures/gardony-pois.json'),'utf8'));
const source=fs.readFileSync(path.join(root,'script.js'),'utf8');
const code=source.slice(source.indexOf(' const poiCache=new Map();'),source.indexOf(' function openPlacementEditor('));
(async()=>{
 const el={randomPlacement:{disabled:false},randomRadius:{value:'3000'},randomHint:{textContent:''},createForm:{elements:{lat:{value:String(real.center[0])},lng:{value:String(real.center[1])},safe:{checked:true}}}};
 let calls=0,mode='success';const old={points:[],route:[],mordor:null};const c={Date,Map,URLSearchParams,AbortSignal,console,epoch:0,placementRequest:0,editing:true,placementContext:'draft',state:{me:{is_admin:true}},draft:old,placementPlaces:[],window:{PoiModel:req('./poi-model.js'),PlacementModel:req('./placement-model.js')},$:id=>el[id],map:{distance:req('./poi-model.js').distance,fitBounds:()=>{}},L:{latLngBounds:()=>({pad:()=>[]})},confirm:()=>true,validateCity:()=>{},setRandomPlacement:()=>{},renderDraft:()=>{},message:()=>{},fetch:async()=>{calls++;return {ok:true,json:async()=>mode==='success'?real:{elements:[]}};}};
 vm.runInNewContext(code,c);
 await c.generateAt(real.center);assert.equal(c.draft.points.length,26);assert.equal(c.draft.poi_sites.length,7);assert.equal(el.createForm.elements.safe.checked,false);assert.equal(el.randomPlacement.disabled,false);assert.equal(calls,1);
 await c.generateAt(real.center);assert.equal(calls,1,'same location should use cache');
 const saved=c.draft;mode='empty';await assert.rejects(c.generateAt([real.center[0]+.00001,real.center[1]]),/7 különböző/);assert.equal(c.draft,saved,'failed lookup must preserve previous plan');assert.equal(el.randomPlacement.disabled,false);
 el.randomPlacement.disabled=true;await c.generateAt(real.center);assert.equal(calls,2,'no concurrent lookup while disabled');
 console.log('PASS: production generateAt, live recorded venues, cache reuse, exact 26-item draft, safety reset, failed lookup preserves prior draft, concurrent lookup blocked');
})().catch(e=>{console.error(e);throw e;});

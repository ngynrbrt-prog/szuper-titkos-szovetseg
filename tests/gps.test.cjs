// node tests/gps.test.cjs — no packages required.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(require('node:path').join(__dirname, '../script.js'), 'utf8');
const gps = source.slice(source.indexOf(' function beginGPS()'), source.indexOf(" document.querySelectorAll('[data-page]')"));
const stop = source.slice(source.indexOf(' async function stopGPS()'), source.indexOf(' function beginGPS()'));
let interval, position, now = 100000;
const calls = [];
const context = {
 watch:null,lastGPS:0,heartbeat:null,session:{},document:{hidden:false},
 navigator:{geolocation:{
  watchPosition(fn){position=fn;return 7;},
  getCurrentPosition(fn,err,options){calls.push(['fresh',options.maximumAge]);fn({coords:{latitude:50,longitude:14,accuracy:5}});},
  clearWatch(id){calls.push(['clearWatch',id]);}
 }},
 setInterval(fn,ms){interval=fn;calls.push(['interval',ms]);return 9;},
 clearInterval(id){calls.push(['clearInterval',id]);},
 Date:{now:()=>now},Math,$:()=>({}),buttons(){},renderMap(){},message(){},
 async api(action,data){calls.push([action,data]);}
};
vm.createContext(context);
(async()=>{
 vm.runInContext(stop+gps+';beginGPS();',context);
 interval();
 await Promise.resolve();
 assert(calls.some(x=>x[0]==='fresh'&&x[1]===0),'Stationary device must request a fresh fix.');
 assert.equal(calls.filter(x=>x[0]==='location').length,1);
 await vm.runInContext('stopGPS()',context);
 assert(calls.some(x=>x[0]==='clearInterval'),'Stopping must cancel the GPS heartbeat.');
 now+=20000;
 position({coords:{latitude:50,longitude:14,accuracy:5}});
 assert.equal(calls.filter(x=>x[0]==='location').length,1,'Late GPS callbacks must not restart sharing.');
 console.log('PASS: stationary GPS refresh, timer cleanup, late callback rejection');
})().catch(error=>{console.error(error);process.exitCode=1;});

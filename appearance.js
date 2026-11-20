'use strict';
(() => {
 const valid=value=>value==='dark'?'dark':'light';
 function read(player){try{return valid(localStorage.getItem(player?'fellowship-theme:'+player:'fellowship-theme'));}catch{return 'light';}}
 function apply(theme){theme=valid(theme);document.documentElement.dataset.theme=theme;document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='dark'?'#111c18':'#ffffff');return theme;}
 function save(player,theme){theme=apply(theme);try{localStorage.setItem('fellowship-theme:'+player,theme);localStorage.setItem('fellowship-theme',theme);return true;}catch{return false;}}
 function account(me){return {loggedIn:!!me,admin:!!me?.is_admin,label:me?'Belépve: '+me.character_name:'Vár a Szövetség'};}
 const api={read,apply,save,account};if(typeof window!=='undefined'){window.Appearance=api;apply(read());}if(typeof module!=='undefined')module.exports=api;
})();

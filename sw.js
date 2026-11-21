'use strict';
const CACHE = 'szovetseg-pwa-1.9.7';
const PREFIX = 'szovetseg-pwa-';
const FILES = ['rescue-notices.js?v=1.9.7','offline.html','native-bridge.js?v=1.9.7','vendor/supabase-2.119.2.js','player-rules.js?v=1.9.7','summary-map.js?v=1.9.7','assets/ring.svg','poi-model.js?v=1.9.7','appearance.js?v=1.9.7','vendor/leaflet.css','vendor/leaflet.js','style.css?v=1.9.7','config.js?v=1.3.0','map-model.js?v=1.9.7','placement-model.js?v=1.9.7','script.js?v=1.9.7','pwa.js?v=1.9.7','manifest.webmanifest','assets/sauron-helmet.svg','assets/app-180.png','assets/app-192.png','assets/app-512.png'];
const ALLOWED = new Set(FILES.map(p => new URL(p,self.registration.scope).href));
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith(PREFIX) && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('message', e => { if(e.data?.type === 'ACTIVATE_UPDATE') self.skipWaiting(); });
self.addEventListener('fetch', e => {
 const r=e.request, u=new URL(r.url);
 if(r.method !== 'GET' || u.origin !== self.location.origin) return;
 if(r.mode === 'navigate') {
  e.respondWith(fetch(r).catch(() => caches.open(CACHE).then(c => c.match('offline.html'))));
  return;
 }
 if(!ALLOWED.has(u.href)) return;
 e.respondWith(caches.open(CACHE).then(async c => {
  const cached=await c.match(r);
  if(cached) return cached;
  return fetch(r); // Do not mix a newly deployed asset into an older release cache.
 }));
});

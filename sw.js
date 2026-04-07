var CACHE = 'pinvest-v31';
var ASSETS = [
  '/style.css', '/menu.js', '/audio.js', '/translator.js',
  '/logo-project-invest.jpg', '/manifest.json'
];

self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    })
  );
  clients.claim();
});

self.addEventListener('fetch', function(e){
  var url = e.request.url;
  // Ne jamais cacher les fichiers HTML — toujours réseau
  if (url.indexOf('.html') !== -1 || url.endsWith('/')) {
    e.respondWith(
      fetch(e.request).catch(function(){
        return caches.match(e.request).then(function(cached){
          return cached || new Response('Hors ligne', { status: 503 });
        });
      })
    );
    return;
  }
  // Pour les autres fichiers (CSS, JS, images) : réseau en premier, cache en fallback
  e.respondWith(
    fetch(e.request).then(function(r){
      var clone = r.clone();
      caches.open(CACHE).then(function(c){ c.put(e.request, clone); });
      return r;
    }).catch(function(){
      return caches.match(e.request).then(function(cached){
        return cached || new Response('Hors ligne', { status: 503 });
      });
    })
  );
});

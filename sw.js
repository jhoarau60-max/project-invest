// SW v32 — efface tous les caches et se désinstalle
self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(k) { return caches.delete(k); }));
    }).then(function() {
      return clients.claim();
    }).then(function() {
      return clients.matchAll({ includeUncontrolled: true });
    }).then(function(clients) {
      clients.forEach(function(c) { c.postMessage({ type: 'RELOAD' }); });
    })
  );
});

self.addEventListener('fetch', function(e) {
  // Tout passe par le réseau, rien n'est mis en cache
  e.respondWith(fetch(e.request));
});

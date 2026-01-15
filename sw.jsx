const CACHE_NAME = 'notizen_online-v5'; 
const ASSETS = [
  'index.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'favicon.svg'
];

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 🚫 Firestore niemals über Service Worker laufen lassen
  if (url.origin === 'https://firestore.googleapis.com') {
    return; // direkt ans Netzwerk, kein respondWith!
  }

  // --- REST DEINES CODES ---





self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Lösche alten Cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Strategie: Hybrid mit Timeout für HTML
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (event.request.mode === 'navigate') {
    event.respondWith(
      // Timeout-Logik: Netzwerkversuch vs. 3-Sekunden-Timer
      Promise.race([
        fetch(event.request).then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 3000)
        )
      ]).catch(() => caches.match(event.request)) // Bei Timeout oder Offline: Cache
    );
    return;
  }

  // Stale-While-Revalidate für alle anderen Assets (Bilder, JS, CSS)
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
        return cachedResponse || fetchPromise;
      });
    })
  );
});

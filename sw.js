const CACHE_NAME = 'Notizen Online'; // Ändere v2 zu v3, v4 etc., um Updates zu erzwingen
const ASSETS = [
  'index.html',
  'manifest.json'
  'icon-192.png'
  'icon-512.png'
];

// Installation: Dateien in den Cache laden
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  // Aktiviert den neuen Service Worker sofort, ohne auf das Schließen der App zu warten
  self.skipWaiting();
});

// Aktivierung: Alten Cache löschen, wenn die Version (CACHE_NAME) geändert wurde
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

// Strategie: Network-First
// Versucht erst das Netzwerk, bei Fehler (Offline) wird der Cache genutzt
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

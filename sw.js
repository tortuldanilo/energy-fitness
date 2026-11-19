const CACHE = 'energy-v1';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Red primero para archivos propios (así los cambios se ven al instante); caché si no hay internet.
// Las llamadas a la API (otro dominio, POST) nunca se cachean.
self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(
    fetch(r)
      .then((res) => { const copia = res.clone(); caches.open(CACHE).then((c) => c.put(r, copia)); return res; })
      .catch(() => caches.match(r).then((m) => m || caches.match('./index.html')))
  );
});

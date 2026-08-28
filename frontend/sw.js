self.addEventListener('install', (e) => {
    console.log('[Service Worker] Installed');
});

self.addEventListener('fetch', (e) => {
    // Wir leiten vorerst alle Requests ganz normal durch
    e.respondWith(fetch(e.request));
});
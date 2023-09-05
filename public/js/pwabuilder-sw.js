importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

var CACHE_NAME = 'mania_v32.4'

workbox.routing.registerRoute(
    /\.(?:js|css|webp|png|svg|html)$/,
    new workbox.strategies.StaleWhileRevalidate({
        cacheName: CACHE_NAME,
    })
);
self.addEventListener('install', function (event) {
    self.skipWaiting();
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
self.addEventListener('activate', evt => {
    // self.skipWaiting();
    evt.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    console.log("CACHENAME", cacheName);
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    )
}
);

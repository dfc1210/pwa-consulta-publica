const CACHE_NAME = 'v1';
const ASSETS = [
    './',
    './index.html',
    './app.js',
    './manifest.json',
    'https://cdn.jsdelivr.net/npm/vue@2.7.16/dist/vue.js',
    'https://cdn.jsdelivr.net/npm/vue-router@3.6.5/dist/vue-router.js'
];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', e => {
    e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});

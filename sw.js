const CACHE_NAME = 'sticker-v3';
const ASSETS_TO_CACHE = [
	'./',
	'./index.html',
	'./style.css',
	'./app.js',
	'./manifest.json',
	'./icon.jpg'
];

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
	);
});

self.addEventListener('fetch', (event) => {
	event.respondWith(
		caches.match(event.request).then((cachedResponse) => cachedResponse || fetch(event.request))
	);
});

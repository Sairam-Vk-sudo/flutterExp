const CACHE_NAME = 'dairy-app-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/main.dart.js',
  '/flutter.js',
  '/icons/Icon-192.png',
  '/icons/Icon-512.png',
  '/manifest.json',
  // Add any other assets you want cached
];

// Install event – caching resources
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activate event – cleanup old caches
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache:', name);
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event – serve from cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});

// Push event – display notification
self.addEventListener('push', event => {
  console.log('[ServiceWorker] Push Received.');

  const data = event.data ? event.data.text() : 'You have a new message!';
  const options = {
    body: data,
    icon: 'icons/Icon-192.png',
    badge: 'icons/Icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  // Ensure permission was granted before showing notification
  if (Notification.permission === 'granted') {
    event.waitUntil(
      self.registration.showNotification('📬 Dairy App Notification', options)
    );
  } else {
    console.warn('Notification permission not granted.');
  }
});

// Sync event – for background sync
self.addEventListener('sync', function(event) {
  if (event.tag === 'sync-dairy-data') {
    event.waitUntil(syncDairyData());
  }
});

// Dummy background sync function
async function syncDairyData() {
  console.log('[ServiceWorker] Syncing dairy data...');
  // Your background sync logic goes here
}

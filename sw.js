/* Wayfaria Service Worker - Offline Support */
const CACHE_NAME = 'wayfaria-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg'
];

// Install event — cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Fetch event — serve from cache or network
self.addEventListener('fetch', event => {
  if (event.request.destination === 'image') {
    // Image lazy loading + caching
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(event.request).then(response => {
          return response || fetch(event.request).then(networkResponse => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
  } else {
    // Other assets — cache first, then network
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
  }
});

// Push notifications (for weather alerts, flight updates)
self.addEventListener('push', event => {
  const data = event.data?.json() || {};
  const options = {
    body: data.body || 'New travel alert!',
    icon: '/icons/icon-192.svg',
    badge: '/icons/icon-72.svg',
    actions: [
      { action: 'view', title: 'View Details' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };
  event.waitUntil(
    self.registration.showNotification(data.title || 'Wayfaria', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Background sync for offline form submissions
self.addEventListener('sync', event => {
  if (event.tag === 'sync-trip-data') {
    event.waitUntil(syncTripData());
  }
});

function syncTripData() {
  // Placeholder — actual implementation would send queued data
  console.log('Syncing trip data in background...');
}
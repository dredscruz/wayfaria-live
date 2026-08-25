/* Wayfaria Service Worker - Offline Support & Caching */
const CACHE_NAME = 'wayfaria-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icons/logo-192.svg',
  '/icons/logo-512.svg'
];

// Install event — cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Fetch event — serve from cache or network
self.addEventListener('fetch', event => {
  if (event.request.destination === 'image') {
    // Images: cache first, then network
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(event.request).then(response => {
          if (response) return response;
          return fetch(event.request).then(networkResponse => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
  } else {
    // Other assets: network first, fallback to cache
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
  }
});

// Push notifications
self.addEventListener('push', event => {
  const data = event.data?.json() || {};
  self.registration.showNotification(
    data.title || 'Wayfaria',
    {
      body: data.body || 'You have a travel update!',
      icon: '/icons/logo-192.svg',
      badge: '/icons/logo-192.svg'
    }
  );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});
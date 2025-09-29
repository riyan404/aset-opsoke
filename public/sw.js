// Service Worker - DISABLED for debugging
// Temporarily disable service worker to fix loading issues

self.addEventListener('install', (event) => {
  // Skip waiting and activate immediately
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  // Clear all caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.delete(cacheName)
        })
      )
    }).then(() => {
      // Take control of all clients immediately
      return self.clients.claim()
    })
  )
})

self.addEventListener('fetch', (event) => {
  // Don't cache anything - pass through all requests
  event.respondWith(fetch(event.request))
})
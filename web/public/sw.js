/* eslint-disable no-undef */
/**
 * Service worker for the Drive web app.
 *
 * Strategy: network-first ("fetch first") for all API calls.
 *  - Try the network first.
 *  - On success, cache a clone of the response (GET only) and return it.
 *  - On failure (offline / server unreachable), fall back to the cached copy.
 *
 * The API origin is passed in via the `apiUrl` query param when the worker is
 * registered (see src/registerServiceWorker.ts), since a static SW file has no
 * access to Vite's import.meta.env at build time.
 */

const API_CACHE = 'api-cache-v1'

// Base URL of the backend API, provided at registration time.
const API_URL = new URL(self.location).searchParams.get('apiUrl') || ''
let API_ORIGIN = ''
let API_PATH_PREFIX = ''
if (API_URL) {
  try {
    const parsed = new URL(API_URL)
    API_ORIGIN = parsed.origin
    // Preserve any path prefix (e.g. https://host/api) so we only match API calls.
    API_PATH_PREFIX = parsed.pathname.replace(/\/$/, '')
  } catch {
    /* invalid apiUrl — no API caching */
  }
}

self.addEventListener('install', () => {
  // Activate the new worker as soon as it finishes installing.
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Drop stale caches from previous versions.
      const keys = await caches.keys()
      await Promise.all(keys.filter((key) => key !== API_CACHE).map((key) => caches.delete(key)))
      await self.clients.claim()
    })(),
  )
})

/** Whether a request targets the backend API. */
function isApiRequest(url) {
  if (!API_ORIGIN) return false
  if (url.origin !== API_ORIGIN) return false
  return API_PATH_PREFIX ? url.pathname.startsWith(API_PATH_PREFIX) : true
}

/** Network-first: fetch, cache the fresh response, fall back to cache when offline. */
async function networkFirst(request) {
  const cache = await caches.open(API_CACHE)
  try {
    const response = await fetch(request)
    // Only GET responses are cacheable; skip opaque/error responses too.
    if (request.method === 'GET' && response && response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    const cached = await cache.match(request)
    if (cached) return cached
    throw error
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (!isApiRequest(url)) return // let the browser handle non-API requests normally

  event.respondWith(networkFirst(request))
})

/**
 * Registers the service worker and passes the API base URL to it so it can
 * apply a network-first ("fetch first") caching strategy to all API calls.
 */
export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return
  if (!import.meta.env.PROD) return // avoid caching during dev / HMR

  const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:6010'
  const swUrl = `/sw.js?apiUrl=${encodeURIComponent(apiUrl)}`

  window.addEventListener('load', () => {
    navigator.serviceWorker.register(swUrl).catch((error) => {
      console.error('Service worker registration failed:', error)
    })
  })
}

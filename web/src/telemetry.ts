import { initializeFaro, getWebInstrumentations } from '@grafana/faro-web-sdk'

/**
 * Initializes Grafana Faro to collect frontend telemetry (logs, console
 * output and unhandled errors) and ship it to the Alloy Faro receiver
 * (see telemetry/compose.yml). Enabled only when a collector URL is set.
 */
export function initTelemetry(): void {
  const url = import.meta.env.VITE_FARO_URL
  if (!url) return // telemetry disabled unless a collector URL is configured

  initializeFaro({
    url,
    app: {
      name: 'bunker-web',
      version: __APP_VERSION__,
      environment: import.meta.env.MODE,
    },
    instrumentations: getWebInstrumentations(),
  })
}

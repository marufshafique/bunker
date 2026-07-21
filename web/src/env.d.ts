/// <reference types="vite/client" />

// Injected at build time from package.json (see vite.config.ts).
declare const __APP_VERSION__: string

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  // Grafana Faro collector URL; telemetry is disabled when unset.
  readonly VITE_FARO_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

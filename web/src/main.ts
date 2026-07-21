import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import { ormPlugin } from '@/stores/orm'
// import { registerServiceWorker } from '@/registerServiceWorker'
import { initTelemetry } from '@/telemetry'

initTelemetry()

const app = createApp(App)

const pinia = createPinia()
pinia.use(ormPlugin)
app.use(pinia)

app.use(router)
app.mount('#app')

// registerServiceWorker()

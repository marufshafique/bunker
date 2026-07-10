import axios from 'axios'
import type { App, InjectionKey } from 'vue'
import type { AxiosInstance } from 'axios'

const http = axios.create({
  baseURL: 'http://localhost:7000',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const httpKey: InjectionKey<AxiosInstance> = Symbol('http')

export default {
  install(app: App) {
    app.provide(httpKey, http)
  },
}

export { http }
export type { AxiosInstance }

import axios from 'axios'
import { createORM, useRepo as _useRepo } from 'pinia-orm'
import { createPiniaOrmAxios } from '@pinia-orm/axios'
import type { Pinia } from 'pinia'
import { DriveFile } from '@/models/DriveFile'

export { useRepo } from 'pinia-orm'

/** Shared axios instance used by api.ts and the ORM axios plugin. */
export const http = axios.create({
  baseURL: 'http://localhost:7000',
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Call once in main.ts: `pinia.use(ormPlugin)`.
 */
export const ormPlugin = createORM({
  plugins: [createPiniaOrmAxios({ axios: http })],
})

/**
 * Convenience: typed useRepo for the DriveFile model.
 * Use inside components:
 *   const fileRepo = useDriveFileRepo()
 *   fileRepo.all()       // reactive collection
 *   fileRepo.save(data)  // persist API result
 */
export function useDriveFileRepo(pinia?: Pinia) {
  return _useRepo(DriveFile, pinia)
}

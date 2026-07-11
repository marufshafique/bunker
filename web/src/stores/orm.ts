import axios from 'axios'
import { createORM, useRepo } from 'pinia-orm'
import { createPiniaOrmAxios } from '@pinia-orm/axios'
import type { Pinia } from 'pinia'
import { DriveFileRepository } from '@/repositories/DriveFileRepository'

export { useRepo } from 'pinia-orm'

/** Shared axios instance used by the ORM axios plugin. */
const http = axios.create({
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
 * Typed repository for the DriveFile model.
 *
 * Use inside components:
 *   const fileRepo = useDriveFileRepo()
 *   await fileRepo.list()          // fetch & auto-persist
 *   await fileRepo.upload(file)    // upload & auto-persist
 *   await fileRepo.remove(id)      // delete & auto-remove
 *   fileRepo.all()                 // reactive collection
 */
export function useDriveFileRepo(pinia?: Pinia): DriveFileRepository {
  return useRepo(DriveFileRepository, pinia)
}

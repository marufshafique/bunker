import axios from 'axios'
import { createORM, useRepo } from 'pinia-orm'
import { createPiniaOrmAxios } from '@pinia-orm/axios'
import type { Pinia } from 'pinia'
import { DriveFileRepository } from '@/repositories/DriveFileRepository'
import { FolderRepository } from '@/repositories/FolderRepository'

export { useRepo } from 'pinia-orm'

/** Shared axios instance used by the ORM axios plugin. */
const http = axios.create({
  baseURL: 'http://localhost:7000',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const ormPlugin = createORM({
  plugins: [createPiniaOrmAxios({ axios: http })],
})

export function useDriveFileRepo(pinia?: Pinia): DriveFileRepository {
  return useRepo(DriveFileRepository, pinia)
}

export function useFolderRepo(pinia?: Pinia): FolderRepository {
  return useRepo(FolderRepository, pinia)
}

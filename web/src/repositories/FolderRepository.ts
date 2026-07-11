import { AxiosRepository, type Response } from '@pinia-orm/axios'
import { Folder } from '@/models/Folder'

export interface CreateFolderPayload {
  name: string
  folder_id?: string | null
}

export class FolderRepository extends AxiosRepository<Folder> {
  static useModel = Folder

  async list(): Promise<Response> {
    return this.api().get('/folders')
  }

  async get(id: string): Promise<Response> {
    return this.api().get(`/folders/${id}`)
  }

  async create(payload: CreateFolderPayload): Promise<Response> {
    return this.api().post('/folders', payload)
  }

  async remove(id: string): Promise<Response> {
    return this.api().delete(`/folders/${id}`, { delete: id })
  }
}

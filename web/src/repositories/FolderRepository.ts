import { type Response } from '@pinia-orm/axios'
import { Folder } from '@/models/Folder'
import CachedRepository from './CachedRepository'

export interface CreateFolderPayload {
  name: string
  folder_id?: string | null
}

export class FolderRepository extends CachedRepository<Folder> {
  static useModel = Folder

  foldersById(folderId: string | null): Folder[] {
    return this.query().where('folder_id', folderId).get()
  }

  async list(folderId?: string | null): Promise<Folder[]> {
    const url = folderId ? `/folders/${folderId}` : '/folders'

    return this.getCachedAll(
      url,
      `folders_list_${folderId ?? 'root'}`,
    )
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

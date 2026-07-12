import { AxiosRepository, type Response } from '@pinia-orm/axios'
import { Folder } from '@/models/Folder'

export interface CreateFolderPayload {
  name: string
  folder_id?: string | null
}

export class FolderRepository extends AxiosRepository<Folder> {
  static useModel = Folder

  foldersById(folderId: string | null): Folder[] {
    return this.query().where('folder_id', folderId).get()
  }

  async list(folderId?: string | null): Promise<Response> {
    const params: Record<string, string> = {}
    if (folderId) {
      params.folder_id = folderId
    }
    return this.api().get('/folders', { params })
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

import { type Response } from '@pinia-orm/axios'
import type { AxiosRequestConfig } from 'axios'
import { DriveFile } from '@/models/DriveFile'
import CachedRepository from './CachedRepository'

export class DriveFileRepository extends CachedRepository<DriveFile> {
  static useModel = DriveFile

  filesByFolderId(folderId: string | null): DriveFile[] {
    return this.query()
      .where('folder_id', folderId as any)
      .get()
  }

  async list(folderId?: string | null): Promise<DriveFile[]> {
    const params = new URLSearchParams()

    if (folderId) {
      params.append('folder_id', folderId)
    }

    return this.getCachedAll(
      `/files?${params.toString()}`,
      `files_list_${folderId ?? 'root'}`,
    )
  }

  async upload(
    file: File,
    folderId?: string | null,
    folderName?: string | null,
  ): Promise<Response> {
    const formData = new FormData()
    formData.append('file', file)
    const params: Record<string, string> = {}

    if (folderId) {
      params.folder_id = folderId
    }

    if (folderName) {
      params.folder_name = folderName
    }

    return this.api().post('/files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params,
      onUploadProgress: (progressEvent) => {
        console.log(progressEvent)

        const progress = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total ?? 1),
        )

        console.log(`Upload progress: ${progress}%`)
      },
    })
  }

  async remove(id: string): Promise<Response> {
    return this.api().delete(`/files/${id}`, { delete: id })
  }

  async download(id: string, filename: string): Promise<void> {
    const res = await this.api().get(`/files/${id}/download`, {
      save: false,
      responseType: 'blob',
    } as AxiosRequestConfig)

    const blob = res.response.data as Blob
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')

    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}

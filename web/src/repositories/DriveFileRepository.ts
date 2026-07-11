import { AxiosRepository, type Response } from '@pinia-orm/axios'
import type { AxiosRequestConfig } from 'axios'
import { DriveFile } from '@/models/DriveFile'

export class DriveFileRepository extends AxiosRepository<DriveFile> {
  static useModel = DriveFile

  async list(): Promise<Response> {
    return this.api().get('/files')
  }

  async upload(file: File): Promise<Response> {
    const formData = new FormData()
    formData.append('file', file)
    return this.api().post('/files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
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

import { http } from '@/stores/orm'

export interface BackendFile {
  id: string
  original_name: string
  storage_path: string
  file_size_bytes: number
  mime_type: string
  uploaded_at: string
}

export async function uploadFile(file: File): Promise<BackendFile> {
  const formData = new FormData()
  formData.append('file', file)

  const { data } = await http.post<BackendFile>('/files', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function listFiles(): Promise<BackendFile[]> {
  const { data } = await http.get<BackendFile[]>('/files')
  return data
}

export async function deleteFile(id: string): Promise<void> {
  await http.delete(`/files/${id}`)
}

export async function downloadFile(
  id: string,
  filename: string,
): Promise<void> {
  const { data } = await http.get(`/files/${id}/download`, {
    responseType: 'blob',
  })
  const url = URL.createObjectURL(data)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

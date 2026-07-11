import { Model } from 'pinia-orm'

export class DriveFile extends Model {
  static entity = 'driveFiles'
  static primaryKey = 'id'

  // Declare typed properties (fields are defined via `fields()`)
  declare id: string
  declare original_name: string
  declare storage_path: string
  declare file_size_bytes: number
  declare mime_type: string
  declare uploaded_at: string

  static fields() {
    return {
      id: this.string(''),
      original_name: this.string(''),
      storage_path: this.string(''),
      file_size_bytes: this.number(0),
      mime_type: this.string(''),
      uploaded_at: this.string(''),
    }
  }

  /** Convenience: total size formatted for display. */
  get displaySize(): string {
    const bytes = this.file_size_bytes

    if (bytes === 0) {
      return '—'
    }

    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return (
      parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
    )
  }

  /** Convenience: creation date as a timestamp (ms). */
  get createdAtTs(): number {
    return new Date(this.uploaded_at).getTime()
  }

  /** DriveItem-compatible shape used by DriveContent. */
  toDriveItem() {
    return {
      id: this.id,
      name: this.original_name,
      isFolder: false,
      size: this.file_size_bytes,
      createdAt: this.createdAtTs,
    }
  }
}

import { Model } from 'pinia-orm'

export class Folder extends Model {
  static entity = 'folders'
  static primaryKey = 'id'

  declare id: string
  declare name: string
  declare folder_id: string | null
  declare created_at: string

  static fields() {
    return {
      id: this.string(''),
      name: this.string(''),
      folder_id: this.string(null),
      created_at: this.string(''),
    }
  }

  get isRoot(): boolean {
    return this.folder_id === null
  }

  toDriveItem() {
    return {
      id: this.id,
      name: this.name,
      isFolder: true,
      size: 0,
      createdAt: new Date(this.created_at).getTime(),
    }
  }
}

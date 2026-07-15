import { AxiosRepository } from '@pinia-orm/axios'
import type { Model } from 'pinia-orm'

export default class CachedRepository<
  T extends Model,
> extends AxiosRepository<T> {
  /** Strong-reference cache: persists until explicitly cleared or page unloads. */
  protected static store = new Map<string, Model[]>()

  async getCachedAll(
    endpoint: string,
    cacheKey: string,
  ): Promise<T[]> {
    const cached = CachedRepository.store.get(cacheKey)
    if (cached) {
      return cached as T[]
    }

    await this.api().get(endpoint)

    const data = this.all() as T[]
    CachedRepository.store.set(cacheKey, data)

    return data
  }
}

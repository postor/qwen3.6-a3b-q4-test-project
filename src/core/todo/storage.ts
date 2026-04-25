const canUseStorage = typeof localStorage !== 'undefined'

export const todoStorage = {
  get<T>(key: string): T[] {
    if (!canUseStorage) return [] as T[]
    try {
      const data = localStorage.getItem(key)
      if (!data) return [] as T[]
      return JSON.parse(data) as T[]
    } catch (e: unknown) {
      console.error(`[todoStorage] failed to read "${key}":`, e)
      return [] as T[]
    }
  },

  set<T>(key: string, items: T[]): void {
    if (!canUseStorage) return
    try {
      localStorage.setItem(key, JSON.stringify(items))
    } catch (e) {
      console.warn(`[todoStorage] failed to write "${key}"`, e)
    }
  },

  clear(key: string): void {
    if (!canUseStorage) return
    try {
      localStorage.removeItem(key)
    } catch (e) {
      console.warn(`[todoStorage] failed to clear "${key}"`, e)
    }
  },
}

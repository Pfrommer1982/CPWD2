export interface ServiceLocaleItem {
  number: string
  title: string
  desc: string
  tags: string[]
}

export function localeList<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[]
  if (raw && typeof raw === 'object') {
    return Object.values(raw as Record<string, T>)
  }
  return []
}

export function localeTags(raw: unknown): string[] {
  return localeList<string>(raw)
}

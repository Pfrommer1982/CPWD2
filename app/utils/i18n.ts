import type { LocaleMessageValue } from '@intlify/core-base'

export interface ServiceLocaleItem {
  number: string
  title: string
  desc: string
  tags: string[]
}

export function resolveLocaleMessage(
  value: unknown,
  rt: (message: LocaleMessageValue) => string,
): string {
  if (typeof value === 'string') return value
  if (value == null) return ''
  return rt(value as LocaleMessageValue)
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

export function flattenTranslationKeys(
  value: unknown,
  prefix = '',
): string[] {
  if (value === null || value === undefined) {
    return prefix ? [prefix] : []
  }

  if (Array.isArray(value)) {
    return prefix ? [prefix] : []
  }

  if (typeof value !== 'object') {
    return prefix ? [prefix] : []
  }

  return Object.entries(value as Record<string, unknown>).flatMap(([key, nested]) => {
    const path = prefix ? `${prefix}.${key}` : key
    if (
      nested !== null
      && typeof nested === 'object'
      && !Array.isArray(nested)
    ) {
      return flattenTranslationKeys(nested, path)
    }
    return [path]
  })
}

import { readdirSync } from 'node:fs'
import { join } from 'node:path'

export const I18N_LOCALES = ['nl', 'en'] as const
export type LocaleCode = (typeof I18N_LOCALES)[number]

export const I18N_DEFAULT_LOCALE: LocaleCode = 'nl'
export const I18N_FALLBACK_LOCALE: LocaleCode = 'en'

export const I18N_LOCALE_NAMES: Record<LocaleCode, string> = {
  nl: 'Nederlands',
  en: 'English',
}

export const I18N_ROOT = join(process.cwd(), 'app/i18n/locales')

export function getNamespaceFiles(): string[] {
  return readdirSync(join(I18N_ROOT, I18N_DEFAULT_LOCALE))
    .filter(file => file.endsWith('.json'))
    .sort()
}

export function createI18nLocaleConfig() {
  const namespaceFiles = getNamespaceFiles()

  return I18N_LOCALES.map(code => ({
    code,
    name: I18N_LOCALE_NAMES[code],
    files: namespaceFiles.map(file => `${code}/${file}`),
  }))
}

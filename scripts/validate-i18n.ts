import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import {
  I18N_FALLBACK_LOCALE,
  I18N_LOCALES,
  I18N_ROOT,
} from '../app/i18n/config.ts'
import { flattenTranslationKeys } from '../app/utils/i18n.ts'

type LocaleCode = (typeof I18N_LOCALES)[number]

function readLocaleFile(locale: LocaleCode, file: string): unknown {
  const path = join(I18N_ROOT, locale, file)
  return JSON.parse(readFileSync(path, 'utf8'))
}

function diffKeys(base: Set<string>, compare: Set<string>) {
  return {
    missing: [...base].filter(key => !compare.has(key)).sort(),
    extra: [...compare].filter(key => !base.has(key)).sort(),
  }
}

function main() {
  const localeFiles = Object.fromEntries(
    I18N_LOCALES.map(locale => [
      locale,
      readdirSync(join(I18N_ROOT, locale))
        .filter(file => file.endsWith('.json'))
        .sort(),
    ]),
  ) as Record<LocaleCode, string[]>

  const referenceLocale = I18N_FALLBACK_LOCALE
  const referenceFiles = localeFiles[referenceLocale]
  let hasErrors = false

  for (const locale of I18N_LOCALES) {
    if (locale === referenceLocale) continue

    const missingFiles = referenceFiles.filter(file => !localeFiles[locale].includes(file))
    const extraFiles = localeFiles[locale].filter(file => !referenceFiles.includes(file))

    for (const file of missingFiles) {
      hasErrors = true
      console.error(`✗ ${locale} missing file: ${file}`)
    }

    for (const file of extraFiles) {
      hasErrors = true
      console.error(`✗ ${locale} extra file: ${file}`)
    }
  }

  for (const file of referenceFiles) {
    const keysByLocale = Object.fromEntries(
      I18N_LOCALES.map(locale => [
        locale,
        new Set(flattenTranslationKeys(readLocaleFile(locale, file))),
      ]),
    ) as Record<LocaleCode, Set<string>>

    const referenceKeys = keysByLocale[referenceLocale]
    let fileHasErrors = false
    const fileErrors: string[] = []

    for (const locale of I18N_LOCALES) {
      if (locale === referenceLocale) continue

      const { missing, extra } = diffKeys(referenceKeys, keysByLocale[locale])

      for (const key of missing) {
        fileHasErrors = true
        fileErrors.push(`  ${locale}.${key}`)
      }

      for (const key of extra) {
        fileHasErrors = true
        fileErrors.push(`  ${locale}.${key} (extra)`)
      }
    }

    if (fileHasErrors) {
      hasErrors = true
      console.error(`✗ ${file} key mismatch:`)
      fileErrors.forEach(line => console.error(line))
    } else {
      console.log(`✓ ${file} is consistent`)
    }
  }

  if (hasErrors) {
    process.exit(1)
  }

  console.log('\nAll locale files are consistent.')
}

main()

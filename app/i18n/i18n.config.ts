export default defineI18nConfig(() => ({
  legacy: false,
  locale: 'nl',
  fallbackLocale: 'en',
  missingWarn: import.meta.dev,
  fallbackWarn: import.meta.dev,
  missing: (locale, key) => {
    if (import.meta.dev) {
      console.warn(`[i18n] Missing translation (${locale}): ${key}`)
    }
    return key
  },
}))

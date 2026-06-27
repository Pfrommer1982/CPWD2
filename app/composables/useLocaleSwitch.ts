type LocaleCode = 'nl' | 'en'

export function useLocaleSwitch() {
  const { locale, setLocale } = useI18n()

  async function switchLocale(code: LocaleCode) {
    if (locale.value === code) return
    await setLocale(code)
  }

  return {
    locale,
    switchLocale,
  }
}

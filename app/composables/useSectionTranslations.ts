import type { LocaleMessageValue, VueMessageType } from '@intlify/core-base'

type TranslateArgs = [key: string, ...unknown[]]

export function useSectionTranslations(namespace: string) {
  const i18n = useI18n()

  const prefix = (key: string) => `${namespace}.${key}`

  return {
    namespace,
    t: (key: string, ...args: unknown[]) => i18n.t(prefix(key), ...(args as TranslateArgs)),
    tm: <T = VueMessageType | string>(key: string) => i18n.tm(prefix(key)) as T,
    te: (key: string) => i18n.te(prefix(key)),
    rt: (message: LocaleMessageValue) => i18n.rt(message),
  }
}

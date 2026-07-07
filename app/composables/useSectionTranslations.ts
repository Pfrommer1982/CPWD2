import type { LocaleMessageValue, MessageType } from '@intlify/core-base'

export function useSectionTranslations(namespace: string) {
  const i18n = useI18n()

  const prefix = (key: string) => `${namespace}.${key}`

  return {
    namespace,
    t: (key: string, ...args: unknown[]) => i18n.t(prefix(key), ...(args as [Record<string, unknown>])),
    tm: <T = MessageType>(key: string) => i18n.tm(prefix(key)) as T,
    te: (key: string) => i18n.te(prefix(key)),
    rt: (message: LocaleMessageValue) => i18n.rt(message as MessageType),
  }
}

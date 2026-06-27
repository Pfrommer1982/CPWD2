export default defineNuxtRouteMiddleware(async (to) => {
  const match = to.path.match(/^\/en(\/|$)/)
  if (!match) return

  const path = to.path.replace(/^\/en/, '') || '/'
  const localeCookie = useCookie('i18n_locale')
  localeCookie.value = 'en'

  if (import.meta.client) {
    await useNuxtApp().$i18n.setLocale('en')
  }

  return navigateTo(
    { path, query: to.query, hash: to.hash },
    { redirectCode: 301, replace: true },
  )
})

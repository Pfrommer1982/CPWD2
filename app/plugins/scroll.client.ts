export default defineNuxtPlugin((nuxtApp) => {
  if (!import.meta.client) return

  const { init, refresh, scrollToTop } = useLenis()

  nuxtApp.hook('app:mounted', () => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
    init()
  })

  nuxtApp.hook('page:start', () => {
    scrollToTop()
  })

  nuxtApp.hook('page:finish', () => {
    scrollToTop()
    refresh()
  })
})

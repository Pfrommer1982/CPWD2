export default defineNuxtPlugin((nuxtApp) => {
  if (!import.meta.client) return

  const router = useRouter()
  const { init, refresh, scrollToTop } = useLenis()

  function resetScrollPosition() {
    scrollToTop()

    import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
      ScrollTrigger.clearScrollMemory?.()
      ScrollTrigger.refresh(true)
    }).catch(() => {})
  }

  nuxtApp.hook('app:mounted', () => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
    init()
    resetScrollPosition()
  })

  router.beforeEach(() => {
    resetScrollPosition()
  })

  router.afterEach(async () => {
    resetScrollPosition()
    await nextTick()
    resetScrollPosition()
    requestAnimationFrame(() => {
      resetScrollPosition()
      refresh()
    })
  })

  nuxtApp.hook('page:finish', () => {
    resetScrollPosition()
    refresh()
  })
})

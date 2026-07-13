import { forceScrollToTop } from '~/utils/scrollReset'

const PAGE_TRANSITION_MS = 650

let scrollTriggerModule: typeof import('gsap/ScrollTrigger') | null = null

async function getScrollTrigger() {
  if (!scrollTriggerModule) {
    scrollTriggerModule = await import('gsap/ScrollTrigger')
    const { init } = useGsap()
    await init()
  }
  return scrollTriggerModule.ScrollTrigger
}

function unblockBodyScroll() {
  document.body.style.overflow = ''
  document.documentElement.style.overflow = ''
}

function ensureScrollAtTop() {
  unblockBodyScroll()
  forceScrollToTop()

  const { scrollToTop, lenis } = useLenis()
  scrollToTop()
  lenis?.scrollTo(0, { immediate: true, force: true })
}

async function clearLeavingPageScroll() {
  ensureScrollAtTop()

  try {
    const ScrollTrigger = await getScrollTrigger()
    ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    ScrollTrigger.clearScrollMemory?.()
    ScrollTrigger.refresh(true)
  }
  catch {
    // GSAP not loaded yet — native scroll reset above is enough.
  }

  ensureScrollAtTop()
}

async function clearScrollMemory() {
  try {
    const ScrollTrigger = await getScrollTrigger()
    ScrollTrigger.clearScrollMemory?.()
  }
  catch {
    // GSAP not loaded yet.
  }
}

function schedulePostTransitionResets() {
  window.setTimeout(() => {
    void clearScrollMemory()
    ensureScrollAtTop()
    void useLenis().refresh()
  }, PAGE_TRANSITION_MS)

  requestAnimationFrame(() => {
    ensureScrollAtTop()
    requestAnimationFrame(() => {
      ensureScrollAtTop()
    })
  })
}

export default defineNuxtPlugin((nuxtApp) => {
  if (!import.meta.client) return

  const router = useRouter()
  const { init, refresh } = useLenis()

  nuxtApp.hook('app:mounted', () => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
    void init()
    ensureScrollAtTop()
  })

  router.beforeEach(() => {
    void clearLeavingPageScroll()
  })

  router.afterEach(async () => {
    ensureScrollAtTop()
    await nextTick()
    ensureScrollAtTop()
    await clearScrollMemory()
    schedulePostTransitionResets()
    await refresh()
  })

  nuxtApp.hook('page:finish', () => {
    ensureScrollAtTop()
    void refresh()
  })
})

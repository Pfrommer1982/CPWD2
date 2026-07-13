import type Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { forceScrollToTop } from '~/utils/scrollReset'

let lenisInstance: Lenis | null = null
let tickerCallback: ((time: number) => void) | null = null
let resizeObserver: ResizeObserver | null = null
let resizeRaf = 0

export function useLenis() {
  async function init() {
    if (!import.meta.client) return null
    if (lenisInstance) return lenisInstance

    const { smoothScroll } = useGraphicsCapability()
    if (!smoothScroll.value) return null

    const LenisClass = (await import('lenis')).default
    const { init: initGsap } = useGsap()
    const gsap = await initGsap()
    if (!gsap) return null

    const scrollModule = await import('gsap/ScrollTrigger')
    const ScrollTrigger = scrollModule.ScrollTrigger

    lenisInstance = new LenisClass({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    lenisInstance.on('scroll', ScrollTrigger.update)
    ScrollTrigger.addEventListener('refresh', () => lenisInstance?.resize())

    if (!resizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        cancelAnimationFrame(resizeRaf)
        resizeRaf = requestAnimationFrame(() => {
          lenisInstance?.resize()
          ScrollTrigger.refresh()
        })
      })
      resizeObserver.observe(document.body)
    }

    tickerCallback = (time: number) => {
      lenisInstance?.raf(time * 1000)
    }
    gsap.ticker.add(tickerCallback)
    gsap.ticker.lagSmoothing(0)

    return lenisInstance
  }

  function scrollToTop() {
    if (!import.meta.client) return

    forceScrollToTop()
    lenisInstance?.scrollTo(0, { immediate: true, force: true })
  }

  async function refresh() {
    if (!import.meta.client) return

    await init()
    await nextTick()

    requestAnimationFrame(() => {
      lenisInstance?.resize()
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        ScrollTrigger.refresh(true)
      })
    })
  }

  function scrollTo(target: string | number | HTMLElement, options?: { offset?: number }) {
    lenisInstance?.scrollTo(target, { offset: options?.offset ?? 0 })
  }

  return {
    init,
    refresh,
    scrollToTop,
    scrollTo,
    get lenis() { return lenisInstance },
  }
}

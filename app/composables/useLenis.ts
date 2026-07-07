import type Lenis from 'lenis'
import 'lenis/dist/lenis.css'

let lenisInstance: Lenis | null = null
let tickerCallback: ((time: number) => void) | null = null
let resizeObserver: ResizeObserver | null = null
let resizeRaf = 0

export function useLenis() {
  async function init() {
    if (!import.meta.client) return null
    if (lenisInstance) return lenisInstance

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches
    const hasTouch = navigator.maxTouchPoints > 0
    // iOS Safari scroll is smoother with native momentum than JS smoothing.
    if (prefersReduced || coarsePointer || hasTouch) return null

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

    lenisInstance?.scrollTo(0, { immediate: true })
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
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

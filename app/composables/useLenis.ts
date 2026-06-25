import type Lenis from 'lenis'

let lenisInstance: Lenis | null = null
let tickerCallback: ((time: number) => void) | null = null
let proxyConfigured = false

export function useLenis() {
  async function init() {
    if (!import.meta.client) return null
    if (lenisInstance) return lenisInstance

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return null

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

    if (!proxyConfigured) {
      ScrollTrigger.scrollerProxy(document.documentElement, {
        scrollTop(value) {
          if (arguments.length && lenisInstance) {
            lenisInstance.scrollTo(value, { immediate: true })
          }
          return lenisInstance?.scroll ?? window.scrollY
        },
        getBoundingClientRect() {
          return {
            top: 0,
            left: 0,
            width: window.innerWidth,
            height: window.innerHeight,
          }
        },
        pinType: document.documentElement.style.transform ? 'transform' : 'fixed',
      })

      ScrollTrigger.addEventListener('refresh', () => lenisInstance?.resize())
      proxyConfigured = true
    }

    lenisInstance.on('scroll', ScrollTrigger.update)

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

import type Lenis from 'lenis'

let lenisInstance: Lenis | null = null

export function useLenis() {
  async function init() {
    if (!import.meta.client || lenisInstance) return lenisInstance

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return null

    const LenisClass = (await import('lenis')).default
    const { init: initGsap } = useGsap()
    const gsap = await initGsap()

    lenisInstance = new LenisClass({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    if (gsap) {
      const scrollModule = await import('gsap/ScrollTrigger')
      lenisInstance.on('scroll', scrollModule.ScrollTrigger.update)

      gsap.ticker.add((time) => {
        lenisInstance?.raf(time * 1000)
      })
      gsap.ticker.lagSmoothing(0)
    } else {
      function raf(time: number) {
        lenisInstance?.raf(time)
        requestAnimationFrame(raf)
      }
      requestAnimationFrame(raf)
    }

    return lenisInstance
  }

  function scrollTo(target: string | number | HTMLElement, options?: { offset?: number }) {
    lenisInstance?.scrollTo(target, { offset: options?.offset ?? 0 })
  }

  onUnmounted(() => {
    lenisInstance?.destroy()
    lenisInstance = null
  })

  return {
    init,
    scrollTo,
    get lenis() { return lenisInstance },
  }
}

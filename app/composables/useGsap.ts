import type { ScrollTrigger as ScrollTriggerType } from 'gsap/ScrollTrigger'

let gsapInstance: typeof import('gsap').gsap | null = null
let ScrollTriggerInstance: typeof ScrollTriggerType | null = null
let registered = false

export function useGsap() {
  const ctx = ref<ReturnType<typeof import('gsap').gsap.context> | null>(null)

  async function init() {
    if (!import.meta.client) return null

    if (!gsapInstance) {
      const gsapModule = await import('gsap')
      const scrollModule = await import('gsap/ScrollTrigger')
      gsapInstance = gsapModule.gsap
      ScrollTriggerInstance = scrollModule.ScrollTrigger

      if (!registered) {
        gsapInstance.registerPlugin(ScrollTriggerInstance)
        registered = true
      }
    }

    return gsapInstance
  }

  async function revealText(
    element: HTMLElement | string,
    options: { stagger?: number; delay?: number } = {},
  ) {
    const gsap = await init()
    if (!gsap) return

    const { stagger = 0.05, delay = 0 } = options
    const words = typeof element === 'string'
      ? document.querySelectorAll(`${element} .word`)
      : element.querySelectorAll('.word')

    gsap.from(words, {
      y: '110%',
      opacity: 0,
      duration: 0.8,
      stagger,
      delay,
      ease: 'power4.out',
    })
  }

  async function fadeInUp(
    elements: HTMLElement | HTMLElement[] | NodeListOf<Element> | string,
    stagger = 0.1,
  ) {
    const gsap = await init()
    if (!gsap || !ScrollTriggerInstance) return

    const targets = typeof elements === 'string'
      ? elements
      : Array.isArray(elements) ? elements : [elements]

    gsap.fromTo(
      targets,
      { y: 80, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: Array.isArray(targets) ? targets[0] : targets,
          start: 'top 85%',
          end: 'bottom 15%',
          toggleActions: 'play none none reverse',
        },
      },
    )
  }

  async function createContext(scope: Element | string, fn: () => void) {
    const gsap = await init()
    if (!gsap) return

    ctx.value = gsap.context(fn, scope)
    return ctx.value
  }

  function killScrollTriggers() {
    if (ScrollTriggerInstance) {
      ScrollTriggerInstance.getAll().forEach(t => t.kill())
    }
  }

  onUnmounted(() => {
    ctx.value?.revert()
    killScrollTriggers()
  })

  return {
    init,
    revealText,
    fadeInUp,
    createContext,
    killScrollTriggers,
    get gsap() { return gsapInstance },
    get ScrollTrigger() { return ScrollTriggerInstance },
  }
}

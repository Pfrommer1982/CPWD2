import type { Ref } from 'vue'

interface FinaleSceneOptions {
  scrollLayers: Ref<HTMLElement[]>
}

export function useFinaleScene(options: FinaleSceneOptions) {
  const { scrollLayers } = options
  let ctx: ReturnType<typeof import('gsap').gsap.context> | null = null

  onMounted(async () => {
    if (!import.meta.client) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const mobile = window.matchMedia('(max-width: 767px)').matches
    await nextTick()

    const { init } = useGsap()
    const gsap = await init()
    if (!gsap) return

    const { ScrollTrigger } = await import('gsap/ScrollTrigger')
    const { init: initLenis } = useLenis()
    await initLenis()

    ctx = gsap.context(() => {
      scrollLayers.value.filter(Boolean).forEach((text) => {
        if (reduced || mobile) {
          gsap.set(text, { backgroundSize: '100%' })
          return
        }

        gsap.to(text, {
          backgroundSize: '100%',
          ease: 'none',
          scrollTrigger: {
            trigger: text,
            start: 'top 92%',
            end: 'top 78%',
            scrub: true,
          },
        })
      })

      ScrollTrigger.refresh()
    })

    await useLenis().refresh()
  })

  onUnmounted(() => {
    ctx?.revert()
  })
}

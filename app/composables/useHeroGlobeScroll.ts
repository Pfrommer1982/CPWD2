import type { Ref } from 'vue'

export function useHeroGlobeScroll(progress: Ref<number>, root: Ref<HTMLElement | null>) {
  let scrollTrigger: import('gsap/ScrollTrigger').ScrollTrigger | null = null

  async function bind() {
    scrollTrigger?.kill()
    if (!import.meta.client || !root.value) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      progress.value = 0
      return
    }

    const { init } = useGsap()
    await init()
    const { ScrollTrigger } = await import('gsap/ScrollTrigger')

    scrollTrigger = ScrollTrigger.create({
      trigger: root.value,
      start: 'top top',
      end: 'bottom top',
      scrub: 0.85,
      onUpdate: (self) => {
        progress.value = self.progress
      },
    })

    ScrollTrigger.refresh()
  }

  watch(root, (el) => {
    if (el) bind()
  }, { immediate: true })

  onUnmounted(() => {
    scrollTrigger?.kill()
  })
}

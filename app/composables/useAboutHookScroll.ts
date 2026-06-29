import type { Ref } from 'vue'

export function useAboutHookScroll(progress: Ref<number>, root: Ref<HTMLElement | null>) {
  let scrollTrigger: import('gsap/ScrollTrigger').ScrollTrigger | null = null

  async function bind() {
    scrollTrigger?.kill()
    if (!import.meta.client || !root.value) return

    const { init } = useGsap()
    await init()
    const { ScrollTrigger } = await import('gsap/ScrollTrigger')

    scrollTrigger = ScrollTrigger.create({
      trigger: root.value,
      start: 'top 82%',
      end: 'bottom 18%',
      scrub: 0.45,
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

import type { Ref } from 'vue'

interface VisibleTimelineContext {
  gsap: typeof import('gsap').gsap
  reduced: boolean
}

interface VisibleTimelineOptions {
  root: Ref<HTMLElement | null>
  active?: Ref<boolean>
  factory: (ctx: VisibleTimelineContext) => import('gsap').gsap.core.Timeline | null | void
}

export async function whenSceneReady(check: () => boolean, run: () => void, attempts = 12) {
  for (let i = 0; i < attempts; i++) {
    await nextTick()
    if (check()) {
      run()
      return true
    }
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  }
  return false
}

export function useVisibleTimeline({ root, active, factory }: VisibleTimelineOptions) {
  let gsapCtx: ReturnType<typeof import('gsap').gsap.context> | null = null
  let timeline: import('gsap').gsap.core.Timeline | null = null
  let built = false

  function playTimeline() {
    if (!timeline) return
    timeline.restart()
  }

  function pauseTimeline() {
    timeline?.pause()
  }

  function syncActive(isActive: boolean) {
    if (isActive) playTimeline()
    else pauseTimeline()
  }

  async function mount() {
    const el = root.value
    if (!el || !import.meta.client) return

    const ready = await whenSceneReady(() => !!root.value, () => {})
    if (!ready || !root.value) return

    const { init } = useGsap()
    const gsap = await init()
    if (!gsap) return

    gsapCtx?.revert()
    timeline?.kill()
    timeline = null
    built = false

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    gsapCtx = gsap.context(() => {
      const tl = factory({ gsap, reduced })
      if (!tl) return

      timeline = tl.paused(true)
      built = true

      if (reduced) {
        timeline.progress(1).pause()
        return
      }

      if (active?.value ?? true) playTimeline()
    }, root.value)
  }

  function teardown() {
    timeline?.kill()
    timeline = null
    built = false
    gsapCtx?.revert()
    gsapCtx = null
  }

  watch(root, async (el) => {
    teardown()
    if (!el) return
    await mount()
  }, { flush: 'post' })

  if (active) {
    watch(active, (isActive) => {
      if (!built) return
      syncActive(isActive)
    }, { immediate: true })
  }

  onUnmounted(teardown)
}

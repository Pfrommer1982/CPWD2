import type { Ref } from 'vue'

interface VisibleTimelineContext {
  gsap: typeof import('gsap').gsap
  reduced: boolean
}

interface VisibleTimelineOptions {
  root: Ref<HTMLElement | null>
  active?: Ref<boolean>
  staticMode?: Ref<boolean>
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

export function useVisibleTimeline({ root, active, staticMode, factory }: VisibleTimelineOptions) {
  let gsapCtx: ReturnType<typeof import('gsap').gsap.context> | null = null
  let timeline: import('gsap').gsap.core.Timeline | null = null
  let built = false
  let observer: IntersectionObserver | null = null
  let inView = false

  function playTimeline() {
    if (!timeline) return
    timeline.restart()
  }

  function pauseTimeline() {
    timeline?.pause()
  }

  function shouldPlay() {
    const activeOk = active?.value ?? true
    return inView && activeOk
  }

  function syncPlayback() {
    if (!built || !timeline) return
    if (shouldPlay()) playTimeline()
    else pauseTimeline()
  }

  function setupObserver(el: HTMLElement) {
    observer?.disconnect()
    observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry?.isIntersecting ?? false
        syncPlayback()
      },
      { threshold: 0.2, rootMargin: '0px 0px -8% 0px' },
    )
    observer.observe(el)
  }

  async function mount() {
    const el = root.value
    if (!el || !import.meta.client || staticMode?.value) return

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

      setupObserver(root.value!)
      syncPlayback()
    }, root.value)
  }

  function teardown() {
    observer?.disconnect()
    observer = null
    inView = false
    timeline?.kill()
    timeline = null
    built = false
    gsapCtx?.revert()
    gsapCtx = null
  }

  watch(root, async (el) => {
    teardown()
    if (!el || staticMode?.value) return
    await mount()
  }, { flush: 'post' })

  if (staticMode) {
    watch(staticMode, async (isStatic) => {
      if (isStatic) teardown()
      else await mount()
    })
  }

  if (active) {
    watch(active, () => {
      if (!built) return
      syncPlayback()
    }, { immediate: true })
  }

  onUnmounted(teardown)
}

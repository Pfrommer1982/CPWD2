import type { Ref } from 'vue'

interface ServicesCarouselOptions {
  root: Ref<HTMLElement | null>
  slides: Ref<HTMLElement[]>
  activeIndex: Ref<number>
  progress: Ref<number>
  itemCount: Ref<number>
  chapterDuration?: number
}

const DEFAULT_DURATION = 4200
const FADE_DURATION = 0.5

export function useServicesCarousel(options: ServicesCarouselOptions) {
  const {
    root,
    slides,
    activeIndex,
    progress,
    itemCount,
    chapterDuration = DEFAULT_DURATION,
  } = options

  let ctx: ReturnType<typeof import('gsap').gsap.context> | null = null
  let rafId = 0
  let chapterStart = 0
  let inView = false
  let reducedMotion = false
  let mounted = false
  let observer: IntersectionObserver | null = null

  function teardown() {
    cancelAnimationFrame(rafId)
    rafId = 0
    observer?.disconnect()
    observer = null
    ctx?.revert()
    ctx = null
  }

  async function setSlideVisibility(index: number, animate: boolean) {
    const { init } = useGsap()
    const gsap = await init()
    if (!gsap) return

    const layers = slides.value
    layers.forEach((layer, i) => {
      if (!layer) return
      const isActive = i === index

      if (!animate || reducedMotion) {
        gsap.set(layer, {
          opacity: isActive ? 1 : 0,
          scale: isActive ? 1 : 0.98,
          pointerEvents: isActive ? 'auto' : 'none',
          zIndex: isActive ? 2 : 1,
        })
        return
      }

      gsap.to(layer, {
        opacity: isActive ? 1 : 0,
        scale: isActive ? 1 : 0.97,
        duration: FADE_DURATION,
        ease: 'power2.inOut',
        pointerEvents: isActive ? 'auto' : 'none',
        zIndex: isActive ? 2 : 1,
        overwrite: true,
      })
    })
  }

  function resetChapterTimer() {
    chapterStart = performance.now()
    progress.value = 0
  }

  function selectChapter(index: number) {
    const count = itemCount.value
    if (count <= 0) return

    const next = ((index % count) + count) % count
    if (next === activeIndex.value) {
      resetChapterTimer()
      return
    }

    activeIndex.value = next
    resetChapterTimer()
    setSlideVisibility(next, true)
  }

  function advanceChapter() {
    const count = itemCount.value
    if (count <= 0) return
    selectChapter((activeIndex.value + 1) % count)
  }

  function tick(now: number) {
    rafId = requestAnimationFrame(tick)

    if (!mounted || !inView || reducedMotion || itemCount.value <= 1) return

    const elapsed = now - chapterStart
    progress.value = Math.min(1, elapsed / chapterDuration)

    if (elapsed >= chapterDuration) {
      advanceChapter()
    }
  }

  async function initSlides() {
    const readyCount = slides.value.filter(Boolean).length
    if (!readyCount) return
    await setSlideVisibility(activeIndex.value, false)
    resetChapterTimer()
  }

  async function setup() {
    if (!import.meta.client || !root.value) return

    reducedMotion = !useGraphicsCapability().animateMotion.value

    const { init } = useGsap()
    const gsap = await init()
    if (!gsap || !root.value) return

    ctx = gsap.context(() => {}, root.value)

    await nextTick()
    await initSlides()
    mounted = true
    rafId = requestAnimationFrame(tick)

    observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry?.isIntersecting ?? false
        if (inView) resetChapterTimer()
      },
      { threshold: 0.25 },
    )
    observer.observe(root.value)
  }

  watch(
    () => slides.value.filter(Boolean).length,
    async (len) => {
      if (!len || !mounted) return
      await initSlides()
    },
    { flush: 'post' },
  )

  watch(itemCount, () => {
    if (activeIndex.value >= itemCount.value) {
      activeIndex.value = 0
    }
  })

  onMounted(async () => {
    await nextTick()
    await setup()
  })

  onUnmounted(() => {
    mounted = false
    teardown()
  })

  return {
    selectChapter,
  }
}

import type { Ref } from 'vue'

interface DesignBrowserSceneOptions {
  root: Ref<HTMLElement | null>
  active?: Ref<boolean>
  staticMode?: Ref<boolean>
}

interface ScenePiece {
  el: HTMLElement
  slot: HTMLElement
  target: { x: number; y: number }
}

function centerIn(parent: DOMRect, child: DOMRect) {
  return {
    x: child.left - parent.left + child.width / 2,
    y: child.top - parent.top + child.height / 2,
  }
}

export function useDesignBrowserScene({ root, active, staticMode }: DesignBrowserSceneOptions) {
  let ctx: ReturnType<typeof import('gsap').gsap.context> | null = null
  let timeline: import('gsap').gsap.core.Timeline | null = null
  let built = false
  let observer: IntersectionObserver | null = null
  let resizeObserver: ResizeObserver | null = null
  let inView = false
  let building = false

  const browserRef = ref<HTMLElement | null>(null)
  const guidesRef = ref<SVGElement | null>(null)
  const measureRef = ref<HTMLElement | null>(null)

  const pieceNav = ref<HTMLElement | null>(null)
  const pieceHero = ref<HTMLElement | null>(null)
  const pieceSide = ref<HTMLElement | null>(null)
  const pieceCardA = ref<HTMLElement | null>(null)
  const pieceCardB = ref<HTMLElement | null>(null)
  const pieceDot = ref<HTMLElement | null>(null)

  const slotNav = ref<HTMLElement | null>(null)
  const slotHero = ref<HTMLElement | null>(null)
  const slotSide = ref<HTMLElement | null>(null)
  const slotCardA = ref<HTMLElement | null>(null)
  const slotCardB = ref<HTMLElement | null>(null)
  const slotDot = ref<HTMLElement | null>(null)

  function placePiece(
    gsap: typeof import('gsap').gsap,
    piece: HTMLElement,
    x: number,
    y: number,
    opacity: number,
    scale: number,
    yOffset = 0,
  ) {
    gsap.set(piece, {
      x: x - piece.offsetWidth / 2,
      y: y - piece.offsetHeight / 2 + yOffset,
      rotation: 0,
      scale,
      opacity,
      transformOrigin: '50% 50%',
      force3D: true,
    })
  }

  function refsReady() {
    return !!(
      root.value
      && browserRef.value
      && pieceNav.value
      && slotNav.value
      && pieceHero.value
      && slotHero.value
    )
  }

  function shouldPlay() {
    const activeOk = active?.value ?? true
    return inView && activeOk
  }

  function syncPlayback() {
    if (!built || !timeline) return
    if (shouldPlay()) timeline.restart()
    else timeline.pause()
  }

  async function buildTimeline() {
    if (building) return
    const scene = root.value
    const browser = browserRef.value
    if (!scene || !browser) return

    const sceneRect = scene.getBoundingClientRect()
    if (sceneRect.width < 48 || sceneRect.height < 48) return

    const pairs = [
      [pieceNav.value, slotNav.value],
      [pieceHero.value, slotHero.value],
      [pieceSide.value, slotSide.value],
      [pieceCardA.value, slotCardA.value],
      [pieceCardB.value, slotCardB.value],
      [pieceDot.value, slotDot.value],
    ] as const

    if (pairs.some(([piece, slot]) => !piece || !slot)) return

    building = true

    const { init } = useGsap()
    const gsap = await init()
    if (!gsap) {
      building = false
      return
    }

    ctx?.revert()
    timeline?.kill()
    built = false

    const pieces: ScenePiece[] = pairs.map(([el, slot]) => {
      const piece = el as HTMLElement
      const slotEl = slot as HTMLElement
      return {
        el: piece,
        slot: slotEl,
        target: centerIn(sceneRect, slotEl.getBoundingClientRect()),
      }
    })

    const guideLines = guidesRef.value?.querySelectorAll<SVGGeometryElement>('[data-guide]') ?? []
    const measureLabels = measureRef.value?.querySelectorAll<HTMLElement>('[data-measure]') ?? []
    const heroShimmer = pieceHero.value?.querySelector<HTMLElement>('.design-browser__piece-shimmer')

    pieces.forEach(({ el, target }) => {
      placePiece(gsap, el, target.x, target.y, 0, 0.94, 10)
    })

    gsap.set(browser, { '--assemble': 0 })
    gsap.set(guideLines, { strokeDashoffset: 48, opacity: 0 })
    gsap.set(measureLabels, { opacity: 0, y: 4 })
    if (heroShimmer) gsap.set(heroShimmer, { opacity: 0 })

    ctx = gsap.context(() => {
      timeline = gsap.timeline({ repeat: -1, repeatDelay: 0.65, paused: true })

      timeline.to(browser, {
        '--assemble': 0.35,
        duration: 0.35,
        ease: 'power2.out',
      }, 0)

      pieces.forEach(({ el, target }, i) => {
        timeline!.to(el, {
          x: target.x - el.offsetWidth / 2,
          y: target.y - el.offsetHeight / 2,
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: 'power2.out',
        }, 0.15 + i * 0.07)
      })

      timeline.to(guideLines, {
        strokeDashoffset: 0,
        opacity: 0.85,
        duration: 0.45,
        stagger: 0.07,
        ease: 'power2.out',
      }, 0.55)

      timeline.to(measureLabels, {
        opacity: 0.9,
        y: 0,
        duration: 0.35,
        stagger: 0.05,
        ease: 'power2.out',
      }, 0.65)

      timeline.to(browser, {
        '--assemble': 1,
        duration: 0.4,
        ease: 'power2.out',
      }, 0.75)

      if (heroShimmer) {
        timeline.to(heroShimmer, { opacity: 1, duration: 0.25 }, 0.9)
      }

      timeline.to({}, { duration: 1.6 })

      timeline.to(guideLines, {
        opacity: 0,
        duration: 0.25,
        stagger: 0.03,
        ease: 'power1.in',
      }, 2.35)

      timeline.to(measureLabels, {
        opacity: 0,
        y: 4,
        duration: 0.25,
        ease: 'power1.in',
      }, 2.35)

      if (heroShimmer) {
        timeline.to(heroShimmer, { opacity: 0, duration: 0.2 }, 2.35)
      }

      timeline.to(browser, {
        '--assemble': 0,
        duration: 0.35,
        ease: 'power2.in',
      }, 2.4)

      pieces.forEach(({ el, target }, i) => {
        timeline!.to(el, {
          opacity: 0,
          scale: 0.96,
          y: target.y - el.offsetHeight / 2 + 6,
          duration: 0.35,
          ease: 'power2.in',
        }, 2.45 + i * 0.04)
      })

      timeline.set(guideLines, { strokeDashoffset: 48 })
      timeline.set(measureLabels, { y: 4 })

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduced) {
        timeline.kill()
        pieces.forEach(({ el, target }) => placePiece(gsap, el, target.x, target.y, 1, 1))
        gsap.set(guideLines, { opacity: 0.4, strokeDashoffset: 0 })
        gsap.set(measureLabels, { opacity: 0.65, y: 0 })
        gsap.set(browser, { '--assemble': 1 })
        built = false
        building = false
        return
      }

      built = true
      building = false
      syncPlayback()
    }, scene)
  }

  function setupObserver(el: HTMLElement) {
    observer?.disconnect()
    observer = new IntersectionObserver(
      async ([entry]) => {
        inView = entry?.isIntersecting ?? false
        if (inView) {
          if (!built && !building) await buildTimeline()
          else syncPlayback()
        } else {
          timeline?.pause()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -5% 0px' },
    )
    observer.observe(el)

    resizeObserver?.disconnect()
    let resizeTimer: ReturnType<typeof setTimeout> | null = null
    resizeObserver = new ResizeObserver(() => {
      if (resizeTimer) clearTimeout(resizeTimer)
      resizeTimer = setTimeout(async () => {
        if (!inView) return
        await buildTimeline()
      }, 150)
    })
    resizeObserver.observe(el)
  }

  function teardown() {
    observer?.disconnect()
    observer = null
    resizeObserver?.disconnect()
    resizeObserver = null
    inView = false
    building = false
    timeline?.kill()
    timeline = null
    built = false
    ctx?.revert()
    ctx = null
  }

  async function mount() {
    teardown()
    if (!root.value || !import.meta.client || staticMode?.value) return

    await whenSceneReady(refsReady, () => {})
    if (!root.value || !refsReady()) return

    setupObserver(root.value)
  }

  watch(root, async (el) => {
    if (!el) {
      teardown()
      return
    }
    if (staticMode?.value) {
      teardown()
      return
    }
    await mount()
  }, { flush: 'post' })

  if (staticMode) {
    watch(staticMode, async (isStatic) => {
      if (isStatic) teardown()
      else if (root.value) await mount()
    })
  }

  if (active) {
    watch(active, () => {
      syncPlayback()
    }, { immediate: true })
  }

  onUnmounted(teardown)

  return {
    browserRef,
    guidesRef,
    measureRef,
    pieceNav,
    pieceHero,
    pieceSide,
    pieceCardA,
    pieceCardB,
    pieceDot,
    slotNav,
    slotHero,
    slotSide,
    slotCardA,
    slotCardB,
    slotDot,
  }
}

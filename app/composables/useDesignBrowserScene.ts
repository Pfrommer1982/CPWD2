import type { Ref } from 'vue'

interface DesignBrowserSceneOptions {
  root: Ref<HTMLElement | null>
  active?: Ref<boolean>
}

interface ScenePiece {
  el: HTMLElement
  slot: HTMLElement
  scatter: { x: number; y: number; rotate: number; scale: number }
  target: { x: number; y: number }
}

function centerIn(parent: DOMRect, child: DOMRect) {
  return {
    x: child.left - parent.left + child.width / 2,
    y: child.top - parent.top + child.height / 2,
  }
}

export function useDesignBrowserScene({ root, active }: DesignBrowserSceneOptions) {
  let ctx: ReturnType<typeof import('gsap').gsap.context> | null = null
  let timeline: import('gsap').gsap.core.Timeline | null = null
  let built = false

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

  function scatterFor(index: number, w: number, h: number) {
    const spots = [
      { x: w * 0.9, y: h * 0.16, rotate: 11, scale: 0.88 },
      { x: w * 0.1, y: h * 0.22, rotate: -13, scale: 0.9 },
      { x: w * 0.93, y: h * 0.5, rotate: 9, scale: 0.86 },
      { x: w * 0.07, y: h * 0.6, rotate: -9, scale: 0.84 },
      { x: w * 0.86, y: h * 0.76, rotate: 14, scale: 0.82 },
      { x: w * 0.14, y: h * 0.8, rotate: -5, scale: 0.8 },
    ]
    return spots[index] ?? spots[0]
  }

  function placePiece(
    gsap: typeof import('gsap').gsap,
    piece: HTMLElement,
    x: number,
    y: number,
    rotate: number,
    scale: number,
  ) {
    gsap.set(piece, {
      x: x - piece.offsetWidth / 2,
      y: y - piece.offsetHeight / 2,
      rotation: rotate,
      scale,
      opacity: 1,
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

  async function buildTimeline() {
    const scene = root.value
    const browser = browserRef.value
    if (!scene || !browser) return

    const pairs = [
      [pieceNav.value, slotNav.value],
      [pieceHero.value, slotHero.value],
      [pieceSide.value, slotSide.value],
      [pieceCardA.value, slotCardA.value],
      [pieceCardB.value, slotCardB.value],
      [pieceDot.value, slotDot.value],
    ] as const

    if (pairs.some(([piece, slot]) => !piece || !slot)) return

    const { init } = useGsap()
    const gsap = await init()
    if (!gsap) return

    ctx?.revert()
    timeline?.kill()

    const sceneRect = scene.getBoundingClientRect()
    const pieces: ScenePiece[] = pairs.map(([el, slot], index) => {
      const piece = el as HTMLElement
      const slotEl = slot as HTMLElement
      const target = centerIn(sceneRect, slotEl.getBoundingClientRect())
      return {
        el: piece,
        slot: slotEl,
        scatter: scatterFor(index, sceneRect.width, sceneRect.height),
        target,
      }
    })

    pieces.forEach(({ el, scatter }) => {
      placePiece(gsap, el, scatter.x, scatter.y, scatter.rotate, scatter.scale)
    })

    const guideLines = guidesRef.value?.querySelectorAll<SVGGeometryElement>('[data-guide]') ?? []
    const measureLabels = measureRef.value?.querySelectorAll<HTMLElement>('[data-measure]') ?? []

    ctx = gsap.context(() => {
      timeline = gsap.timeline({ repeat: -1, repeatDelay: 0.4, paused: true })

      timeline.set(browser, { '--assemble': 0 })
      timeline.set(guideLines, { strokeDashoffset: 48, opacity: 0 })
      timeline.set(measureLabels, { opacity: 0, y: 4 })

      timeline.to(guideLines, {
        strokeDashoffset: 0,
        opacity: 1,
        duration: 0.55,
        stagger: 0.08,
        ease: 'power2.out',
      }, 0.25)

      timeline.to(measureLabels, {
        opacity: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.06,
        ease: 'power2.out',
      }, 0.45)

      pieces.forEach(({ el, target }, i) => {
        timeline!.to(el, {
          x: target.x - el.offsetWidth / 2,
          y: target.y - el.offsetHeight / 2,
          rotation: 0,
          scale: 1,
          duration: 0.85,
          ease: 'power3.inOut',
        }, 0.55 + i * 0.1)
      })

      timeline.to(browser, {
        '--assemble': 1,
        duration: 0.6,
        ease: 'power2.out',
      }, 1.15)

      timeline.to({}, { duration: 1.1 })

      timeline.to(guideLines, {
        opacity: 0,
        duration: 0.35,
        stagger: 0.04,
        ease: 'power1.in',
      }, 2.6)

      timeline.to(measureLabels, {
        opacity: 0,
        duration: 0.3,
        ease: 'power1.in',
      }, 2.55)

      timeline.to(browser, {
        '--assemble': 0,
        duration: 0.45,
        ease: 'power2.in',
      }, 2.65)

      pieces.forEach(({ el, scatter }, i) => {
        timeline!.to(el, {
          x: scatter.x - el.offsetWidth / 2,
          y: scatter.y - el.offsetHeight / 2,
          rotation: scatter.rotate,
          scale: scatter.scale,
          duration: 0.7,
          ease: 'power2.inOut',
        }, 2.75 + i * 0.06)
      })

      timeline.set(guideLines, { strokeDashoffset: 48 })

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduced) {
        timeline.kill()
        pieces.forEach(({ el, target }) => placePiece(gsap, el, target.x, target.y, 0, 1))
        gsap.set(guideLines, { opacity: 0.35, strokeDashoffset: 0 })
        gsap.set(measureLabels, { opacity: 0.6, y: 0 })
        gsap.set(browser, { '--assemble': 1 })
        built = false
        return
      }

      built = true
      if (active?.value ?? true) timeline.restart()
    }, scene)
  }

  function teardown() {
    timeline?.kill()
    timeline = null
    built = false
    ctx?.revert()
    ctx = null
  }

  async function mount() {
    teardown()
    if (!root.value || !import.meta.client) return

    await whenSceneReady(refsReady, () => buildTimeline())
  }

  watch(root, async (el) => {
    if (!el) {
      teardown()
      return
    }
    await mount()
  }, { flush: 'post' })

  if (active) {
    watch(active, (isActive) => {
      if (!built || !timeline) return
      if (isActive) timeline.restart()
      else timeline.pause()
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

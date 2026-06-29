import type { Ref } from 'vue'

interface ServicesScrollOptions {
  root: Ref<HTMLElement | null>
  track: Ref<HTMLElement | null>
  panels: Ref<HTMLElement[]>
  backgrounds: Ref<HTMLElement[]>
  progress: Ref<number>
  panelCount: Ref<number>
  layout: Ref<'desktop' | 'mobile'>
}

/** Share of each slide segment used for transition vs magnetic hold */
const SLIDE_MOVE_RATIO = 0.58
/** Extra vertical scroll per slide so each panel can dwell before the next */
const SLIDE_SEGMENT_MULT = 1.28

function mapSlideProgress(linear: number, steps: number) {
  if (steps <= 0) return 0
  const clamped = Math.min(1, Math.max(0, linear))
  const pos = clamped * steps
  const index = Math.min(steps - 1, Math.floor(pos))
  const local = pos - index

  if (local <= SLIDE_MOVE_RATIO) {
    return (index + local / SLIDE_MOVE_RATIO) / steps
  }
  return (index + 1) / steps
}

function slideSnapPoints(steps: number) {
  if (steps <= 0) return [0]

  const points = [0]
  for (let k = 1; k < steps; k++) {
    points.push((k - 1 + SLIDE_MOVE_RATIO + (1 - SLIDE_MOVE_RATIO) * 0.5) / steps)
  }
  points.push(1)
  return points
}

function nearestSnapPoint(linear: number, points: number[]) {
  let closest = points[0] ?? 0
  let minDist = Math.abs(linear - closest)

  for (const point of points) {
    const dist = Math.abs(linear - point)
    if (dist < minDist) {
      minDist = dist
      closest = point
    }
  }

  return closest
}

export function useServicesScroll(options: ServicesScrollOptions) {
  const { root, track, panels, backgrounds, progress, panelCount, layout } = options
  let ctx: ReturnType<typeof import('gsap').gsap.context> | null = null
  let parallaxCleanup: (() => void) | null = null
  let mountToken = 0
  const sceneReady = ref(false)

  function panelsReady() {
    const count = panelCount.value
    if (count <= 0) return false
    return panels.value.filter(Boolean).length >= count
  }

  function teardown() {
    ctx?.revert()
    ctx = null
    parallaxCleanup?.()
    parallaxCleanup = null
  }

  async function setupDesktop() {
    const { init } = useGsap()
    const gsap = await init()
    if (!gsap || !root.value || !track.value) return

    const { ScrollTrigger } = await import('gsap/ScrollTrigger')
    const { init: initLenis } = useLenis()
    await initLenis()

    const total = panelCount.value
    const steps = total - 1
    const snapPoints = slideSnapPoints(steps)
    const getScrollDistance = () => steps * window.innerHeight * SLIDE_SEGMENT_MULT

    ctx = gsap.context(() => {
      gsap.set(track.value, { x: 0, force3D: true })

      const horizontalTween = gsap.to(track.value, {
        x: () => -steps * window.innerWidth,
        ease: 'none',
        paused: true,
      })

      ScrollTrigger.create({
        trigger: root.value,
        start: 'top top',
        end: () => `+=${getScrollDistance()}`,
        pin: true,
        scrub: 0.78,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        snap: {
          snapTo: (linear) => nearestSnapPoint(linear, snapPoints),
          duration: { min: 0.28, max: 0.55 },
          delay: 0.04,
          ease: 'power3.out',
        },
        onUpdate: (self) => {
          const mapped = mapSlideProgress(self.progress, steps)
          horizontalTween.progress(mapped)
          progress.value = Math.min(steps, Math.round(mapped * steps))
        },
      })

      panels.value.forEach((panel, index) => {
        if (!panel) return

        const titleWords = panel.querySelectorAll<HTMLElement>('.services-panel__title-inner')
        const desc = panel.querySelector<HTMLElement>('.services-panel__desc')
        const tags = panel.querySelectorAll<HTMLElement>('.services-panel__tag')
        const indexEl = panel.querySelector<HTMLElement>('.services-panel__index')
        const content = panel.querySelector<HTMLElement>('.services-panel__content')

        if (titleWords.length) {
          gsap.fromTo(
            titleWords,
            { yPercent: 120, opacity: 0, rotateX: -18 },
            {
              yPercent: 0,
              opacity: 1,
              rotateX: 0,
              stagger: 0.06,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: panel,
                containerAnimation: horizontalTween,
                start: 'left 85%',
                end: 'left 45%',
                scrub: 0.6,
              },
            },
          )
        }

        if (desc) {
          gsap.fromTo(
            desc,
            { y: 48, opacity: 0, clipPath: 'inset(100% 0 0 0)' },
            {
              y: 0,
              opacity: 1,
              clipPath: 'inset(0% 0 0 0)',
              ease: 'power2.out',
              scrollTrigger: {
                trigger: panel,
                containerAnimation: horizontalTween,
                start: 'left 75%',
                end: 'left 35%',
                scrub: 0.8,
              },
            },
          )
        }

        if (tags.length) {
          gsap.fromTo(
            tags,
            { y: 24, opacity: 0, scale: 0.92 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              stagger: 0.04,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: panel,
                containerAnimation: horizontalTween,
                start: 'left 65%',
                end: 'left 25%',
                scrub: 0.8,
              },
            },
          )
        }

        if (indexEl) {
          gsap.fromTo(
            indexEl,
            { scale: 0.6, opacity: 0, transformOrigin: 'right center' },
            {
              scale: 1,
              opacity: 0.12,
              transformOrigin: 'right center',
              ease: 'power2.out',
              scrollTrigger: {
                trigger: panel,
                containerAnimation: horizontalTween,
                start: 'left 90%',
                end: 'left 50%',
                scrub: 0.5,
              },
            },
          )
        }

        if (content) {
          gsap.to(content, {
            y: -30,
            ease: 'none',
            scrollTrigger: {
              trigger: panel,
              containerAnimation: horizontalTween,
              start: 'left 50%',
              end: 'right 50%',
              scrub: true,
            },
          })
        }

        const bg = backgrounds.value[index]
        if (bg) {
          gsap.fromTo(
            bg,
            { opacity: 0, scale: 1.08 },
            {
              opacity: 1,
              scale: 1,
              ease: 'power1.inOut',
              scrollTrigger: {
                trigger: panel,
                containerAnimation: horizontalTween,
                start: 'left 80%',
                end: 'left 20%',
                scrub: true,
              },
            },
          )

          gsap.to(bg, {
            opacity: 0,
            scale: 0.96,
            ease: 'power1.inOut',
            scrollTrigger: {
              trigger: panel,
              containerAnimation: horizontalTween,
              start: 'left 20%',
              end: 'left -20%',
              scrub: true,
            },
          })
        }
      })

      ScrollTrigger.refresh()
    }, root.value)

    parallaxCleanup = setupMouseParallax(root.value)
    await useLenis().refresh()
  }

  async function setupMobile() {
    await useLenis().refresh()
  }

  function setupMouseParallax(container: HTMLElement) {
    const layers = container.querySelectorAll<HTMLElement>('[data-parallax]')
    if (!layers.length) return null

    const onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      if (rect.bottom < 0 || rect.top > window.innerHeight) return

      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2

      layers.forEach((layer) => {
        const depth = Number(layer.dataset.parallax) || 1
        layer.style.transform = `translate3d(${nx * 18 * depth}px, ${ny * 12 * depth}px, 0)`
      })
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }

  async function mount(mode: 'desktop' | 'mobile') {
    if (!import.meta.client) return

    const token = ++mountToken
    teardown()
    progress.value = 0

    await nextTick()

    const ready = await whenSceneReady(
      () => !!root.value && !!track.value && (mode === 'mobile' || panelsReady()),
      () => {},
      24,
    )

    if (!ready || token !== mountToken) return

    try {
      if (mode === 'desktop') await setupDesktop()
      else await setupMobile()
    } catch (error) {
      console.warn('[useServicesScroll] Setup failed:', error)
    }
  }

  watch([layout, sceneReady], async ([mode, ready]) => {
    if (!ready) return
    await mount(mode)
  })

  onMounted(async () => {
    if (!import.meta.client) return
    await nextTick()
    requestAnimationFrame(() => {
      sceneReady.value = true
    })
  })

  onUnmounted(() => {
    mountToken++
    sceneReady.value = false
    teardown()
  })
}

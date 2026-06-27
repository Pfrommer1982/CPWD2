import type { Ref } from 'vue'

interface ServicesScrollOptions {
  root: Ref<HTMLElement | null>
  track: Ref<HTMLElement | null>
  panels: Ref<HTMLElement[]>
  backgrounds: Ref<HTMLElement[]>
  progress: Ref<number>
  panelCount: Ref<number>
  layout: Ref<'idle' | 'desktop' | 'mobile'>
}

export function useServicesScroll(options: ServicesScrollOptions) {
  const { root, track, panels, backgrounds, progress, panelCount, layout } = options
  let ctx: ReturnType<typeof import('gsap').gsap.context> | null = null
  let parallaxCleanup: (() => void) | null = null

  async function setupDesktop() {
    const { init } = useGsap()
    const gsap = await init()
    if (!gsap || !root.value || !track.value) return

    const { ScrollTrigger } = await import('gsap/ScrollTrigger')
    const { init: initLenis } = useLenis()
    await initLenis()

    const total = panelCount.value
    const getScrollDistance = () => (total - 1) * window.innerHeight

    ctx = gsap.context(() => {
      gsap.set(track.value, { x: 0, force3D: true })

      const horizontalTween = gsap.to(track.value, {
        x: () => -(total - 1) * window.innerWidth,
        ease: 'none',
        scrollTrigger: {
          trigger: root.value,
          start: 'top top',
          end: () => `+=${getScrollDistance()}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            progress.value = Math.min(
              total - 1,
              Math.round(self.progress * (total - 1)),
            )
          },
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
            { scale: 0.6, opacity: 0 },
            {
              scale: 1,
              opacity: 0.12,
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
    const { init } = useGsap()
    const gsap = await init()
    if (!gsap || !root.value) return

    ctx = gsap.context(() => {
      panels.value.forEach((panel, index) => {
        if (!panel) return

        const titleWords = panel.querySelectorAll<HTMLElement>('.services-panel__title-inner')
        const desc = panel.querySelector<HTMLElement>('.services-panel__desc')
        const tags = panel.querySelectorAll<HTMLElement>('.services-panel__tag')

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: panel,
            start: 'top 88%',
            toggleActions: 'play none none reverse',
          },
        })

        if (titleWords.length) {
          tl.from(titleWords, {
            yPercent: 80,
            opacity: 0,
            duration: 0.7,
            stagger: 0.05,
            ease: 'power3.out',
          })
        }

        if (desc) {
          tl.from(desc, { y: 32, opacity: 0, duration: 0.6, ease: 'power2.out' }, '-=0.35')
        }

        if (tags.length) {
          tl.from(tags, {
            y: 16,
            opacity: 0,
            duration: 0.45,
            stagger: 0.04,
            ease: 'power2.out',
          }, '-=0.3')
        }

        const bg = backgrounds.value[index]
        if (bg) {
          gsap.fromTo(
            bg,
            { opacity: 0 },
            {
              opacity: 0.6,
              duration: 0.8,
              scrollTrigger: {
                trigger: panel,
                start: 'top 90%',
                toggleActions: 'play none none reverse',
              },
            },
          )
        }
      })
    }, root.value)
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

  watch(layout, async (mode) => {
    if (mode === 'idle' || !import.meta.client) return

    ctx?.revert()
    ctx = null
    parallaxCleanup?.()
    parallaxCleanup = null
    progress.value = 0

    await nextTick()

    if (mode === 'desktop') {
      await setupDesktop()
    } else {
      await setupMobile()
    }
  })

  onUnmounted(() => {
    ctx?.revert()
    parallaxCleanup?.()
  })
}

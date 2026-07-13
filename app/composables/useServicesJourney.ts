import type { Ref } from 'vue'

interface ServicesJourneyOptions {
  root: Ref<HTMLElement | null>
  chapters: Ref<HTMLElement[]>
  spineFill: Ref<HTMLElement | null>
  hero: Ref<HTMLElement | null>
  finale: Ref<HTMLElement | null>
  activeChapter: Ref<number>
  layout: Ref<'desktop' | 'mobile'>
  ready: Ref<boolean>
}

function chapterContentSide(chapter: HTMLElement) {
  return chapter.querySelector('.journey-chapter__content')?.getAttribute('data-chapter-side')
}

function contentEnterX(chapter: HTMLElement, isFinale: boolean) {
  if (isFinale) return 0
  const side = chapterContentSide(chapter)
  return side === 'left' ? -80 : side === 'right' ? 80 : 0
}

function sceneEnterX(chapter: HTMLElement) {
  const side = chapterContentSide(chapter)
  return side === 'left' ? 96 : side === 'right' ? -96 : 0
}

export function useServicesJourney({
  root,
  chapters,
  spineFill,
  hero,
  finale,
  activeChapter,
  layout,
  ready,
}: ServicesJourneyOptions) {
  let ctx: ReturnType<typeof import('gsap').gsap.context> | null = null

  function teardown() {
    ctx?.revert()
    ctx = null
  }

  async function setupDesktop() {
    const { init } = useGsap()
    const gsap = await init()
    if (!gsap || !root.value) return

    const { ScrollTrigger } = await import('gsap/ScrollTrigger')
    const { init: initLenis } = useLenis()
    await initLenis()

    ctx = gsap.context(() => {
      if (hero.value) {
        ScrollTrigger.create({
          trigger: hero.value,
          start: 'top top',
          end: 'bottom top',
          onEnter: () => { activeChapter.value = -1 },
          onEnterBack: () => { activeChapter.value = -1 },
        })

        const heroWords = hero.value.querySelectorAll<HTMLElement>('[data-hero-word]')
        const heroFade = hero.value.querySelectorAll<HTMLElement>('[data-hero-fade]')

        gsap.from(heroWords, {
          yPercent: 100,
          opacity: 0,
          stagger: 0.07,
          duration: 1,
          ease: 'power3.out',
          delay: 0.1,
        })

        gsap.from(heroFade, {
          y: 24,
          opacity: 0,
          stagger: 0.08,
          duration: 0.8,
          ease: 'power2.out',
          delay: 0.45,
        })
      }

      if (spineFill.value) {
        gsap.fromTo(
          spineFill.value,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: root.value,
              start: 'top top',
              scrub: true,
              ...(finale.value
                ? { endTrigger: finale.value, end: 'top top' }
                : { end: 'bottom bottom' }),
            },
          },
        )
      }

      if (finale.value) {
        ScrollTrigger.create({
          trigger: finale.value,
          start: 'top 60%',
          onEnter: () => { activeChapter.value = chapters.value.length },
          onEnterBack: () => {
            activeChapter.value = Math.max(chapters.value.length - 1, 0)
          },
        })
      }

      chapters.value.forEach((chapter, index) => {
        if (!chapter) return

        const isFinale = chapter.classList.contains('journey-chapter--finale')
        const enterX = contentEnterX(chapter, isFinale)
        const scene = chapter.querySelector<HTMLElement>('.journey-chapter__scene')
        const titleWords = chapter.querySelectorAll<HTMLElement>('[data-chapter-word]')
        const desc = chapter.querySelector<HTMLElement>('[data-chapter-desc]')
        const tags = chapter.querySelectorAll<HTMLElement>('[data-chapter-tag]')
        const fadeEls = chapter.querySelectorAll<HTMLElement>('[data-chapter-fade]')

        ScrollTrigger.create({
          trigger: chapter,
          start: 'top 55%',
          end: 'bottom 45%',
          onEnter: () => { activeChapter.value = index },
          onEnterBack: () => { activeChapter.value = index },
        })

        if (scene && !isFinale) {
          gsap.fromTo(
            scene,
            { x: sceneEnterX(chapter), opacity: 0 },
            {
              x: 0,
              opacity: 1,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: chapter,
                start: 'top 80%',
                end: 'top 42%',
                scrub: 0.55,
              },
            },
          )
        }

        if (titleWords.length) {
          gsap.fromTo(
            titleWords,
            { x: enterX, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              stagger: 0.04,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: chapter,
                start: 'top 78%',
                end: 'top 38%',
                scrub: 0.55,
              },
            },
          )
        }

        if (desc) {
          gsap.fromTo(
            desc,
            { x: enterX * 0.85, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: chapter,
                start: 'top 72%',
                end: 'top 34%',
                scrub: 0.65,
              },
            },
          )
        }

        if (tags.length) {
          gsap.fromTo(
            tags,
            { x: enterX * 0.7, opacity: 0, scale: 0.96 },
            {
              x: 0,
              opacity: 1,
              scale: 1,
              stagger: 0.04,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: chapter,
                start: 'top 66%',
                end: 'top 30%',
                scrub: 0.5,
              },
            },
          )
        }

        if (fadeEls.length) {
          gsap.fromTo(
            fadeEls,
            { x: enterX * 0.65, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              stagger: 0.06,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: chapter,
                start: isFinale ? 'top 75%' : 'top 82%',
                end: isFinale ? 'top 48%' : 'top 58%',
                scrub: 0.45,
              },
            },
          )
        }
      })

      if (finale.value) {
        ScrollTrigger.create({
          trigger: finale.value,
          start: 'top 6%',
          end: 'top top',
          snap: {
            snapTo: 1,
            duration: { min: 0.35, max: 0.75 },
            delay: 0.05,
            ease: 'power2.inOut',
          },
        })

        ScrollTrigger.create({
          trigger: finale.value,
          start: 'top top',
          end: '+=210%',
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        })
      }

      ScrollTrigger.refresh()
    }, root.value)

    await useLenis().refresh()
  }

  async function setupMobile() {
    const { init } = useGsap()
    const gsap = await init()
    if (!gsap || !root.value) return

    const { init: initLenis } = useLenis()
    await initLenis()

    ctx = gsap.context(() => {
      chapters.value.forEach((chapter, index) => {
        if (!chapter) return

        const isFinale = chapter.classList.contains('journey-chapter--finale')
        const enterX = contentEnterX(chapter, isFinale)
        const titleWords = chapter.querySelectorAll<HTMLElement>('[data-chapter-word]')
        const desc = chapter.querySelector<HTMLElement>('[data-chapter-desc]')
        const tags = chapter.querySelectorAll<HTMLElement>('[data-chapter-tag]')
        const fadeEls = chapter.querySelectorAll<HTMLElement>('[data-chapter-fade]')

        ScrollTrigger.create({
          trigger: chapter,
          start: 'top 80%',
          onEnter: () => { activeChapter.value = index },
          onEnterBack: () => { activeChapter.value = index },
        })

        if (titleWords.length) {
          gsap.from(titleWords, {
            x: enterX,
            opacity: 0,
            stagger: 0.05,
            duration: 0.85,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: chapter,
              start: 'top 82%',
              once: true,
            },
          })
        }

        if (desc) {
          gsap.from(desc, {
            x: enterX * 0.85,
            opacity: 0,
            duration: 0.75,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: chapter,
              start: 'top 78%',
              once: true,
            },
          })
        }

        if (tags.length) {
          gsap.from(tags, {
            x: enterX * 0.7,
            opacity: 0,
            scale: 0.96,
            stagger: 0.04,
            duration: 0.65,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: chapter,
              start: 'top 74%',
              once: true,
            },
          })
        }

        if (fadeEls.length) {
          gsap.from(fadeEls, {
            x: enterX * 0.65,
            opacity: 0,
            stagger: 0.06,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: chapter,
              start: 'top 85%',
              once: true,
            },
          })
        }
      })

      ScrollTrigger.refresh()
    }, root.value)

    await useLenis().refresh()
  }

  async function mount(mode: 'desktop' | 'mobile') {
    teardown()
    activeChapter.value = -1

    const { animateMotion } = useGraphicsCapability()
    if (!animateMotion.value && root.value) {
      await revealMotionElements(root.value)
      return
    }

    if (mode === 'desktop') await setupDesktop()
    else await setupMobile()
  }

  watch([layout, ready], async ([mode, isReady]) => {
    if (!import.meta.client || !isReady || !root.value) return
    if (chapters.value.filter(Boolean).length === 0) return
    await mount(mode)
  })

  onUnmounted(teardown)
}

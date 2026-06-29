import type { Ref } from 'vue'

interface AboutJourneyOptions {
  root: Ref<HTMLElement | null>
  chapters: Ref<HTMLElement[]>
  spineFill: Ref<HTMLElement | null>
  hero: Ref<HTMLElement | null>
  finale: Ref<HTMLElement | null>
  activeChapter: Ref<number>
  layout: Ref<'desktop' | 'mobile'>
  ready: Ref<boolean>
}

function contentEnterX(chapter: HTMLElement) {
  const side = chapter.querySelector('.about-chapter__content')?.getAttribute('data-chapter-side')
  if (side === 'left') return -72
  if (side === 'right') return 72
  return 0
}

export function useAboutJourney({
  root,
  chapters,
  spineFill,
  hero,
  finale,
  activeChapter,
  layout,
  ready,
}: AboutJourneyOptions) {
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

        gsap.from(hero.value.querySelectorAll('[data-hero-word]'), {
          yPercent: 100,
          opacity: 0,
          stagger: 0.06,
          duration: 1,
          ease: 'power3.out',
          delay: 0.15,
        })

        gsap.from(hero.value.querySelectorAll('[data-hero-fade]'), {
          y: 20,
          opacity: 0,
          stagger: 0.07,
          duration: 0.75,
          ease: 'power2.out',
          delay: 0.35,
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

        const enterX = contentEnterX(chapter)
        const titleWords = chapter.querySelectorAll<HTMLElement>('[data-chapter-word]')
        const desc = chapter.querySelector<HTMLElement>('[data-chapter-desc]')
        const fadeEls = chapter.querySelectorAll<HTMLElement>('[data-chapter-fade]')
        const items = chapter.querySelectorAll<HTMLElement>('[data-chapter-item]')

        ScrollTrigger.create({
          trigger: chapter,
          start: 'top 55%',
          end: 'bottom 45%',
          onEnter: () => { activeChapter.value = index },
          onEnterBack: () => { activeChapter.value = index },
        })

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
                end: 'top 40%',
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
                end: 'top 36%',
                scrub: 0.6,
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
              stagger: 0.05,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: chapter,
                start: 'top 70%',
                end: 'top 38%',
                scrub: 0.5,
              },
            },
          )
        }

        if (items.length) {
          gsap.fromTo(
            items,
            { y: 32, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              stagger: 0.08,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: chapter,
                start: 'top 75%',
                end: 'top 32%',
                scrub: 0.55,
              },
            },
          )
        }

      })

      if (finale.value) {
        ScrollTrigger.create({
          trigger: finale.value,
          start: 'top 88%',
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
          end: '+=70%',
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

        const enterX = contentEnterX(chapter)
        const titleWords = chapter.querySelectorAll<HTMLElement>('[data-chapter-word]')
        const desc = chapter.querySelector<HTMLElement>('[data-chapter-desc]')
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
            scrollTrigger: { trigger: chapter, start: 'top 82%', once: true },
          })
        }

        if (desc) {
          gsap.from(desc, {
            x: enterX * 0.85,
            opacity: 0,
            duration: 0.75,
            ease: 'power2.out',
            scrollTrigger: { trigger: chapter, start: 'top 78%', once: true },
          })
        }

        if (fadeEls.length) {
          gsap.from(fadeEls, {
            x: enterX * 0.65,
            opacity: 0,
            stagger: 0.06,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: { trigger: chapter, start: 'top 85%', once: true },
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

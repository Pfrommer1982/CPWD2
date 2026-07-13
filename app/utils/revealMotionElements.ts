export async function revealMotionElements(root: HTMLElement | null) {
  if (!root || !import.meta.client) return

  const { init } = useGsap()
  const gsap = await init()
  if (!gsap) return

  const selector = [
    '[data-hero-word]',
    '[data-hero-fade]',
    '[data-chapter-word]',
    '[data-chapter-desc]',
    '[data-chapter-fade]',
    '[data-chapter-stat]',
    '.will-reveal',
    '.will-reveal-left',
    '.will-reveal-scale',
  ].join(', ')

  gsap.set(root.querySelectorAll(selector), {
    opacity: 1,
    x: 0,
    y: 0,
    yPercent: 0,
    scale: 1,
  })
}

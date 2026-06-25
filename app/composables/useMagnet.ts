export function useMagnet(strength = 0.4) {
  let gsapInstance: typeof import('gsap').gsap | null = null
  const boundElements = new Map<HTMLElement, {
    onMove: (e: MouseEvent) => void
    onLeave: () => void
  }>()

  async function getGsap() {
    if (!import.meta.client) return null
    if (!gsapInstance) {
      const mod = await import('gsap')
      gsapInstance = mod.gsap
    }
    return gsapInstance
  }

  async function bindMagnet(el: HTMLElement | null) {
    if (!el || boundElements.has(el)) return

    const gsap = await getGsap()
    if (!gsap) return

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2

      gsap.to(el, {
        x: x * strength,
        y: y * strength,
        duration: 0.4,
        ease: 'power3.out',
      })
    }

    const onLeave = () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: 'elastic.out(1, 0.5)',
      })
    }

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    boundElements.set(el, { onMove, onLeave })
  }

  function unbindMagnet(el: HTMLElement | null) {
    if (!el) return
    const handlers = boundElements.get(el)
    if (!handlers) return

    el.removeEventListener('mousemove', handlers.onMove)
    el.removeEventListener('mouseleave', handlers.onLeave)
    boundElements.delete(el)
  }

  onUnmounted(() => {
    boundElements.forEach((handlers, el) => {
      el.removeEventListener('mousemove', handlers.onMove)
      el.removeEventListener('mouseleave', handlers.onLeave)
    })
    boundElements.clear()
  })

  return { bindMagnet, unbindMagnet }
}

import type { Ref } from 'vue'
import { resolveElementRef, type TemplateRefValue } from '~/utils/dom'

interface IlluminateRingOptions {
  ring: Ref<TemplateRefValue>
  trackArea: Ref<TemplateRefValue>
}

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value))
}

function fromCenter(ratioX: number, ratioY: number) {
  return Math.min(Math.max(0, Math.sqrt((ratioY - 0.5) ** 2 + (ratioX - 0.5) ** 2) / 0.5), 1)
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function asStyleElement(el: TemplateRefValue): HTMLElement | null {
  const resolved = resolveElementRef(el)
  if (!resolved?.style) return null
  return resolved
}

export function useIlluminateRing({ ring, trackArea }: IlluminateRingOptions) {
  if (!import.meta.client) return

  let frame = 0
  let cleanup: (() => void) | null = null
  let activeRing: HTMLElement | null = null

  const current = { x: 0.5, y: 0.75 }
  const mouse = { x: 0.5, y: 0.75, active: false, lastAt: 0 }

  function setVars(el: HTMLElement, x: number, y: number, extras: Record<string, string>) {
    if (!el.style) return

    el.style.setProperty('--ratio-x', String(x))
    el.style.setProperty('--ratio-y', String(y))
    el.style.setProperty('--from-center', String(fromCenter(x, y)))

    for (const [key, value] of Object.entries(extras)) {
      el.style.setProperty(key, value)
    }
  }

  function onPointerMove(event: PointerEvent) {
    const area = asStyleElement(trackArea.value)
    if (!area) return

    const box = area.getBoundingClientRect()
    if (!box.width || !box.height) return

    mouse.x = clamp((event.clientX - box.left) / box.width)
    mouse.y = clamp((event.clientY - box.top) / box.height)
    mouse.active = true
    mouse.lastAt = performance.now()
  }

  function onPointerLeave() {
    mouse.active = false
  }

  function startLoop(el: HTMLElement) {
    const t0 = performance.now()

    const tick = (now: number) => {
      if (activeRing !== el || !el.isConnected || !el.style) {
        return
      }

      const t = (now - t0) * 0.001

      const autoX = 0.5
        + Math.sin(t * 0.55) * 0.22
        + Math.sin(t * 1.15 + 1.4) * 0.09
        + Math.sin(t * 0.23 + 2.1) * 0.05

      const autoY = 0.5
        + Math.cos(t * 0.48 + 0.6) * 0.2
        + Math.cos(t * 0.95 + 2.2) * 0.08
        + Math.cos(t * 0.31 + 0.4) * 0.04

      const mouseWeight = mouse.active
        ? clamp(1 - (now - mouse.lastAt) / 2200, 0, 0.55)
        : 0

      const targetX = lerp(autoX, mouse.x, mouseWeight)
      const targetY = lerp(autoY, mouse.y, mouseWeight)

      current.x = lerp(current.x, targetX, 0.06)
      current.y = lerp(current.y, targetY, 0.06)

      setVars(el, current.x, current.y, {
        '--shimmer-angle': `${((t * 38) + Math.sin(t * 0.7) * 18) % 360}deg`,
        '--noise-x': `${Math.sin(t * 0.9) * 14 + Math.sin(t * 2.3) * 6}px`,
        '--noise-y': `${Math.cos(t * 0.75) * 12 + Math.cos(t * 1.9) * 5}px`,
        '--shimmer-pulse': String(0.72 + Math.sin(t * 1.6) * 0.12 + Math.sin(t * 3.1) * 0.05),
      })

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
  }

  function teardown() {
    cancelAnimationFrame(frame)
    cleanup?.()
    cleanup = null
    mouse.active = false
    activeRing = null
  }

  function setup(ringEl: HTMLElement, area: HTMLElement) {
    activeRing = ringEl

    setVars(ringEl, current.x, current.y, {
      '--shimmer-angle': '0deg',
      '--noise-x': '0px',
      '--noise-y': '0px',
      '--shimmer-pulse': '0.75',
    })

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    area.addEventListener('pointermove', onPointerMove, { passive: true })
    area.addEventListener('pointerleave', onPointerLeave, { passive: true })

    cleanup = () => {
      area.removeEventListener('pointermove', onPointerMove)
      area.removeEventListener('pointerleave', onPointerLeave)
    }

    startLoop(ringEl)
  }

  watch(
    [ring, trackArea],
    ([ringEl, areaEl]) => {
      teardown()

      const resolvedRing = asStyleElement(ringEl)
      const resolvedArea = asStyleElement(areaEl)
      if (resolvedRing && resolvedArea) setup(resolvedRing, resolvedArea)
    },
    { flush: 'post' },
  )

  onUnmounted(teardown)
}

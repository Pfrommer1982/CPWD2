export type CommsGlitchFx = 'tear' | 'tracking' | 'chroma' | 'dropout' | 'snow' | 'radar'

const FX_POOL: CommsGlitchFx[] = ['tear', 'tracking', 'chroma', 'dropout', 'snow', 'radar']

const FX_DURATION: Record<CommsGlitchFx, [number, number]> = {
  tear: [120, 320],
  tracking: [280, 720],
  chroma: [140, 380],
  dropout: [70, 180],
  snow: [180, 480],
  radar: [220, 560],
}

function shuffleFx<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5)
}

export function useCommsScreenGlitch() {
  const fx = reactive<Record<CommsGlitchFx, boolean>>({
    tear: false,
    tracking: false,
    chroma: false,
    dropout: false,
    snow: false,
    radar: false,
  })

  const glitchShift = ref({ x: 0, y: 0 })

  const fxTimeouts = new Map<CommsGlitchFx, ReturnType<typeof setTimeout>>()
  const scheduled: ReturnType<typeof setTimeout>[] = []
  let burstTimer: ReturnType<typeof setInterval> | null = null
  let running = false

  function schedule(fn: () => void, delay = 0) {
    const id = setTimeout(fn, delay)
    scheduled.push(id)
    return id
  }

  function activateFx(name: CommsGlitchFx, duration?: number) {
    const [min, max] = FX_DURATION[name]
    const ms = duration ?? min + Math.random() * (max - min)

    fx[name] = true
    glitchShift.value = {
      x: (Math.random() - 0.5) * (name === 'tear' ? 14 : 6),
      y: (Math.random() - 0.5) * (name === 'tracking' ? 10 : 4),
    }

    const existing = fxTimeouts.get(name)
    if (existing) clearTimeout(existing)

    fxTimeouts.set(name, setTimeout(() => {
      fx[name] = false
      if (!Object.values(fx).some(Boolean)) {
        glitchShift.value = { x: 0, y: 0 }
      }
      fxTimeouts.delete(name)
    }, ms))
  }

  function pickEffects(max = 2) {
    const count = 1 + Math.floor(Math.random() * max)
    return shuffleFx(FX_POOL).slice(0, count)
  }

  function triggerBurst() {
    pickEffects(2).forEach((name) => {
      schedule(() => activateFx(name), Math.random() * 120)
    })

    if (Math.random() > 0.55) {
      schedule(() => activateFx('dropout', 50 + Math.random() * 90), 40 + Math.random() * 80)
    }

    if (Math.random() > 0.7) {
      schedule(() => {
        activateFx('radar', 180 + Math.random() * 260)
      }, 120 + Math.random() * 200)
    }
  }

  function start() {
    if (!import.meta.client || running) return
    running = true

    schedule(triggerBurst, 4000 + Math.random() * 5000)

    burstTimer = setInterval(() => {
      if (Math.random() > 0.42) triggerBurst()
    }, 5200 + Math.random() * 6800)
  }

  function stop() {
    running = false
    if (burstTimer) clearInterval(burstTimer)
    burstTimer = null
    scheduled.forEach(clearTimeout)
    scheduled.length = 0
    fxTimeouts.forEach(clearTimeout)
    fxTimeouts.clear()
    FX_POOL.forEach(name => { fx[name] = false })
    glitchShift.value = { x: 0, y: 0 }
  }

  onUnmounted(stop)

  return { fx, glitchShift, triggerBurst, start, stop }
}

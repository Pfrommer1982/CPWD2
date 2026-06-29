export type VideoFeedFx = 'signal' | 'tear' | 'burst' | 'tracking' | 'dropout' | 'chroma' | 'snow'

const FX_POOL: VideoFeedFx[] = ['signal', 'tear', 'burst', 'tracking', 'dropout', 'chroma', 'snow']

const FX_DURATION: Record<VideoFeedFx, [number, number]> = {
  signal: [280, 720],
  tear: [240, 640],
  burst: [160, 480],
  tracking: [400, 900],
  dropout: [90, 260],
  chroma: [200, 520],
  snow: [260, 680],
}

function shuffleFx<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5)
}

function wait(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

export function useVideoFeedGlitch() {
  const fx = reactive<Record<VideoFeedFx, boolean>>({
    signal: false,
    tear: false,
    burst: false,
    tracking: false,
    dropout: false,
    chroma: false,
    snow: false,
  })

  const fxTimeouts = new Map<VideoFeedFx, ReturnType<typeof setTimeout>>()
  const scheduled: ReturnType<typeof setTimeout>[] = []
  let burstTimer: ReturnType<typeof setInterval> | null = null
  let running = false

  function schedule(fn: () => void, delay = 0) {
    const id = setTimeout(fn, delay)
    scheduled.push(id)
    return id
  }

  function activateFx(name: VideoFeedFx, duration?: number) {
    const [min, max] = FX_DURATION[name]
    const ms = duration ?? min + Math.random() * (max - min)

    fx[name] = true
    const existing = fxTimeouts.get(name)
    if (existing) clearTimeout(existing)

    fxTimeouts.set(name, setTimeout(() => {
      fx[name] = false
      fxTimeouts.delete(name)
    }, ms))
  }

  function pickEffects(max = 3) {
    const count = 1 + Math.floor(Math.random() * max)
    return shuffleFx(FX_POOL).slice(0, count)
  }

  function triggerBurst() {
    pickEffects(3).forEach((name) => {
      const delay = Math.random() > 0.3 ? 0 : Math.random() * 160
      schedule(() => activateFx(name), delay)
    })

    if (Math.random() > 0.35) {
      schedule(() => {
        pickEffects(2).forEach(name => activateFx(name, 100 + Math.random() * 240))
      }, 180 + Math.random() * 420)
    }

    if (Math.random() > 0.65) {
      schedule(() => activateFx('dropout', 60 + Math.random() * 120), 50 + Math.random() * 100)
    }
  }

  function start() {
    if (!import.meta.client || running) return
    running = true

    triggerBurst()

    burstTimer = setInterval(() => {
      if (Math.random() > 0.3) triggerBurst()
    }, 1800 + Math.random() * 2200)
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
  }

  onUnmounted(stop)

  return { fx, triggerBurst, start, stop, wait }
}

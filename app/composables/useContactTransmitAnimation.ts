const CIPHER = '0123456789ABCDEF'

export type ContactTransmitPhase = 'idle' | 'prepare' | 'encrypt' | 'hash' | 'transmit' | 'complete'
export type EncryptSubStep = 'metadata' | 'payload' | 'keygen'
export type AesBlockState = 'idle' | 'scrambling' | 'sealed'

function sleep(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

function pseudoHash(input: string) {
  let h = 5381
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) + h + input.charCodeAt(i)) | 0
  }
  let out = ''
  for (let i = 0; i < 32; i++) {
    h = Math.imul(h ^ (h >>> 16), 0x7feb352d)
    h = Math.imul(h ^ (h >>> 15), 0x846ca68b)
    h ^= h >>> 16
    out += CIPHER[Math.abs(h) % 16]
    out += CIPHER[(Math.abs(h) >> 4) % 16]
  }
  return out
}

function randomHexPair() {
  const a = CIPHER[Math.floor(Math.random() * 16)] ?? '0'
  const b = CIPHER[Math.floor(Math.random() * 16)] ?? '0'
  return a + b
}

function toCipherTokens(text: string) {
  return text.split('\n').map(line =>
    line.split('').map(ch => ch.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')),
  )
}

function scrambleToHex(text: string, t: number, lockSpread = 0.82, lockOffset = 0.12) {
  const target = text.split('').map(ch => ch.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0'))
  const len = Math.max(1, text.length)
  return target.map((token, i) => {
    const lock = (i / len) * lockSpread + lockOffset
    return t >= lock ? token : randomHexPair()
  }).join(' ')
}

function generateSessionId() {
  const ts = Date.now().toString(36).toUpperCase()
  let suffix = ''
  for (let i = 0; i < 6; i++) suffix += CIPHER[Math.floor(Math.random() * 16)]
  return `TX-${ts}-${suffix}`
}

function generateKeyLine(length = 16) {
  let out = ''
  for (let i = 0; i < length; i++) out += randomHexPair() + (i < length - 1 ? ' ' : '')
  return out.trim()
}

export function useContactTransmitAnimation() {
  const phase = ref<ContactTransmitPhase>('idle')
  const encryptSubStep = ref<EncryptSubStep>('metadata')
  const sessionId = ref('')
  const operatorCipher = ref('')
  const addressCipher = ref('')
  const cipherLines = ref<string[]>([])
  const aesBlocks = ref<AesBlockState[]>(Array.from({ length: 16 }, () => 'idle'))
  const keyIv = ref('')
  const keySession = ref('')
  const keyProgress = ref(0)
  const payloadHash = ref('')
  const hashProgress = ref(0)
  const transmitProgress = ref(0)
  const transmitHop = ref(0)
  const encryptProgress = ref(0)
  const telemetry = ref({ snr: 0, latency: 0, bitrate: 0 })

  let raf = 0

  function stopRaf() {
    cancelAnimationFrame(raf)
    raf = 0
  }

  function setEncryptProgress(value: number) {
    encryptProgress.value = Math.min(100, Math.max(0, Math.round(value)))
  }

  async function scrambleField(
    text: string,
    setter: (value: string) => void,
    durationMs: number,
    progressFrom: number,
    progressTo: number,
  ) {
    await new Promise<void>((resolve) => {
      const start = performance.now()
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / durationMs)
        setter(scrambleToHex(text, t))
        setEncryptProgress(progressFrom + (progressTo - progressFrom) * t)
        if (t < 1) raf = requestAnimationFrame(tick)
        else {
          setter(scrambleToHex(text, 1))
          resolve()
        }
      }
      raf = requestAnimationFrame(tick)
    })
  }

  async function scrambleMessage(message: string, durationMs = 3200) {
    const targets = toCipherTokens(message)
    const flatLen = Math.max(1, message.replace(/\n/g, '').length)

    aesBlocks.value = Array.from({ length: 16 }, () => 'idle')

    await new Promise<void>((resolve) => {
      const start = performance.now()

      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / durationMs)
        setEncryptProgress(28 + t * 42)

        let charIdx = 0
        cipherLines.value = targets.map(line =>
          line.map((token) => {
            const lock = (charIdx / flatLen) * 0.82 + 0.12
            charIdx++
            if (t >= lock) return token
            return randomHexPair()
          }).join(' '),
        )

        const sealedCount = Math.floor(t * 16)
        aesBlocks.value = aesBlocks.value.map((_, i) => {
          if (i < sealedCount) return 'sealed'
          if (i === sealedCount && sealedCount < 16) return 'scrambling'
          return 'idle'
        })

        if (t < 1) raf = requestAnimationFrame(tick)
        else {
          cipherLines.value = targets.map(line => line.join(' '))
          aesBlocks.value = aesBlocks.value.map(() => 'sealed')
          resolve()
        }
      }

      raf = requestAnimationFrame(tick)
    })
  }

  async function runKeygen(durationMs = 1600) {
    const targetIv = generateKeyLine(8)
    const targetKey = generateKeyLine(16)
    keyIv.value = ''
    keySession.value = ''
    keyProgress.value = 0

    await new Promise<void>((resolve) => {
      const start = performance.now()
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / durationMs)
        keyProgress.value = Math.round(t * 100)
        setEncryptProgress(70 + t * 18)

        const ivTokens = targetIv.split(' ')
        const keyTokens = targetKey.split(' ')
        const ivCount = Math.ceil(ivTokens.length * Math.min(1, t * 1.15))
        const keyCount = Math.ceil(keyTokens.length * Math.min(1, Math.max(0, (t - 0.25) * 1.35)))

        keyIv.value = ivTokens.slice(0, ivCount).map((token, i) =>
          i < ivCount - 1 ? token : (t >= (i / ivTokens.length) * 0.9 + 0.1 ? token : randomHexPair()),
        ).join(' ')

        keySession.value = keyTokens.slice(0, keyCount).map((token, i) =>
          i < keyCount - 1 ? token : (t >= 0.25 + (i / keyTokens.length) * 0.75 ? token : randomHexPair()),
        ).join(' ')

        if (t < 1) raf = requestAnimationFrame(tick)
        else {
          keyIv.value = targetIv
          keySession.value = targetKey
          keyProgress.value = 100
          resolve()
        }
      }
      raf = requestAnimationFrame(tick)
    })
  }

  async function runHashBuild(fullHash: string, durationMs = 1800) {
    hashProgress.value = 0
    payloadHash.value = ''

    await new Promise<void>((resolve) => {
      const start = performance.now()
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / durationMs)
        hashProgress.value = Math.round(t * 100)
        const chars = Math.floor(fullHash.length * t)
        payloadHash.value = fullHash.slice(0, chars)
        if (t < 1) raf = requestAnimationFrame(tick)
        else {
          payloadHash.value = fullHash
          hashProgress.value = 100
          resolve()
        }
      }
      raf = requestAnimationFrame(tick)
    })
  }

  async function runTransmitBar(durationMs = 3400, hopCount = 4) {
    transmitProgress.value = 0
    transmitHop.value = 0
    telemetry.value = { snr: 94.2, latency: 48, bitrate: 0 }

    await new Promise<void>((resolve) => {
      const start = performance.now()
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / durationMs)
        transmitProgress.value = Math.round(t * 100)
        transmitHop.value = Math.min(hopCount - 1, Math.floor(t * hopCount))

        telemetry.value = {
          snr: 94.2 + t * 4.2 + Math.sin(now * 0.008) * 0.15,
          latency: Math.max(8, 48 - t * 36 + Math.sin(now * 0.012) * 1.2),
          bitrate: Math.round(t * 1280 + Math.sin(now * 0.01) * 12),
        }

        if (t < 1) raf = requestAnimationFrame(tick)
        else {
          transmitProgress.value = 100
          transmitHop.value = hopCount - 1
          telemetry.value = { snr: 98.4, latency: 11, bitrate: 1280 }
          resolve()
        }
      }
      raf = requestAnimationFrame(tick)
    })
  }

  async function runPreparePhase() {
    phase.value = 'prepare'
    sessionId.value = ''
    setEncryptProgress(0)

    await new Promise<void>((resolve) => {
      const id = generateSessionId()
      const start = performance.now()
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / 700)
        const chars = Math.floor(id.length * t)
        sessionId.value = id.slice(0, chars)
        if (t < 1) raf = requestAnimationFrame(tick)
        else {
          sessionId.value = id
          resolve()
        }
      }
      raf = requestAnimationFrame(tick)
    })

    await sleep(280)
  }

  async function runEncryptPhase(name: string, email: string, message: string) {
    phase.value = 'encrypt'
    operatorCipher.value = ''
    addressCipher.value = ''
    cipherLines.value = []
    keyIv.value = ''
    keySession.value = ''
    payloadHash.value = ''
    setEncryptProgress(0)

    encryptSubStep.value = 'metadata'
    await scrambleField(name, v => { operatorCipher.value = v }, 900, 2, 14)
    await scrambleField(email, v => { addressCipher.value = v }, 900, 14, 26)
    await sleep(180)

    encryptSubStep.value = 'payload'
    await scrambleMessage(message)
    await sleep(220)

    encryptSubStep.value = 'keygen'
    await runKeygen()
    await sleep(200)
    setEncryptProgress(100)
  }

  async function runHashPhase(name: string, email: string, message: string) {
    phase.value = 'hash'
    const fullHash = pseudoHash(`${name}|${email}|${message}`)
    await runHashBuild(fullHash)
    await sleep(420)
  }

  async function runTransmitPhase(hopCount = 4) {
    phase.value = 'transmit'
    await runTransmitBar(3400, hopCount)
  }

  function reset() {
    stopRaf()
    phase.value = 'idle'
    encryptSubStep.value = 'metadata'
    sessionId.value = ''
    operatorCipher.value = ''
    addressCipher.value = ''
    cipherLines.value = []
    aesBlocks.value = Array.from({ length: 16 }, () => 'idle')
    keyIv.value = ''
    keySession.value = ''
    keyProgress.value = 0
    payloadHash.value = ''
    hashProgress.value = 0
    transmitProgress.value = 0
    transmitHop.value = 0
    encryptProgress.value = 0
    telemetry.value = { snr: 0, latency: 0, bitrate: 0 }
  }

  onUnmounted(stopRaf)

  return {
    phase,
    encryptSubStep,
    sessionId,
    operatorCipher,
    addressCipher,
    cipherLines,
    aesBlocks,
    keyIv,
    keySession,
    keyProgress,
    payloadHash,
    hashProgress,
    transmitProgress,
    transmitHop,
    encryptProgress,
    telemetry,
    runPreparePhase,
    runEncryptPhase,
    runHashPhase,
    runTransmitPhase,
    reset,
  }
}

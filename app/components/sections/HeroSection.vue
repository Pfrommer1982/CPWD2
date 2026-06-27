<script setup lang="ts">
const hero = useSectionTranslations('hero')
const localePath = useLocalePath()

const canvasEl = ref<HTMLCanvasElement>()
const labelEl = ref<HTMLElement>()
const bottomEl = ref<HTMLElement>()
const scrollEl = ref<HTMLElement>()

onMounted(async () => {
  if (!import.meta.client) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const { gsap } = await import('gsap')

  const tl = gsap.timeline({ delay: 0.5 })

  tl.from(labelEl.value, {
    opacity: 0,
    y: 20,
    duration: 0.8,
    ease: 'power3.out',
  })
    .from('.hero__line', {
      y: 80,
      opacity: 0,
      duration: 1.1,
      stagger: 0.12,
      ease: 'power4.out',
    }, '-=0.4')
    .from(bottomEl.value, {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: 'power3.out',
    }, '-=0.5')
    .from(scrollEl.value, {
      opacity: 0,
      duration: 0.6,
    }, '-=0.3')

  try {
    const THREE = await import('three')
    const canvas = canvasEl.value
    if (!canvas) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 5

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    const count = 1200
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10

      const isGold = Math.random() > 0.7
      colors[i * 3] = isGold ? 0.83 : 0.95
      colors[i * 3 + 1] = isGold ? 0.69 : 0.93
      colors[i * 3 + 2] = isGold ? 0.33 : 0.91
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const circleSize = 64
    const circleCanvas = document.createElement('canvas')
    circleCanvas.width = circleSize
    circleCanvas.height = circleSize
    const circleCtx = circleCanvas.getContext('2d')
    if (circleCtx) {
      circleCtx.beginPath()
      circleCtx.arc(circleSize / 2, circleSize / 2, circleSize / 2, 0, Math.PI * 2)
      circleCtx.fillStyle = '#ffffff'
      circleCtx.fill()
    }
    const circleTexture = new THREE.CanvasTexture(circleCanvas)

    const material = new THREE.PointsMaterial({
      size: 0.015,
      map: circleTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
    })

    const particles = new THREE.Points(geometry, material)
    scene.add(particles)

    let animFrame = 0
    const animate = () => {
      animFrame = requestAnimationFrame(animate)
      particles.rotation.y += 0.0002
      particles.rotation.x += 0.0001
      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    onUnmounted(() => {
      cancelAnimationFrame(animFrame)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      geometry.dispose()
      material.dispose()
      circleTexture.dispose()
    })
  } catch (e) {
    console.warn('Three.js could not load:', e)
  }
})
</script>

<template>
  <section class="hero section--hero">
    <ClientOnly>
      <canvas ref="canvasEl" class="hero__canvas" />
    </ClientOnly>

    <div class="hero__noise" />

    <div class="hero__content container">
      <p ref="labelEl" class="hero__label section-label">
        CPWD
      </p>

      <h1 class="hero__headline">
        <span class="hero__line hero__line--body">{{ hero.t('line1') }}</span>
        <span class="hero__line hero__line--display"><em>{{ hero.t('line2') }}</em></span>
        <span class="hero__line hero__line--body">{{ hero.t('line3') }}</span>
      </h1>

      <div ref="bottomEl" class="hero__bottom">
        <NuxtLink :to="localePath('/work')" class="link-arrow" data-cursor="view">
          {{ hero.t('cta') }}
          <span class="arrow-icon">→</span>
        </NuxtLink>

        <p class="hero__sub">
          {{ hero.t('locationBefore') }}
          <span class="text-gold">{{ hero.t('locationPlace') }}</span>,
          {{ hero.t('locationAfter') }}
        </p>
      </div>
    </div>

    <div ref="scrollEl" class="hero__scroll">
      <div class="hero__scroll-line" />
      <span class="label">Scroll</span>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.hero {
  position: relative;
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  background: $color-bg;

  &__canvas {
    position: absolute;
    inset: 0;
    z-index: $z-base;
    width: 100%;
    height: 100%;
  }

  &__noise {
    position: absolute;
    inset: 0;
    z-index: 1;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none;
    opacity: 0.5;
  }

  &__content {
    position: relative;
    z-index: $z-raised;
    padding-top: 120px;
    padding-bottom: 80px;
  }

  &__label {
    margin-bottom: $space-8;
  }

  &__headline {
    display: flex;
    flex-direction: column;
    gap: 0;
    margin-bottom: $space-12;
  }

  &__line {
    display: block;
    overflow: hidden;

    &--body {
      font-family: $font-body;
      font-size: $text-4xl;
      font-weight: 300;
      letter-spacing: $tracking-tight;
      color: $color-text-muted;
      line-height: 1.1;
    }

    &--display {
      font-family: $font-display;
      font-size: $text-hero;
      font-weight: 300;
      line-height: 0.95;
      letter-spacing: -0.04em;
      color: $color-text;

      em {
        font-style: italic;
        color: $color-gold-light;
      }
    }
  }

  &__bottom {
    display: flex;
    align-items: center;
    gap: $space-10;
    flex-wrap: wrap;
  }

  &__sub {
    font-family: $font-mono;
    font-size: $text-xs;
    letter-spacing: $tracking-wide;
    color: $color-text-faint;
  }

  &__scroll {
    position: absolute;
    bottom: $space-8;
    left: 50%;
    transform: translateX(-50%);
    z-index: $z-raised;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $space-3;
  }

  &__scroll-line {
    width: 1px;
    height: 40px;
    background: linear-gradient(to bottom, $color-gold, transparent);
    animation: scroll-bounce 2s ease-in-out infinite;
  }
}
</style>

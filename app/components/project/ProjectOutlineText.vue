<script setup lang="ts">
const props = withDefaults(defineProps<{
  text: string
  tag?: 'p' | 'h2' | 'h3' | 'div'
  size?: 'display' | 'body'
  scrollStart?: string
  scrollEnd?: string
}>(), {
  tag: 'p',
  size: 'display',
  scrollStart: 'top 88%',
  scrollEnd: 'top 30%',
})

const rootRef = ref<HTMLElement>()
let animationCtx: ReturnType<typeof import('gsap').gsap.context> | null = null

const words = computed(() => props.text.split(/\s+/).filter(Boolean))

onMounted(async () => {
  if (!import.meta.client || !rootRef.value) return

  const fills = rootRef.value.querySelectorAll<HTMLElement>('.outline-text__fill')

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    fills.forEach(fill => { fill.style.clipPath = 'inset(0)' })
    return
  }

  const { init } = useGsap()
  const gsap = await init()
  if (!gsap || !fills.length) return

  animationCtx = gsap.context(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: rootRef.value,
        start: props.scrollStart,
        end: props.scrollEnd,
        scrub: 0.55,
      },
    })

    fills.forEach((fill) => {
      tl.fromTo(
        fill,
        { clipPath: 'inset(0 100% 0 0)' },
        { clipPath: 'inset(0 0% 0 0)', duration: 1, ease: 'none' },
      )
    })
  }, rootRef.value)

  await nextTick()
  await useLenis().refresh()
})

onUnmounted(() => {
  animationCtx?.revert()
  animationCtx = null
})
</script>

<template>
  <component
    :is="tag"
    ref="rootRef"
    class="outline-text"
    :class="`outline-text--${size}`"
  >
    <span class="outline-text__sr">{{ text }}</span>
    <span class="outline-text__visual" aria-hidden="true">
      <span
        v-for="(word, i) in words"
        :key="`${word}-${i}`"
        class="outline-text__word"
      >
        <span class="outline-text__stroke">{{ word }}</span>
        <span class="outline-text__fill">{{ word }}</span>
      </span>
    </span>
  </component>
</template>

<style lang="scss" scoped>
.outline-text {
  position: relative;
  margin: 0;

  &--display {
    font-family: $font-display;
    font-size: clamp(1.75rem, 3vw + 0.75rem, 3.25rem);
    font-weight: 300;
    line-height: 1.12;
    letter-spacing: $tracking-tight;
    max-width: min(880px, 100%);
  }

  &--body {
    font-family: $font-display;
    font-size: clamp(1.05rem, 0.95rem + 0.45vw, 1.35rem);
    font-weight: 300;
    line-height: 1.45;
    max-width: 72ch;
  }

  &__sr {
    @include visually-hidden;
  }

  &__visual {
    display: block;
  }

  &__word {
    position: relative;
    display: inline-block;
    margin-right: 0.3em;
    vertical-align: top;
  }

  &__stroke,
  &__fill {
    display: block;
  }

  &__stroke {
    color: transparent;
    -webkit-text-stroke: 1px rgba(242, 238, 232, 0.22);
  }

  &__fill {
    position: absolute;
    inset: 0 auto auto 0;
    color: $color-text-muted;
    clip-path: inset(0 100% 0 0);
    will-change: clip-path;
  }
}
</style>

<script setup lang="ts">
type HeroTitleLine = string | {
  text: string
  accent?: boolean
}

const props = withDefaults(defineProps<{
  text?: string
  lines?: HeroTitleLine[]
  tag?: 'h1' | 'h2' | 'h3'
  ariaLabel?: string
  delay?: number
  supportingAt?: number
  animateSupporting?: boolean
}>(), {
  text: '',
  lines: () => [],
  tag: 'h1',
  ariaLabel: '',
  delay: 0.1,
  supportingAt: 0.32,
  animateSupporting: true,
})

const titleRef = ref<HTMLElement | null>(null)
const mounted = ref(false)
let animationContext: ReturnType<typeof import('gsap').gsap.context> | null = null

const normalizedLines = computed(() => {
  const source: HeroTitleLine[] = props.lines.length ? props.lines : [props.text]

  return source
    .map((line) => {
      const normalized = typeof line === 'string' ? { text: line, accent: false } : line
      return {
        ...normalized,
        words: normalized.text.split(/\s+/).filter(Boolean),
      }
    })
    .filter(line => line.words.length)
})

const accessibleTitle = computed(() => (
  props.ariaLabel
  || normalizedLines.value.map(line => line.text.trim()).join(' ')
))

async function play() {
  if (!import.meta.client || !titleRef.value) return

  animationContext?.revert()
  animationContext = null

  const { animateMotion } = useGraphicsCapability()
  if (!animateMotion.value) return

  const { init } = useGsap()
  const gsap = await init()
  if (!gsap || !mounted.value || !titleRef.value) return

  const title = titleRef.value
  const hero = title.closest<HTMLElement>('[data-page-hero]')
  const words = title.querySelectorAll<HTMLElement>('[data-hero-word]')
  const supporting = props.animateSupporting
    ? hero?.querySelectorAll<HTMLElement>('[data-hero-fade]') ?? []
    : []

  animationContext = gsap.context(() => {
    const timeline = gsap.timeline({ delay: props.delay })

    timeline.from(words, {
      yPercent: 100,
      opacity: 0,
      stagger: 0.065,
      duration: 1,
      ease: 'power3.out',
      clearProps: 'transform,opacity',
    }, 0)

    if (supporting.length) {
      timeline.from(supporting, {
        y: 22,
        opacity: 0,
        stagger: 0.075,
        duration: 0.78,
        ease: 'power2.out',
        clearProps: 'transform,opacity',
      }, props.supportingAt)
    }
  }, hero ?? title)
}

onMounted(() => {
  mounted.value = true
  void play()
})

watch(accessibleTitle, async () => {
  if (!mounted.value) return
  await nextTick()
  void play()
})

onBeforeUnmount(() => {
  mounted.value = false
  animationContext?.revert()
  animationContext = null
})

defineExpose({ play })
</script>

<template>
  <component
    :is="tag"
    ref="titleRef"
    class="page-hero-title"
    :aria-label="accessibleTitle"
  >
    <span aria-hidden="true">
      <span
        v-for="(line, lineIndex) in normalizedLines"
        :key="`${line.text}-${lineIndex}`"
        class="page-hero-title__line"
        :class="{ 'page-hero-title__line--accent': line.accent }"
        :data-line-index="lineIndex"
      >
        <template
          v-for="(word, wordIndex) in line.words"
          :key="`${lineIndex}-${wordIndex}-${word}`"
        >
          <span class="page-hero-title__word-clip">
            <span class="page-hero-title__word" data-hero-word>{{ word }}</span>
          </span>{{ wordIndex < line.words.length - 1 ? ' ' : '' }}
        </template>{{ lineIndex < normalizedLines.length - 1 ? ' ' : '' }}
      </span>
    </span>
  </component>
</template>

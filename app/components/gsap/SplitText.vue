<script setup lang="ts">
const props = withDefaults(defineProps<{
  mode?: 'words' | 'chars'
  trigger?: boolean
}>(), {
  mode: 'words',
  trigger: true,
})

const elRef = ref<HTMLElement | null>(null)
const { splitIntoWords, splitIntoChars } = useSplitText()
const { createContext, init } = useGsap()

async function animate() {
  if (!elRef.value) return

  const targets = props.mode === 'chars'
    ? splitIntoChars(elRef.value)
    : splitIntoWords(elRef.value)

  await createContext(elRef.value, async () => {
    const gsap = await init()
    const scrollModule = await import('gsap/ScrollTrigger')
    if (!gsap) return

    const animation = {
      y: '110%',
      opacity: 0,
      duration: 0.8,
      stagger: props.mode === 'chars' ? 0.02 : 0.05,
      ease: 'power4.out',
    }

    if (props.trigger) {
      gsap.from(targets, {
        ...animation,
        scrollTrigger: {
          trigger: elRef.value,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      })
    } else {
      gsap.from(targets, animation)
    }
  })
}

onMounted(animate)

const { locale } = useI18n()
watch(locale, () => {
  if (elRef.value) {
    elRef.value.textContent = elRef.value.textContent
    animate()
  }
})
</script>

<template>
  <div ref="elRef" class="split-text text-reveal">
    <slot />
  </div>
</template>

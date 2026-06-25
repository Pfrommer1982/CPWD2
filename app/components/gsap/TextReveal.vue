<script setup lang="ts">
const props = withDefaults(defineProps<{
  tag?: string
  delay?: number
  stagger?: number
}>(), {
  tag: 'div',
  delay: 0,
  stagger: 0.05,
})

const elRef = ref<HTMLElement | null>(null)
const { splitIntoWords } = useSplitText()
const { createContext } = useGsap()

onMounted(async () => {
  if (!elRef.value) return

  splitIntoWords(elRef.value)

  await createContext(elRef.value, async () => {
    const { init } = useGsap()
    const gsap = await init()
    if (!gsap) return

    gsap.from(elRef.value!.querySelectorAll('.word'), {
      y: '110%',
      opacity: 0,
      duration: 0.8,
      stagger: props.stagger,
      delay: props.delay,
      ease: 'power4.out',
    })
  })
})
</script>

<template>
  <component :is="tag" ref="elRef" class="text-reveal">
    <slot />
  </component>
</template>

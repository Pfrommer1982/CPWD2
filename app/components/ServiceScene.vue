<script setup lang="ts">
import ServicesBrandBoard from '~/components/services/ServicesBrandBoard.vue'
import ServicesCloudNetwork from '~/components/services/ServicesCloudNetwork.vue'
import ServicesDesignBrowser from '~/components/services/ServicesDesignBrowser.vue'
import ServicesDevPipeline from '~/components/services/ServicesDevPipeline.vue'
import ServicesMotionScrub from '~/components/services/ServicesMotionScrub.vue'
import ServicesSoundWaveform from '~/components/services/ServicesSoundWaveform.vue'

const props = withDefaults(defineProps<{
  number: string
  active?: boolean
}>(), {
  active: true,
})

const SCENES = {
  '01': ServicesDesignBrowser,
  '02': ServicesDevPipeline,
  '03': ServicesCloudNetwork,
  '04': ServicesSoundWaveform,
  '05': ServicesMotionScrub,
  '06': ServicesBrandBoard,
} as const

function sceneFor(number: string) {
  return SCENES[number as keyof typeof SCENES] ?? null
}
</script>

<template>
  <component
    :is="sceneFor(number)"
    v-if="sceneFor(number)"
    :active="active"
  />
</template>

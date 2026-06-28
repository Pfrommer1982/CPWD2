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
  mobile?: boolean
  embedded?: boolean
}>(), {
  active: false,
  mobile: false,
  embedded: false,
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
  <div
    class="service-scene-host"
    :class="{
      'service-scene-host--mobile': mobile,
      'service-scene-host--embedded': embedded,
    }"
  >
    <component
      :is="sceneFor(number)"
      v-if="sceneFor(number)"
      :active="mobile ? false : active"
      :mobile="mobile"
    />
  </div>
</template>

<style lang="scss" scoped>
.service-scene-host {
  position: absolute;
  inset: 0;
  pointer-events: none;

  &--mobile {
    position: relative;
    inset: auto;
    width: 100%;
    height: 100%;
  }

  &--embedded {
    position: relative;
    inset: auto;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: inherit;
  }
}
</style>

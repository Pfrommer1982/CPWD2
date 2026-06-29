<script setup lang="ts">
definePageMeta({
  layout: 'default',
  hideFooter: true,
})
</script>

<template>
  <div class="page-contact">
    <SectionsContactJourneySection />
  </div>
</template>

<style lang="scss" scoped>
.page-contact {
  position: relative;
  z-index: 2;
  padding-top: 0;
}
</style>

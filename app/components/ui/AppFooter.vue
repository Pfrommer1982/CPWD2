<script setup lang="ts">
const common = useSectionTranslations('common')
const localePath = useLocalePath()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="app-footer section">
    <div class="app-footer__inner container container--wide">
      <div class="divider divider--gold app-footer__divider" />

      <div class="app-footer__top">
        <NuxtLink :to="localePath('/')" class="app-footer__logo" aria-label="CPWD">
          <UiAppLogo :height="40" />
        </NuxtLink>
        <p class="app-footer__tagline label">
          {{ common.t('footer.built') }}
        </p>
      </div>

      <div class="app-footer__bottom">
        <p class="app-footer__copy text-muted">
          {{ common.t('footer.copy', { year }) }}
        </p>
        <div class="app-footer__links">
          <a href="mailto:info@cpwd.nl" class="link-slide">info@cpwd.nl</a>
          <a href="https://linkedin.com" target="_blank" rel="noopener" class="link-slide">LinkedIn</a>
          <a href="https://github.com" target="_blank" rel="noopener" class="link-slide">GitHub</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.app-footer {
  padding-top: $space-12;
  padding-bottom: $space-8;
  background: $color-bg-alt;

  &__divider {
    margin-bottom: $space-10;
  }

  &__top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: $space-10;
    flex-wrap: wrap;
    gap: $space-6;
  }

  &__logo {
    display: flex;
    align-items: center;
  }

  &__tagline {
    color: $color-text-faint;
  }

  &__bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: $space-5;
    padding-top: $space-8;
    border-top: 1px solid $color-border;
  }

  &__copy {
    font-size: $text-sm;
  }

  &__links {
    display: flex;
    gap: $space-8;
    font-size: $text-sm;
  }
}
</style>

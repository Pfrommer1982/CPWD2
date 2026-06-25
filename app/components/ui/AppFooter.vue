<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="app-footer">
    <div class="app-footer__inner">
      <div class="app-footer__top">
        <NuxtLink :to="localePath('/')" class="app-footer__logo font-display">
          CPWD
        </NuxtLink>
        <p class="app-footer__tagline font-mono">
          {{ t('footer.built') }}
        </p>
      </div>
      <div class="app-footer__bottom">
        <p class="app-footer__copy">
          {{ t('footer.copy', { year }) }}
        </p>
        <div class="app-footer__social">
          <a href="https://linkedin.com" target="_blank" rel="noopener">LinkedIn</a>
          <a href="https://github.com" target="_blank" rel="noopener">GitHub</a>
          <a href="https://dribbble.com" target="_blank" rel="noopener">Dribbble</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.app-footer {
  padding: $space-3xl $grid-gutter $space-xl;
  border-top: 1px solid $color-border;

  &__inner {
    @include container;
  }

  &__top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: $space-2xl;
    flex-wrap: wrap;
    gap: $space-lg;
  }

  &__logo {
    font-size: $text-2xl;
  }

  &__tagline {
    color: $color-text-muted;
  }

  &__bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: $space-md;
    padding-top: $space-xl;
    border-top: 1px solid $color-border;
  }

  &__copy {
    font-size: $text-sm;
    color: $color-text-muted;
  }

  &__social {
    display: flex;
    gap: $space-lg;

    a {
      font-size: $text-sm;
      color: $color-text-muted;
      @include hover-underline;
      transition: color $duration-fast $ease-out-expo;

      &:hover {
        color: $color-accent;
      }
    }
  }
}
</style>

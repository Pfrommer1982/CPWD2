<script setup lang="ts">
const { t, locale, locales } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const route = useRoute()

const isScrolled = ref(false)
const menuOpen = ref(false)

const navLinks = computed(() => [
  { label: t('nav.work'), to: localePath('/work') },
  { label: t('nav.about'), to: localePath('/about') },
  { label: t('nav.services'), to: localePath('/services') },
  { label: t('nav.contact'), to: localePath('/contact') },
])

const availableLocales = computed(() =>
  (locales.value as { code: string, name: string }[]).filter(l => l.code !== locale.value),
)

function toggleMenu() {
  menuOpen.value = !menuOpen.value
  document.body.style.overflow = menuOpen.value ? 'hidden' : ''
}

function closeMenu() {
  menuOpen.value = false
  document.body.style.overflow = ''
}

function switchLocale(code: string) {
  navigateTo(switchLocalePath(code))
}

onMounted(() => {
  const onScroll = () => {
    isScrolled.value = window.scrollY > 80
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  onUnmounted(() => window.removeEventListener('scroll', onScroll))
})

const { setCursorState } = useCursor()

function onLinkEnter() {
  setCursorState('hover')
}

function onLinkLeave() {
  setCursorState('default')
}
</script>

<template>
  <header class="app-nav" :class="{ 'app-nav--scrolled': isScrolled, 'app-nav--open': menuOpen }">
    <div class="app-nav__inner">
      <NuxtLink :to="localePath('/')" class="app-nav__logo font-display" @click="closeMenu">
        CPWD
      </NuxtLink>

      <nav class="app-nav__desktop">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="app-nav__link"
          :class="{ 'app-nav__link--active': route.path === link.to || route.path.startsWith(link.to + '/') }"
          @mouseenter="onLinkEnter"
          @mouseleave="onLinkLeave"
        >
          <span class="app-nav__link-text">{{ link.label }}</span>
          <span class="app-nav__link-arrow">↗</span>
        </NuxtLink>

        <div class="app-nav__lang">
          <button
            v-for="loc in availableLocales"
            :key="loc.code"
            class="app-nav__lang-btn font-mono"
            @click="switchLocale(loc.code)"
          >
            {{ loc.code.toUpperCase() }}
          </button>
        </div>
      </nav>

      <button class="app-nav__toggle" aria-label="Toggle menu" @click="toggleMenu">
        <span /><span />
      </button>
    </div>

    <div class="app-nav__mobile" :class="{ 'app-nav__mobile--open': menuOpen }">
      <NuxtLink
        v-for="(link, i) in navLinks"
        :key="link.to"
        :to="link.to"
        class="app-nav__mobile-link font-display"
        :style="{ transitionDelay: `${i * 0.05}s` }"
        @click="closeMenu"
      >
        {{ link.label }}
      </NuxtLink>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.app-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: $z-nav;
  padding: $space-lg $grid-gutter;
  transition: background $duration-med $ease-out-expo,
    backdrop-filter $duration-med $ease-out-expo;

  &--scrolled {
    @include glass;
    border-bottom: 1px solid $color-border;
  }

  &__inner {
    @include container;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__logo {
    font-size: $text-xl;
    z-index: 2;
  }

  &__desktop {
    display: none;
    align-items: center;
    gap: $space-xl;

    @media (min-width: 900px) {
      display: flex;
    }
  }

  &__link {
    position: relative;
    font-size: $text-sm;
    display: flex;
    align-items: center;
    gap: $space-xs;
    transition: color $duration-fast $ease-out-expo;

    &-arrow {
      font-size: 0.7em;
      opacity: 0;
      transform: rotate(0deg);
      transition: opacity $duration-fast $ease-out-expo,
        transform $duration-med $ease-out-expo;
    }

    &::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      width: 0;
      height: 1px;
      background: $color-accent;
      transition: width $duration-med $ease-out-expo;
    }

    &:hover {
      color: $color-accent;

      .app-nav__link-arrow {
        opacity: 1;
        transform: rotate(45deg);
      }

      &::after {
        width: 100%;
      }
    }

    &--active::after {
      width: 100%;
    }
  }

  &__lang {
    display: flex;
    gap: $space-sm;
    margin-left: $space-md;
  }

  &__lang-btn {
    color: $color-text-muted;
    transition: color $duration-fast $ease-out-expo;

    &:hover {
      color: $color-accent;
    }
  }

  &__toggle {
    display: flex;
    flex-direction: column;
    gap: 6px;
    z-index: 2;

    @media (min-width: 900px) {
      display: none;
    }

    span {
      display: block;
      width: 24px;
      height: 1px;
      background: $color-text;
      transition: transform $duration-med $ease-out-expo;
    }
  }

  &--open &__toggle span:first-child {
    transform: translateY(3.5px) rotate(45deg);
  }

  &--open &__toggle span:last-child {
    transform: translateY(-3.5px) rotate(-45deg);
  }

  &__mobile {
    position: fixed;
    inset: 0;
    background: $color-bg;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: $space-xl;
    opacity: 0;
    pointer-events: none;
    transition: opacity $duration-med $ease-out-expo;

    @media (min-width: 900px) {
      display: none;
    }

    &--open {
      opacity: 1;
      pointer-events: auto;
    }
  }

  &__mobile-link {
    font-size: $text-3xl;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity $duration-med $ease-out-expo,
      transform $duration-med $ease-out-expo;
  }

  &__mobile--open &__mobile-link {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

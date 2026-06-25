<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const switchLocalePath = useSwitchLocalePath()

const isScrolled = ref(false)
const menuOpen = ref(false)

const navItems = [
  { to: '/work', label: 'nav.work' },
  { to: '/about', label: 'nav.about' },
  { to: '/services', label: 'nav.services' },
  { to: '/contact', label: 'nav.contact' },
]

const otherLocale = computed(() => (locale.value === 'nl' ? 'en' : 'nl'))

function switchLocale() {
  navigateTo(switchLocalePath(otherLocale.value))
}

function isActive(path: string) {
  const localized = localePath(path)
  return route.path === localized || route.path.startsWith(`${localized}/`)
}

onMounted(() => {
  const onScroll = () => {
    isScrolled.value = window.scrollY > 60
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  onUnmounted(() => window.removeEventListener('scroll', onScroll))
})

watch(() => route.path, () => {
  menuOpen.value = false
  document.body.style.overflow = ''
})

watch(menuOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})
</script>

<template>
  <nav class="nav" :class="{ 'nav--scrolled': isScrolled, 'nav--open': menuOpen }">
    <div class="nav__inner container">
      <NuxtLink :to="localePath('/')" class="nav__logo link-fill" data-text="CPWD">
        <span>CPWD</span>
      </NuxtLink>

      <ul class="nav__links" role="list">
        <li v-for="item in navItems" :key="item.to">
          <NuxtLink
            :to="localePath(item.to)"
            class="nav-link"
            :class="{ active: isActive(item.to) }"
          >
            {{ t(item.label) }}
          </NuxtLink>
        </li>
      </ul>

      <div class="nav__right">
        <button
          class="nav__lang"
          :aria-label="`Switch to ${otherLocale}`"
          @click="switchLocale"
        >
          <span class="label">{{ otherLocale.toUpperCase() }}</span>
        </button>

        <button
          class="nav__hamburger"
          :class="{ 'is-open': menuOpen }"
          :aria-label="menuOpen ? 'Sluit menu' : 'Open menu'"
          :aria-expanded="menuOpen"
          @click="menuOpen = !menuOpen"
        >
          <span class="hamburger-line" />
          <span class="hamburger-line" />
        </button>
      </div>
    </div>

    <Transition name="menu">
      <div v-if="menuOpen" class="nav__menu">
        <ul class="nav__menu-links" role="list">
          <li
            v-for="(item, index) in navItems"
            :key="item.to"
            :style="{ '--delay': `${index * 0.07}s` }"
          >
            <NuxtLink
              :to="localePath(item.to)"
              class="nav__menu-link"
              @click="menuOpen = false"
            >
              <span class="menu-link__number label">0{{ index + 1 }}</span>
              <span class="menu-link__text link-split">
                <span class="split-top">{{ t(item.label) }}</span>
                <span class="split-bottom">{{ t(item.label) }}</span>
              </span>
            </NuxtLink>
          </li>
        </ul>

        <div class="nav__menu-footer">
          <a href="mailto:info@cpwd.nl" class="link-slide">info@cpwd.nl</a>
        </div>
      </div>
    </Transition>
  </nav>
</template>

<style lang="scss" scoped>
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: $z-nav;
  padding: 24px 0;
  transition:
    padding $dur-med $ease-gold,
    background-color $dur-med $ease-gold,
    backdrop-filter $dur-med $ease-gold;

  &--scrolled {
    padding: 16px 0;
    background-color: rgba(8, 8, 8, 0.85);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid $color-border;
  }

  &__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $space-6;
  }

  &__logo {
    font-family: $font-display;
    font-size: 1.4rem;
    font-weight: 300;
    letter-spacing: $tracking-wide;
    color: $color-text;
    z-index: 1;
  }

  &__links {
    display: flex;
    align-items: center;
    gap: $space-8;
    list-style: none;

    @media (max-width: 768px) {
      display: none;
    }
  }

  &__right {
    display: flex;
    align-items: center;
    gap: $space-5;
  }

  &__lang {
    background: none;
    border: 1px solid $color-border;
    color: $color-text-muted;
    padding: 6px 12px;
    border-radius: $radius-full;
    transition:
      border-color $dur-fast $ease-gold,
      color $dur-fast $ease-gold;

    &:hover {
      border-color: $color-gold;
      color: $color-gold;
    }
  }

  &__hamburger {
    display: flex;
    flex-direction: column;
    gap: 6px;
    background: none;
    border: none;
    padding: 4px;
    width: 32px;

    @media (min-width: 769px) {
      display: none;
    }

    .hamburger-line {
      display: block;
      width: 100%;
      height: 1px;
      background: $color-text;
      transform-origin: center;
      transition:
        transform $dur-med $ease-out-expo,
        opacity $dur-fast $ease-gold,
        background-color $dur-fast $ease-gold;
    }

    &.is-open {
      .hamburger-line:first-child {
        transform: rotate(45deg) translateY(3.5px);
        background: $color-gold;
      }

      .hamburger-line:last-child {
        transform: rotate(-45deg) translateY(-3.5px);
        background: $color-gold;
      }
    }
  }

  &__menu {
    position: fixed;
    inset: 0;
    background: $color-bg;
    z-index: -1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: $space-24 clamp(20px, 4vw, 60px);
    border-top: 1px solid $color-border;
  }

  &__menu-links {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: $space-4;
  }

  &__menu-link {
    display: flex;
    align-items: center;
    gap: $space-5;
    font-family: $font-display;
    font-size: $text-3xl;
    font-weight: 300;
    color: $color-text-muted;
    padding: $space-4 0;
    border-bottom: 1px solid $color-border;
    transition: color $dur-fast $ease-gold;

    &:hover {
      color: $color-text;
    }

    .menu-link__number {
      color: $color-gold;
      font-family: $font-mono;
      font-size: $text-xs;
      margin-top: 4px;
    }
  }

  &__menu-footer {
    margin-top: auto;
    padding-top: $space-8;
  }
}

.menu-enter-active {
  transition: clip-path $dur-slow $ease-out-expo;
}

.menu-leave-active {
  transition: clip-path $dur-med $ease-in-expo;
}

.menu-enter-from,
.menu-leave-to {
  clip-path: inset(0 0 100% 0);
}

.menu-enter-to {
  clip-path: inset(0 0 0% 0);
}

.nav--open .nav__menu-links li {
  opacity: 1;
  transform: translateX(0);
}

.nav__menu-links li {
  opacity: 0;
  transform: translateX(-20px);
  transition:
    opacity $dur-med $ease-out-expo var(--delay),
    transform $dur-med $ease-out-expo var(--delay);
}
</style>

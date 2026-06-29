<script setup lang="ts">
const nav = useSectionTranslations('nav')
const { locale, switchLocale } = useLocaleSwitch()
const localePath = useLocalePath()
const route = useRoute()

const isScrolled = ref(false)
const menuOpen = ref(false)

const navItems = [
  { to: '/work', label: 'work' },
  { to: '/services', label: 'services' },
  { to: '/about', label: 'about' },
  { to: '/contact', label: 'contact' },
]

function isActive(path: string) {
  const localized = localePath(path)
  return route.path === localized || route.path.startsWith(`${localized}/`)
}

function closeMenu() {
  menuOpen.value = false
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
      <NuxtLink :to="localePath('/')" class="nav__logo" aria-label="CPWD" @click="closeMenu">
        <UiAppLogo :height="48" />
      </NuxtLink>

      <ul class="nav__links" role="list">
        <li v-for="item in navItems" :key="item.to">
          <NuxtLink
            :to="localePath(item.to)"
            class="nav-link"
            :class="{ active: isActive(item.to) }"
          >
            {{ nav.t(item.label) }}
          </NuxtLink>
        </li>
      </ul>

      <div class="nav__right">
        <div class="nav__lang" role="group" aria-label="Taal">
          <button
            type="button"
            class="nav__lang-btn"
            :class="{ 'nav__lang-btn--active': locale === 'nl' }"
            :aria-pressed="locale === 'nl'"
            data-cursor="hover"
            @click="switchLocale('nl')"
          >
            NL
          </button>
          <span class="nav__lang-divider" aria-hidden="true" />
          <button
            type="button"
            class="nav__lang-btn"
            :class="{ 'nav__lang-btn--active': locale === 'en' }"
            :aria-pressed="locale === 'en'"
            data-cursor="hover"
            @click="switchLocale('en')"
          >
            EN
          </button>
        </div>

        <button
          class="nav__hamburger"
          :class="{ 'is-open': menuOpen }"
          :aria-label="menuOpen ? 'Sluit menu' : 'Open menu'"
          :aria-expanded="menuOpen"
          @click="menuOpen = !menuOpen"
        >
          <span class="hamburger-line hamburger-line--top" />
          <span class="hamburger-line hamburger-line--mid" />
          <span class="hamburger-line hamburger-line--bot" />
        </button>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="menu">
        <div v-if="menuOpen" class="nav__overlay" role="dialog" aria-modal="true">
          <div class="nav__menu">
            <ul class="nav__menu-links" role="list">
              <li
                v-for="(item, index) in navItems"
                :key="item.to"
                :style="{ '--delay': `${index * 0.08 + 0.12}s` }"
              >
                <NuxtLink
                  :to="localePath(item.to)"
                  class="nav__menu-link"
                  :class="{ 'nav__menu-link--active': isActive(item.to) }"
                  @click="closeMenu"
                >
                  <span class="menu-link__number label">0{{ index + 1 }}</span>
                  <span class="menu-link__text">{{ nav.t(item.label) }}</span>
                </NuxtLink>
              </li>
            </ul>

            <div class="nav__menu-footer">
              <a href="mailto:info@cpwd.nl" class="nav__menu-email link-slide">info@cpwd.nl</a>
              <div class="nav__menu-lang" role="group" aria-label="Taal">
                <button
                  type="button"
                  class="nav__menu-lang-btn"
                  :class="{ 'nav__menu-lang-btn--active': locale === 'nl' }"
                  :aria-pressed="locale === 'nl'"
                  @click="switchLocale('nl')"
                >
                  NL
                </button>
                <span class="nav__menu-lang-divider" aria-hidden="true" />
                <button
                  type="button"
                  class="nav__menu-lang-btn"
                  :class="{ 'nav__menu-lang-btn--active': locale === 'en' }"
                  :aria-pressed="locale === 'en'"
                  @click="switchLocale('en')"
                >
                  EN
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </nav>
</template>

<style lang="scss" scoped>
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: $z-nav + 1;
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

  &--open {
    background-color: transparent;
    backdrop-filter: none;
    border-bottom-color: transparent;
  }

  &__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $space-6;
  }

  &__logo {
    display: flex;
    align-items: center;
    opacity: 0.95;
    transition: opacity $dur-fast $ease-gold;

    &:hover {
      opacity: 1;
    }
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
    display: flex;
    align-items: center;
    gap: 0;
    font-family: $font-mono;
    font-size: $text-xs;
    letter-spacing: $tracking-wider;

    @media (max-width: 768px) {
      display: none;
    }
  }

  &__lang-btn {
    padding: 6px 8px;
    background: none;
    border: none;
    color: $color-text-faint;
    cursor: none;
    transition: color $dur-fast $ease-gold;

    &--active {
      color: $color-gold;
    }

    &:not(&--active):hover {
      color: $color-text-muted;
    }
  }

  &__lang-divider {
    width: 1px;
    height: 12px;
    background: $color-border;
  }

  &__hamburger {
    position: relative;
    display: block;
    background: none;
    border: none;
    padding: 0;
    width: 26px;
    height: 18px;
    cursor: none;

    @media (min-width: 769px) {
      display: none;
    }

    .hamburger-line {
      position: absolute;
      left: 0;
      width: 100%;
      height: 1px;
      background: $color-text;
      transform-origin: center;
      transition:
        transform $dur-med $ease-out-expo,
        opacity $dur-fast $ease-gold,
        top $dur-med $ease-out-expo,
        background-color $dur-fast $ease-gold;

      &--top {
        top: 0;
      }

      &--mid {
        top: 50%;
        transform: translateY(-50%);
      }

      &--bot {
        bottom: 0;
      }
    }

    &.is-open {
      .hamburger-line--top {
        top: 50%;
        transform: translateY(-50%) rotate(45deg);
        background: $color-gold;
      }

      .hamburger-line--mid {
        opacity: 0;
        transform: translateY(-50%) scaleX(0);
      }

      .hamburger-line--bot {
        top: 50%;
        bottom: auto;
        transform: translateY(-50%) rotate(-45deg);
        background: $color-gold;
      }
    }
  }
}

.nav__overlay {
  position: fixed;
  inset: 0;
  z-index: $z-nav;
  background:
    radial-gradient(ellipse 80% 60% at 50% 0%, rgba(56, 150, 90, 0.08) 0%, transparent 55%),
    $color-bg;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.nav__menu {
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  min-height: 100dvh;
  padding:
    calc(96px + env(safe-area-inset-top, 0px))
    clamp(24px, 6vw, 48px)
    calc(32px + env(safe-area-inset-bottom, 0px));
}

.nav__menu-links {
  list-style: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  gap: clamp(8px, 2vh, 20px);
  margin: 0;
  padding: 0;

  li {
    animation: nav-menu-link-in $dur-med $ease-out-expo both;
    animation-delay: var(--delay);
  }
}

.nav__menu-link {
  display: flex;
  align-items: center;
  gap: clamp(16px, 4vw, 28px);
  font-family: $font-display;
  font-size: clamp(2.5rem, 10vw, 4rem);
  font-weight: 600;
  line-height: 1;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: $color-text-muted;
  padding: clamp(12px, 2.5vh, 20px) 0;
  border-bottom: 1px solid rgba(56, 150, 90, 0.12);
  transition: color $dur-fast $ease-gold;

  &:hover,
  &--active {
    color: $color-text;
  }

  &--active .menu-link__number {
    color: $color-gold-light;
  }

  .menu-link__number {
    color: $color-gold;
    font-family: $font-mono;
    font-size: $text-xs;
    letter-spacing: $tracking-wider;
    margin-top: 0.35em;
  }

  .menu-link__text {
    display: block;
  }
}

.nav__menu-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space-6;
  padding-top: $space-8;
  border-top: 1px solid $color-border;
}

.nav__menu-email {
  font-family: $font-mono;
  font-size: $text-sm;
  letter-spacing: $tracking-wide;
  color: $color-text-muted;
}

.nav__menu-lang {
  display: flex;
  align-items: center;
  font-family: $font-mono;
  font-size: $text-xs;
  letter-spacing: $tracking-wider;
}

.nav__menu-lang-btn {
  padding: 8px 10px;
  background: none;
  border: none;
  color: $color-text-faint;
  cursor: none;
  transition: color $dur-fast $ease-gold;

  &--active {
    color: $color-gold;
  }
}

.nav__menu-lang-divider {
  width: 1px;
  height: 14px;
  background: $color-border;
}

.menu-enter-active,
.menu-leave-active {
  transition: opacity $dur-slow $ease-out-expo;
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
}

@keyframes nav-menu-link-in {
  from {
    opacity: 0;
    transform: translateY(24px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

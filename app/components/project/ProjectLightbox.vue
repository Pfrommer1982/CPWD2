<script setup lang="ts">
const props = defineProps<{
  images: { src: string; alt: string; url: string }[]
  initialIndex?: number
}>()

const emit = defineEmits<{ close: [] }>()

const current = ref(props.initialIndex ?? 0)
const lightboxRef = ref<HTMLElement>()
const isTransitioning = ref(false)

function goTo(index: number) {
  if (isTransitioning.value || index === current.value) return
  isTransitioning.value = true
  current.value = index
}

function prev() {
  goTo((current.value - 1 + props.images.length) % props.images.length)
}

function next() {
  goTo((current.value + 1) % props.images.length)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
  if (e.key === 'ArrowLeft') prev()
  if (e.key === 'ArrowRight') next()
}

function onSlideClick(e: MouseEvent) {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const x = e.clientX - rect.left
  const ratio = x / rect.width

  if (ratio < 0.35) prev()
  else if (ratio > 0.65) next()
}

onMounted(() => {
  document.body.style.overflow = 'hidden'
  document.body.dataset.lightboxOpen = 'true'
  window.addEventListener('keydown', onKeydown)
  lightboxRef.value?.focus()
})

onUnmounted(() => {
  document.body.style.overflow = ''
  delete document.body.dataset.lightboxOpen
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div
      ref="lightboxRef"
      class="lightbox"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      aria-label="Afbeelding viewer"
    >
      <div class="lightbox__backdrop" @click="emit('close')" />

      <header class="lightbox__header">
        <span class="lightbox__counter label">
          {{ String(current + 1).padStart(2, '0') }}
          <span class="lightbox__counter-sep">/</span>
          {{ String(images.length).padStart(2, '0') }}
        </span>

        <button
          type="button"
          class="lightbox__close"
          aria-label="Sluiten"
          data-cursor="hover"
          @click="emit('close')"
        >
          <span class="lightbox__close-line" />
          <span class="lightbox__close-line" />
        </button>
      </header>

      <div
        class="lightbox__stage"
        data-cursor="hover"
        @click="onSlideClick"
      >
        <Transition
          name="lightbox-fade"
          mode="out-in"
          @after-leave="isTransitioning = false"
          @after-enter="isTransitioning = false"
        >
          <figure :key="current" class="lightbox__figure">
            <img
              :src="images[current].url"
              :alt="images[current].alt"
              class="lightbox__img"
              draggable="false"
            >
            <figcaption class="lightbox__caption">
              {{ images[current].alt }}
            </figcaption>
          </figure>
        </Transition>

        <button
          v-if="images.length > 1"
          type="button"
          class="lightbox__zone lightbox__zone--prev"
          aria-label="Vorige afbeelding"
          data-cursor="hover"
          @click.stop="prev"
        >
          <span class="lightbox__zone-label label">Prev</span>
        </button>

        <button
          v-if="images.length > 1"
          type="button"
          class="lightbox__zone lightbox__zone--next"
          aria-label="Volgende afbeelding"
          data-cursor="hover"
          @click.stop="next"
        >
          <span class="lightbox__zone-label label">Next</span>
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.lightbox {
  position: fixed;
  inset: 0;
  z-index: $z-lightbox;
  display: flex;
  flex-direction: column;
  pointer-events: none;

  &__backdrop {
    position: absolute;
    inset: 0;
    background: rgba(4, 4, 4, 0.96);
    backdrop-filter: blur(16px);
    pointer-events: auto;
  }

  &__header {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: clamp(20px, 4vw, 36px) clamp(20px, 4vw, 48px);
    pointer-events: none;
  }

  &__counter {
    color: $color-gold;
    pointer-events: auto;

    &-sep {
      color: $color-text-faint;
      margin-inline: 0.35em;
    }
  }

  &__close {
    position: relative;
    width: 32px;
    height: 32px;
    background: none;
    border: none;
    pointer-events: auto;
    cursor: none;

    &-line {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 22px;
      height: 1px;
      background: $color-text-muted;
      transform-origin: center;
      transition: background-color $dur-fast $ease-gold;

      &:first-child {
        transform: translate(-50%, -50%) rotate(45deg);
      }

      &:last-child {
        transform: translate(-50%, -50%) rotate(-45deg);
      }
    }

    &:hover .lightbox__close-line {
      background: $color-gold;
    }
  }

  &__stage {
    position: relative;
    z-index: 1;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 clamp(12px, 3vw, 32px) clamp(24px, 5vw, 48px);
    pointer-events: auto;
    cursor: none;
  }

  &__figure {
    margin: 0;
    max-width: min(1200px, 94vw);
    max-height: calc(100vh - 120px);
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__img {
    display: block;
    max-width: 100%;
    max-height: calc(100vh - 160px);
    width: auto;
    height: auto;
    object-fit: contain;
    border: 1px solid $color-border;
    background: $color-bg-alt;
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5);
  }

  &__caption {
    margin-top: $space-4;
    font-family: $font-mono;
    font-size: $text-xs;
    letter-spacing: $tracking-wide;
    color: $color-text-faint;
    text-align: center;
  }

  &__zone {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 22%;
    background: none;
    border: none;
    cursor: none;
    opacity: 0;
    transition: opacity $dur-fast $ease-gold;

    &--prev {
      left: 0;
    }

    &--next {
      right: 0;
    }

    &-label {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      color: $color-gold;
      opacity: 0;
      transition: opacity $dur-fast $ease-gold;
    }

    &--prev .lightbox__zone-label {
      left: clamp(8px, 2vw, 24px);
    }

    &--next .lightbox__zone-label {
      right: clamp(8px, 2vw, 24px);
    }
  }

  &__stage:hover &__zone {
    opacity: 1;
  }

  &__zone:hover .lightbox__zone-label {
    opacity: 1;
  }
}

.lightbox-fade-enter-active,
.lightbox-fade-leave-active {
  transition: opacity 0.4s $ease-gold;
}

.lightbox-fade-enter-from,
.lightbox-fade-leave-to {
  opacity: 0;
}
</style>

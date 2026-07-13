<script setup lang="ts">
const props = withDefaults(defineProps<{
  size?: number
}>(), {
  size: 1,
})

const logoStyle = computed(() => ({
  '--scale': String(props.size),
}))
</script>

<template>
  <div class="main-logo" :style="logoStyle">
    <div class="logo">
      <div class="square1">
        <div class="letter C">
          C
        </div>
      </div>
      <div class="square2">
        <div class="letter P">
          P
        </div>
      </div>
      <div class="square3">
        <div class="letter W">
          W
        </div>
      </div>
      <div class="square4">
        <div class="letter D">
          D
        </div>
      </div>
      <svg class="logo-cross" viewBox="0 0 250 250" aria-hidden="true">
        <line class="logo-cross__line" x1="0" y1="125" x2="250" y2="125" stroke-width="4" />
        <line class="logo-cross__line" x1="125" y1="0" x2="125" y2="250" stroke-width="4" />
      </svg>
      <div class="dot-wrap">
        <span class="dot-ring dot-ring--1" aria-hidden="true" />
        <span class="dot-ring dot-ring--2" aria-hidden="true" />
        <span class="dot" />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@font-face {
  font-family: 'Layn';
  src: url('/assets/Layn.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
</style>

<style lang="scss" scoped>
.main-logo {
  --logo-text: #f1f1f1;
  --logo-line: #f1f1f1;

  display: flex;
  justify-content: center;
  align-items: center;
  text-transform: none;
  font-optical-sizing: auto;
}

.logo {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  width: calc(250px * var(--scale));
  height: calc(250px * var(--scale));
  overflow: hidden;
}

.square1 {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: calc(4px * var(--scale));
  position: relative;
  animation: slide-left 0.1s ease-in-out forwards;
}

.square2 {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: calc(4px * var(--scale));
  position: relative;
  animation: slide-down 0.1s ease-in-out forwards 0.1s;
}

.square3 {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: calc(4px * var(--scale));
  position: relative;
  animation: slide-up 0.1s ease-in-out forwards 0.3s;
}

.square4 {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: calc(4px * var(--scale));
  position: relative;
  animation: slide-right 0.1s ease-in-out forwards 0.2s;
}

.letter {
  position: absolute;
  font-family: 'Layn', sans-serif;
  font-size: calc(4rem * var(--scale));
  font-weight: normal;
  color: var(--logo-text);
  line-height: 1;
  text-transform: none;
}

.C {
  top: calc(40px * var(--scale));
  left: calc(20px * var(--scale));
}

.P {
  top: calc(40px * var(--scale));
  right: calc(10px * var(--scale));
}

.W {
  bottom: calc(26px * var(--scale));
  left: calc(22px * var(--scale));
}

.D {
  bottom: calc(26px * var(--scale));
  right: calc(10px * var(--scale));
}

.logo-cross {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
}

.logo-cross__line {
  stroke: var(--logo-line);
  shape-rendering: geometricPrecision;
}

.dot-wrap {
  position: absolute;
  top: 50%;
  left: 50%;
  width: calc(20px * var(--scale));
  height: calc(20px * var(--scale));
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 3;
}

.dot-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: calc(1.5px * var(--scale)) solid rgba($color-gold, 0.75);
  animation: dot-ring-pulse 3.2s cubic-bezier(0.22, 1, 0.36, 1) infinite;

  &--2 {
    animation-delay: 1.6s;
  }
}

.dot {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: $color-gold;
  box-shadow:
    0 0 calc(10px * var(--scale)) rgba($color-gold, 0.65),
    0 0 calc(22px * var(--scale)) rgba($color-gold, 0.35),
    0 0 calc(36px * var(--scale)) rgba($color-gold, 0.15);
}

@keyframes dot-ring-pulse {
  0% {
    transform: scale(1);
    opacity: 0.75;
  }

  15% {
    opacity: 0.55;
  }

  100% {
    transform: scale(9.6);
    opacity: 0;
  }
}

@keyframes slide-left {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }

  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slide-right {
  0% {
    transform: translateX(100%);
    opacity: 0;
  }

  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slide-down {
  0% {
    transform: translateY(-100%);
    opacity: 0;
  }

  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slide-up {
  0% {
    transform: translateY(100%);
    opacity: 0;
  }

  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .square1,
  .square2,
  .square3,
  .square4 {
    animation: none;
    opacity: 1;
    transform: none;
  }

  .dot-ring {
    animation: none;
    opacity: 0.35;
    transform: scale(1.6);
  }
}

:global(html.graphics-tier-static),
:global(html.graphics-tier-reduced) {
  .square1,
  .square2,
  .square3,
  .square4 {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }

  .dot-ring {
    animation: none !important;
    opacity: 0.35;
    transform: scale(1.6);
  }
}
</style>

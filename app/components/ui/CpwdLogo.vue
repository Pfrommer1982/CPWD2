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
      <div class="line horizontal" />
      <div class="line vertical" />
      <div class="dot" />
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

.line {
  position: absolute;
  background-color: var(--logo-line);
}

.horizontal {
  width: 100%;
  height: calc(4px * var(--scale));
  top: 50%;
  left: 0;
  transform: translateY(-50%);
}

.vertical {
  width: calc(4px * var(--scale));
  height: 100%;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}

.dot {
  position: absolute;
  top: 50%;
  left: 50%;
  width: calc(20px * var(--scale));
  height: calc(20px * var(--scale));
  border-radius: 50%;
  background: $color-gold;
  transform: translate(-50%, -50%);
  pointer-events: none;
  box-shadow:
    0 0 calc(10px * var(--scale)) rgba($color-gold, 0.65),
    0 0 calc(22px * var(--scale)) rgba($color-gold, 0.35),
    0 0 calc(36px * var(--scale)) rgba($color-gold, 0.15);
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
}
</style>

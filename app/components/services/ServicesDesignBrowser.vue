<script setup lang="ts">
const props = withDefaults(defineProps<{
  active?: boolean
  mobile?: boolean
}>(), {
  active: true,
  mobile: false,
})

const sceneRef = ref<HTMLElement | null>(null)
const activeRef = toRef(props, 'active')
const staticMode = toRef(props, 'mobile')

const {
  browserRef,
  guidesRef,
  measureRef,
  pieceNav,
  pieceHero,
  pieceSide,
  pieceCardA,
  pieceCardB,
  pieceDot,
  slotNav,
  slotHero,
  slotSide,
  slotCardA,
  slotCardB,
  slotDot,
} = useDesignBrowserScene({ root: sceneRef, active: activeRef, staticMode })
</script>

<template>
  <div
    ref="sceneRef"
    class="design-browser"
    :class="{
      'design-browser--stacked': mobile,
      'design-browser--static': mobile,
    }"
    aria-hidden="true"
  >
    <div ref="browserRef" class="design-browser__frame">
      <div class="design-browser__chrome">
        <span class="design-browser__dot design-browser__dot--red" />
        <span class="design-browser__dot design-browser__dot--gold" />
        <span class="design-browser__dot design-browser__dot--muted" />
        <span class="design-browser__url font-mono">layout.cpwd</span>
      </div>

      <div class="design-browser__viewport">
        <div ref="slotNav" class="design-browser__slot design-browser__slot--nav" />
        <div ref="slotHero" class="design-browser__slot design-browser__slot--hero" />
        <div ref="slotSide" class="design-browser__slot design-browser__slot--side" />
        <div ref="slotCardA" class="design-browser__slot design-browser__slot--card-a" />
        <div ref="slotCardB" class="design-browser__slot design-browser__slot--card-b" />
        <div ref="slotDot" class="design-browser__slot design-browser__slot--dot" />

        <svg
          ref="guidesRef"
          class="design-browser__guides"
          viewBox="0 0 320 220"
          preserveAspectRatio="none"
        >
          <line data-guide x1="24" y1="198" x2="296" y2="198" />
          <line data-guide x1="18" y1="52" x2="18" y2="198" />
          <line data-guide x1="24" y1="52" x2="120" y2="52" />
        </svg>

        <div ref="measureRef" class="design-browser__measures font-mono">
          <span data-measure class="design-browser__measure design-browser__measure--w">847</span>
          <span data-measure class="design-browser__measure design-browser__measure--h">24</span>
          <span data-measure class="design-browser__measure design-browser__measure--nav">96</span>
        </div>
      </div>
    </div>

    <div ref="pieceNav" class="design-browser__piece design-browser__piece--nav" />
    <div ref="pieceHero" class="design-browser__piece design-browser__piece--hero">
      <span class="design-browser__piece-shimmer" />
    </div>
    <div ref="pieceSide" class="design-browser__piece design-browser__piece--side" />
    <div ref="pieceCardA" class="design-browser__piece design-browser__piece--card" />
    <div ref="pieceCardB" class="design-browser__piece design-browser__piece--card design-browser__piece--card-alt" />
    <div ref="pieceDot" class="design-browser__piece design-browser__piece--dot" />
  </div>
</template>

<style lang="scss" scoped>
.design-browser {
  --assemble: 0;
  position: absolute;
  inset: 0;
  pointer-events: none;

  &__frame {
    position: absolute;
    top: 50%;
    left: 50%;
    width: clamp(240px, 28vw, 380px);
    transform: translate(-50%, -50%);
    border: 1px solid rgba(69, 232, 138, calc(0.18 + var(--assemble) * 0.22));
    border-radius: 14px;
    background:
      linear-gradient(180deg, rgba(22, 22, 22, 0.96) 0%, rgba(12, 12, 12, 0.98) 100%);
    box-shadow:
      0 0 0 1px rgba(69, 232, 138, 0.04) inset,
      0 24px 80px rgba(0, 0, 0, 0.45),
      0 0 calc(24px + var(--assemble) * 32px) rgba(69, 232, 138, calc(0.06 + var(--assemble) * 0.1));
    overflow: hidden;
    transition: border-color 0.4s ease, box-shadow 0.4s ease;
  }

  &__chrome {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 12px;
    border-bottom: 1px solid rgba(69, 232, 138, 0.1);
    background: rgba(15, 15, 15, 0.85);
  }

  &__dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;

    &--red {
      background: rgba(196, 75, 58, 0.75);
    }

    &--gold {
      background: rgba(69, 232, 138, 0.85);
    }

    &--muted {
      background: rgba(100, 118, 110, 0.45);
    }
  }

  &__url {
    margin-left: auto;
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid rgba(69, 232, 138, 0.12);
    font-size: 9px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(100, 118, 110, 0.9);
  }

  &__viewport {
    position: relative;
    aspect-ratio: 320 / 220;
    background:
      radial-gradient(circle at 50% 0%, rgba(69, 232, 138, 0.05) 0%, transparent 55%),
      linear-gradient(rgba(69, 232, 138, 0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(69, 232, 138, 0.04) 1px, transparent 1px);
    background-size: auto, 16px 16px, 16px 16px;
  }

  &__slot {
    position: absolute;
    opacity: 0;
    pointer-events: none;

    &--nav {
      top: 14%;
      left: 7.5%;
      width: 86%;
      height: 11%;
    }

    &--hero {
      top: 30%;
      left: 7.5%;
      width: 56%;
      height: 28%;
    }

    &--side {
      top: 30%;
      right: 7.5%;
      width: 22%;
      height: 28%;
    }

    &--card-a {
      bottom: 12%;
      left: 7.5%;
      width: 38%;
      height: 18%;
    }

    &--card-b {
      bottom: 12%;
      right: 7.5%;
      width: 38%;
      height: 18%;
    }

    &--dot {
      top: 34%;
      left: 11%;
      width: 8%;
      aspect-ratio: 1;
    }
  }

  &__guides {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;

    line {
      stroke: rgba(122, 245, 176, 0.55);
      stroke-width: 1;
      stroke-dasharray: 48;
      vector-effect: non-scaling-stroke;
    }
  }

  &__measures {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  &__measure {
    position: absolute;
    font-size: 8px;
    letter-spacing: 0.08em;
    color: rgba(122, 245, 176, 0.75);
    padding: 2px 4px;
    border-radius: 3px;
    background: rgba(8, 8, 8, 0.72);

    &--w {
      left: 50%;
      bottom: 4%;
      transform: translateX(-50%);
    }

    &--h {
      left: 2%;
      top: 52%;
      transform: translateY(-50%) rotate(-90deg);
    }

    &--nav {
      left: 34%;
      top: 18%;
    }
  }

  &__piece {
    position: absolute;
    left: 0;
    top: 0;
    opacity: 0;
    will-change: transform, opacity;
    border-radius: 3px;
    border: 1px solid rgba(69, 232, 138, calc(0.22 + var(--assemble) * 0.18));
    background: rgba(10, 16, 13, 0.94);
    box-shadow:
      0 0 calc(8px + var(--assemble) * 12px) rgba(69, 232, 138, calc(0.04 + var(--assemble) * 0.08)),
      0 0 0 1px rgba(69, 232, 138, calc(0.06 + var(--assemble) * 0.1)) inset;

    &--nav {
      width: clamp(120px, 14vw, 180px);
      height: clamp(14px, 1.6vw, 20px);
      border-radius: 999px;
      background: linear-gradient(90deg, rgba(69, 232, 138, 0.22), rgba(22, 22, 22, 0.95) 65%);
    }

    &--hero {
      width: clamp(88px, 10vw, 130px);
      height: clamp(52px, 6vw, 72px);
      overflow: hidden;
      background: linear-gradient(135deg, rgba(69, 232, 138, 0.16), rgba(15, 15, 15, 0.98));
    }

    &--side {
      width: clamp(34px, 4vw, 48px);
      height: clamp(52px, 6vw, 72px);
    }

    &--card {
      width: clamp(56px, 6.5vw, 78px);
      height: clamp(28px, 3.2vw, 38px);
    }

    &--card-alt {
      border-color: rgba(122, 245, 176, 0.35);
      background: linear-gradient(180deg, rgba(69, 232, 138, 0.08), rgba(15, 15, 15, 0.98));
    }

    &--dot {
      width: clamp(16px, 2vw, 22px);
      height: clamp(16px, 2vw, 22px);
      border-radius: 50%;
      background: radial-gradient(circle, rgba(122, 245, 176, 0.85) 0%, rgba(69, 232, 138, 0.45) 100%);
      border-color: rgba(122, 245, 176, 0.5);
    }
  }

  &__piece-shimmer {
    position: absolute;
    inset: 0;
    opacity: 0;
    background: linear-gradient(
      105deg,
      transparent 35%,
      rgba(122, 245, 176, 0.16) 50%,
      transparent 65%
    );
    animation: design-shimmer 3.2s ease-in-out infinite;
  }
}

@keyframes design-shimmer {
  0%, 100% { transform: translateX(-120%); }
  50% { transform: translateX(120%); }
}

@media (prefers-reduced-motion: reduce) {
  .design-browser__piece-shimmer {
    animation: none;
  }
}
</style>

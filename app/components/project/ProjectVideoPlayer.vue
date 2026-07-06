<script setup lang="ts">
const props = defineProps<{
  src: string
  poster?: string
  caption?: string
  accentColor?: string
}>()

const projectI18n = useSectionTranslations('project')
const imageKit = useImageKit()

const rootRef = ref<HTMLElement | null>(null)
const inlineVideo = ref<HTMLVideoElement | null>(null)
const expandedVideo = ref<HTMLVideoElement | null>(null)
const isExpanded = ref(false)
const isMuted = ref(true)
const isPlaying = ref(false)
const hasError = ref(false)
const isVisible = ref(false)

const videoUrl = computed(() => imageKit.video(props.src))
const posterUrl = computed(() =>
  props.poster ? imageKit.thumbnail(props.poster, 1920, 1080) : undefined,
)

const accent = computed(() => props.accentColor || '#38965A')

let scrollObserver: IntersectionObserver | null = null

function activeVideo() {
  return isExpanded.value ? expandedVideo.value : inlineVideo.value
}

async function playVideo(video = activeVideo()) {
  if (!video || hasError.value) return
  try {
    await video.play()
    isPlaying.value = true
  } catch {
    isPlaying.value = false
  }
}

function pauseVideo(video = activeVideo()) {
  video?.pause()
  isPlaying.value = false
}

function togglePlay() {
  const video = activeVideo()
  if (!video || hasError.value) return
  if (video.paused) playVideo(video)
  else pauseVideo(video)
}

function toggleMute() {
  isMuted.value = !isMuted.value
  if (inlineVideo.value) inlineVideo.value.muted = isMuted.value
  if (expandedVideo.value) expandedVideo.value.muted = isMuted.value
}

function syncExpandedTime() {
  if (!inlineVideo.value || !expandedVideo.value) return
  expandedVideo.value.currentTime = inlineVideo.value.currentTime
}

function syncInlineTime() {
  if (!inlineVideo.value || !expandedVideo.value) return
  inlineVideo.value.currentTime = expandedVideo.value.currentTime
}

async function openExpanded() {
  syncExpandedTime()
  isExpanded.value = true
  document.body.style.overflow = 'hidden'
  document.body.dataset.videoExpanded = 'true'
  await nextTick()
  if (expandedVideo.value) {
    expandedVideo.value.muted = isMuted.value
    await playVideo(expandedVideo.value)
  }
  inlineVideo.value?.pause()
}

function closeExpanded() {
  syncInlineTime()
  expandedVideo.value?.pause()
  isExpanded.value = false
  document.body.style.overflow = ''
  delete document.body.dataset.videoExpanded
  if (isVisible.value) playVideo(inlineVideo.value ?? undefined)
}

function onKeydown(event: KeyboardEvent) {
  if (!isExpanded.value) return
  if (event.key === 'Escape') closeExpanded()
}

function onInlineTimeUpdate() {
  if (!inlineVideo.value || isExpanded.value) return
  isPlaying.value = !inlineVideo.value.paused
}

function onVideoError() {
  hasError.value = true
  isPlaying.value = false
}

function onCanPlayInline() {
  hasError.value = false
  if (isVisible.value && !isExpanded.value) playVideo(inlineVideo.value ?? undefined)
}

watch(videoUrl, async () => {
  hasError.value = false
  await nextTick()
  inlineVideo.value?.load()
  if (isVisible.value) playVideo(inlineVideo.value ?? undefined)
})

onMounted(() => {
  if (!import.meta.client || !rootRef.value) return

  window.addEventListener('keydown', onKeydown)

  scrollObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        isVisible.value = entry.isIntersecting
        if (entry.isIntersecting && !isExpanded.value) playVideo(inlineVideo.value ?? undefined)
        else if (!isExpanded.value) pauseVideo(inlineVideo.value ?? undefined)
      })
    },
    { threshold: 0.2, rootMargin: '0px 0px -8% 0px' },
  )

  scrollObserver.observe(rootRef.value)
})

onUnmounted(() => {
  scrollObserver?.disconnect()
  window.removeEventListener('keydown', onKeydown)
  if (isExpanded.value) {
    document.body.style.overflow = ''
    delete document.body.dataset.videoExpanded
  }
})
</script>

<template>
  <div
    ref="rootRef"
    class="project-video"
    :style="{ '--video-accent': accent }"
  >
    <div class="project-video__media">
      <video
        ref="inlineVideo"
        :key="videoUrl"
        :src="videoUrl"
        :poster="posterUrl"
        class="project-video__player"
        muted
        loop
        playsinline
        webkit-playsinline
        preload="metadata"
        @timeupdate="onInlineTimeUpdate"
        @canplay="onCanPlayInline"
        @error="onVideoError"
        @click="togglePlay"
      />

      <p v-if="hasError" class="project-video__error font-mono">
        {{ projectI18n.t('video.error') }}
      </p>
    </div>

    <div class="project-video__controls">
      <button
        type="button"
        class="project-video__control"
        :disabled="hasError"
        :aria-label="isPlaying ? projectI18n.t('video.pause') : projectI18n.t('video.play')"
        @click.stop="togglePlay"
      >
        <svg v-if="isPlaying" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
          <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
        </svg>
        <svg v-else viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 5.5v13l11-6.5L8 5.5z" fill="currentColor" />
        </svg>
      </button>

      <button
        type="button"
        class="project-video__control"
        :disabled="hasError"
        :aria-label="isMuted ? projectI18n.t('video.unmute') : projectI18n.t('video.mute')"
        @click.stop="toggleMute"
      >
        <svg v-if="isMuted" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
          <path d="M16 9l4 6M20 9l-4 6" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
        </svg>
        <svg v-else viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
          <path d="M16 8.5a4.5 4.5 0 010 7" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" fill="none" />
          <path d="M18 6a7.5 7.5 0 010 12" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" fill="none" />
        </svg>
      </button>

      <button
        type="button"
        class="project-video__control project-video__control--expand"
        :disabled="hasError"
        :aria-label="projectI18n.t('video.expand')"
        @click.stop="openExpanded"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 3H5a2 2 0 00-2 2v4M15 3h4a2 2 0 012 2v4M9 21H5a2 2 0 01-2-2v-4M15 21h4a2 2 0 002-2v-4" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" fill="none" />
        </svg>
      </button>
    </div>

    <p v-if="caption" class="project-video__caption font-mono">
      {{ caption }}
    </p>

    <Teleport to="body">
      <Transition name="video-expand">
        <div
          v-if="isExpanded"
          class="project-video-modal"
          role="dialog"
          aria-modal="true"
          :aria-label="caption || projectI18n.t('video.label')"
          :style="{ '--video-accent': accent }"
        >
          <button
            type="button"
            class="project-video-modal__backdrop"
            aria-label="Close"
            @click="closeExpanded"
          />

          <div class="project-video-modal__panel">
            <button
              type="button"
              class="project-video-modal__close font-mono"
              @click="closeExpanded"
            >
              {{ projectI18n.t('video.close') }} ×
            </button>

            <video
              ref="expandedVideo"
              :key="`expanded-${videoUrl}`"
              :src="videoUrl"
              :poster="posterUrl"
              class="project-video-modal__player"
              :muted="isMuted"
              loop
              playsinline
              webkit-playsinline
              controls
              @error="onVideoError"
              @click.stop
            />
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style lang="scss" scoped>
.project-video {
  width: 100%;

  &__media {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    background: #000;
    overflow: hidden;
  }

  &__player {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
    background: #000;
    cursor: pointer;
  }

  &__error {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    padding: $space-4;
    text-align: center;
    font-size: $text-xs;
    letter-spacing: $tracking-wide;
    color: $color-text-muted;
    background: rgba($color-bg, 0.88);
  }

  &__controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp($space-2, 3vw, $space-3);
    margin-top: clamp($space-3, 3vw, $space-4);
    padding: 0;
  }

  &__control {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 44px;
    height: 44px;
    padding: 0;
    border: 1px solid rgba($color-gold, 0.22);
    background: rgba($color-bg, 0.72);
    color: $color-text;
    transition:
      border-color $dur-fast ease,
      color $dur-fast ease,
      background $dur-fast ease,
      opacity $dur-fast ease;

    svg {
      width: 18px;
      height: 18px;
    }

    &:hover:not(:disabled) {
      border-color: var(--video-accent, $color-gold);
      color: var(--video-accent, $color-gold-light);
    }

    &:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    &--expand {
      margin-left: 0;
    }
  }

  &__caption {
    margin-top: $space-4;
    text-align: center;
    font-size: $text-xs;
    letter-spacing: $tracking-wide;
    color: $color-text-faint;
    padding-inline: $space-2;
  }

  @media (min-width: 640px) {
    &__controls {
      justify-content: flex-start;
    }

    &__control {
      width: 40px;
      height: 40px;

      &--expand {
        margin-left: auto;
      }
    }
  }
}

.project-video-modal {
  position: fixed;
  inset: 0;
  z-index: $z-lightbox;
  display: grid;
  place-items: center;
  padding: clamp(12px, 3vw, 32px);

  &__backdrop {
    position: absolute;
    inset: 0;
    border: 0;
    background: rgba($color-bg, 0.88);
    backdrop-filter: blur(10px);
    cursor: pointer;
  }

  &__panel {
    position: relative;
    z-index: 1;
    width: min(98vw, 1280px);
    max-height: 92vh;
    display: flex;
    flex-direction: column;
    gap: $space-3;
  }

  &__close {
    align-self: flex-end;
    padding: 6px 10px;
    border: 1px solid rgba($color-gold, 0.22);
    background: rgba($color-bg-alt, 0.96);
    color: $color-text;
    font-size: 0.68rem;
    letter-spacing: $tracking-wider;
    text-transform: uppercase;
    transition: border-color $dur-fast ease, color $dur-fast ease;

    &:hover {
      border-color: var(--video-accent, $color-gold);
      color: var(--video-accent, $color-gold-light);
    }
  }

  &__player {
    width: 100%;
    max-height: min(82vh, 820px);
    aspect-ratio: 16 / 9;
    object-fit: contain;
    display: block;
    background: #000;
    border: 1px solid rgba($color-gold, 0.12);
  }
}

.video-expand-enter-active,
.video-expand-leave-active {
  transition: opacity 0.28s ease;
}

.video-expand-enter-from,
.video-expand-leave-to {
  opacity: 0;
}
</style>

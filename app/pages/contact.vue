<script setup lang="ts">
const { t } = useI18n()

definePageMeta({ layout: 'default' })

const form = reactive({
  name: '',
  email: '',
  message: '',
})

const status = ref<'idle' | 'loading' | 'success' | 'error'>('idle')

async function submitForm() {
  status.value = 'loading'
  try {
    await $fetch('/api/contact', {
      method: 'POST',
      body: form,
    })
    status.value = 'success'
    form.name = ''
    form.email = ''
    form.message = ''
  } catch {
    status.value = 'error'
  }
}
</script>

<template>
  <div class="page-contact">
    <section class="page-contact__hero">
      <span class="font-mono page-contact__label">{{ t('contact.label') }}</span>
      <h1 class="page-contact__heading font-display">
        {{ t('contact.heading') }}
      </h1>
      <p class="page-contact__subtext">
        {{ t('contact.subtext') }}
      </p>
    </section>

    <form class="page-contact__form" @submit.prevent="submitForm">
      <div class="page-contact__field">
        <label for="name">Name</label>
        <input id="name" v-model="form.name" type="text" required>
      </div>
      <div class="page-contact__field">
        <label for="email">Email</label>
        <input id="email" v-model="form.email" type="email" required>
      </div>
      <div class="page-contact__field">
        <label for="message">Message</label>
        <textarea id="message" v-model="form.message" rows="6" required />
      </div>
      <GsapMagneticButton type="submit">
        {{ status === 'loading' ? '...' : t('contact.cta') }}
      </GsapMagneticButton>
      <p v-if="status === 'success'" class="page-contact__status page-contact__status--success">
        Message sent!
      </p>
      <p v-if="status === 'error'" class="page-contact__status page-contact__status--error">
        Something went wrong. Please try again.
      </p>
    </form>
  </div>
</template>

<style lang="scss" scoped>
.page-contact {
  padding-top: 120px;
  padding-bottom: $space-4xl;

  &__hero {
    @include container;
    padding-block: $space-3xl;
    max-width: 800px;
  }

  &__label {
    color: $color-accent;
    display: block;
    margin-bottom: $space-md;
  }

  &__heading {
    font-size: $text-4xl;
    margin-bottom: $space-lg;
  }

  &__subtext {
    color: $color-text-muted;
    font-size: $text-lg;
  }

  &__form {
    @include container;
    max-width: 600px;
    display: flex;
    flex-direction: column;
    gap: $space-lg;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: $space-sm;

    label {
      font-family: $font-mono;
      font-size: $text-xs;
      color: $color-text-muted;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    input,
    textarea {
      background: $color-surface;
      border: 1px solid $color-border;
      border-radius: $border-radius-sm;
      padding: $space-md;
      color: $color-text;
      font-family: $font-body;
      transition: border-color $duration-fast $ease-out-expo;

      &:focus {
        outline: none;
        border-color: $color-accent;
      }
    }
  }

  &__status {
    font-size: $text-sm;

    &--success {
      color: $color-accent;
    }

    &--error {
      color: $color-accent-alt;
    }
  }
}
</style>

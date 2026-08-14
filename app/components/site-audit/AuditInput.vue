<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  disabled?: boolean
  error?: string | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  submit: []
}>()

const copy = useSectionTranslations('websiteScanner')

function onSubmit() {
  if (props.disabled) return
  emit('submit')
}
</script>

<template>
  <form class="audit-input" @submit.prevent="onSubmit">
    <label class="audit-input__label font-mono" for="audit-url">
      {{ copy.t('input.label') }}
    </label>
    <div class="audit-input__row">
      <input
        id="audit-url"
        class="audit-input__field"
        type="text"
        name="url"
        inputmode="url"
        autocomplete="url"
        spellcheck="false"
        :placeholder="copy.t('input.placeholder')"
        :value="modelValue"
        :disabled="disabled"
        :aria-invalid="!!error"
        :aria-describedby="error ? 'audit-url-error' : undefined"
        data-cursor="text"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      >
      <button
        type="submit"
        class="btn-primary audit-input__submit"
        :disabled="disabled"
        data-cursor="hover"
      >
        {{ copy.t('input.submit') }}
      </button>
    </div>
    <p
      v-if="error"
      id="audit-url-error"
      class="audit-input__error font-mono"
      role="alert"
    >
      {{ error }}
    </p>
  </form>
</template>

<style scoped lang="scss">
.audit-input {
  display: grid;
  gap: $space-3;
  width: 100%;
  max-width: 42rem;
}

.audit-input__label {
  font-size: $text-xs;
  letter-spacing: $tracking-widest;
  text-transform: uppercase;
  color: $color-text-faint;
}

.audit-input__row {
  display: flex;
  flex-wrap: wrap;
  gap: $space-3;
  align-items: stretch;
}

.audit-input__field {
  flex: 1 1 16rem;
  min-width: 0;
  padding: 0.95rem 1.1rem;
  border: 1px solid $color-border;
  border-radius: $radius-md;
  background: $color-surface;
  color: $color-text;
  font-family: $font-mono;
  font-size: $text-sm;
  transition: border-color $dur-fast $ease-gold, box-shadow $dur-fast $ease-gold;

  &::placeholder {
    color: $color-text-faint;
  }

  &:hover:not(:disabled) {
    border-color: $color-border-hover;
  }

  &:focus-visible {
    outline: none;
    border-color: $color-gold;
    box-shadow: 0 0 0 3px $color-gold-muted;
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  &[aria-invalid='true'] {
    border-color: $color-error;
  }
}

.audit-input__submit {
  flex: 0 0 auto;
  white-space: nowrap;
}

.audit-input__error {
  margin: 0;
  font-size: $text-xs;
  color: $color-error;
  letter-spacing: $tracking-wide;
}
</style>

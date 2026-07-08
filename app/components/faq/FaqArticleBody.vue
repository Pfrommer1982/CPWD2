<script setup lang="ts">
import type { KnowledgeBlock } from '~/data/knowledge'

const props = defineProps<{ blocks: KnowledgeBlock[] }>()

const { locale } = useI18n()
const { parseHighlightedBody } = useSplitText()

const lang = computed(() => (locale.value === 'en' ? 'en' : 'nl'))

function render(text: string): string {
  return parseHighlightedBody(text)
}
</script>

<template>
  <div class="article-body">
    <template v-for="(block, index) in props.blocks" :key="index">
      <h2
        v-if="block.type === 'heading'"
        class="article-body__heading font-display"
      >
        {{ block.content[lang] }}
      </h2>

      <ul
        v-else-if="block.type === 'list'"
        class="article-body__list"
      >
        <li
          v-for="(item, i) in block.content[lang]"
          :key="i"
          class="article-body__list-item"
          v-html="render(item)"
        />
      </ul>

      <p
        v-else
        class="article-body__paragraph"
        v-html="render(block.content[lang])"
      />
    </template>
  </div>
</template>

<style lang="scss" scoped>
.article-body {
  display: flex;
  flex-direction: column;
  gap: $space-5;
}

.article-body__heading {
  margin-top: $space-4;
  font-size: $text-xl;
  font-weight: 500;
  letter-spacing: $tracking-tight;
  color: $color-text;
}

.article-body__paragraph {
  font-size: $text-base;
  line-height: $leading-relaxed;
  color: $color-text-muted;
}

.article-body__list {
  display: flex;
  flex-direction: column;
  gap: $space-3;
  margin: 0;
  padding: 0;
  list-style: none;
}

.article-body__list-item {
  position: relative;
  padding-left: $space-5;
  font-size: $text-base;
  line-height: $leading-normal;
  color: $color-text-muted;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.6em;
    width: 6px;
    height: 6px;
    background: $color-comms;
    transform: rotate(45deg);
  }
}

:deep(.highlight-word) {
  color: $color-text;
  font-weight: 500;
}
</style>

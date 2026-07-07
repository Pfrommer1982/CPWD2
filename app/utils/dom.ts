import type { ComponentPublicInstance } from 'vue'

export type TemplateRefValue = Element | ComponentPublicInstance | null

export function resolveElementRef(el: TemplateRefValue): HTMLElement | null {
  if (!el) return null
  if (el instanceof HTMLElement) return el
  if (el instanceof Element) return el as HTMLElement

  const root = (el as ComponentPublicInstance).$el
  return root instanceof HTMLElement ? root : null
}

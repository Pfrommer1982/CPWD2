import type { RouterConfig } from '@nuxt/schema'
import { forceScrollToTop } from '~/utils/scrollReset'

export default {
  scrollBehavior(to) {
    if (import.meta.client) {
      if (to.hash) {
        return { el: to.hash, behavior: 'auto' }
      }
      forceScrollToTop()
    }

    return { top: 0, left: 0 }
  },
} satisfies RouterConfig

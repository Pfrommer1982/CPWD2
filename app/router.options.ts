import type { RouterConfig } from '@nuxt/schema'
import { forceScrollToTop } from '~/utils/scrollReset'

export default {
  scrollBehavior(to, from) {
    if (import.meta.client) {
      if (to.hash) {
        return { el: to.hash, behavior: 'auto' }
      }

      // Query-only updates (e.g. estimator config sync) must not jump the page.
      if (from && to.path === from.path) {
        return false
      }

      forceScrollToTop()
    }

    return { top: 0, left: 0 }
  },
} satisfies RouterConfig

export default defineNuxtPlugin(() => {
  const router = useRouter()
  let lastPath = ''
  let timer: ReturnType<typeof setTimeout> | undefined

  router.afterEach((to) => {
    const path = to.path
    if (path.startsWith('/stats') || path === lastPath) return
    lastPath = path
    clearTimeout(timer)
    timer = setTimeout(() => {
      const body = JSON.stringify({ path })
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/stats/hit', new Blob([body], { type: 'application/json' }))
        return
      }
      void fetch('/api/stats/hit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body,
        keepalive: true,
      })
    }, 250)
  })
})

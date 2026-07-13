export function forceScrollToTop() {
  if (!import.meta.client) return

  const html = document.documentElement
  const body = document.body
  const previousHtmlBehavior = html.style.scrollBehavior
  const previousBodyBehavior = body.style.scrollBehavior

  html.style.scrollBehavior = 'auto'
  body.style.scrollBehavior = 'auto'

  window.scrollTo(0, 0)
  document.documentElement.scrollTop = 0
  body.scrollTop = 0

  html.style.scrollBehavior = previousHtmlBehavior
  body.style.scrollBehavior = previousBodyBehavior
}

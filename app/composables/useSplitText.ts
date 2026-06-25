export function useSplitText() {
  function splitIntoWords(el: HTMLElement | null): HTMLElement[] {
    if (!el) return []

    const text = el.textContent || ''
    el.innerHTML = ''

    const words = text.split(/\s+/).filter(Boolean)
    const spans: HTMLElement[] = []

    words.forEach((word, i) => {
      const wrapper = document.createElement('span')
      wrapper.className = 'word-wrapper'
      wrapper.style.display = 'inline-block'
      wrapper.style.overflow = 'hidden'
      wrapper.style.verticalAlign = 'top'

      const span = document.createElement('span')
      span.className = 'word'
      span.textContent = word
      wrapper.appendChild(span)
      el.appendChild(wrapper)

      if (i < words.length - 1) {
        el.appendChild(document.createTextNode(' '))
      }

      spans.push(span)
    })

    return spans
  }

  function splitIntoChars(el: HTMLElement | null): HTMLElement[] {
    if (!el) return []

    const text = el.textContent || ''
    el.innerHTML = ''

    const chars: HTMLElement[] = []

    for (const char of text) {
      if (char === ' ') {
        el.appendChild(document.createTextNode(' '))
        continue
      }

      const wrapper = document.createElement('span')
      wrapper.className = 'char-wrapper'
      wrapper.style.display = 'inline-block'
      wrapper.style.overflow = 'hidden'

      const span = document.createElement('span')
      span.className = 'char'
      span.textContent = char
      wrapper.appendChild(span)
      el.appendChild(wrapper)
      chars.push(span)
    }

    return chars
  }

  function parseHighlightedBody(text: string): string {
    return text.replace(/\*([^*]+)\*/g, '<span class="highlight-word">$1</span>')
  }

  return {
    splitIntoWords,
    splitIntoChars,
    parseHighlightedBody,
  }
}

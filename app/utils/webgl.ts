export function detectWebGL(): boolean {
  if (!import.meta.client) return false

  try {
    const canvas = document.createElement('canvas')
    const gl = (canvas.getContext('webgl2')
      ?? canvas.getContext('webgl')
      ?? canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null

    if (!gl) return false

    // Software renderers often struggle with the heavier Three.js scenes.
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string
      if (/swiftshader|llvmpipe|software/i.test(renderer)) return false
    }

    return true
  }
  catch {
    return false
  }
}

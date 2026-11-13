/**
 * Shared plumbing for the canvas backgrounds (letter field, registry
 * dots, dashboard contours): theme colours resolved to rgb, the page
 * content each field steers around, and one render loop that sleeps
 * off-screen and in hidden tabs, caps its frame rate, and drops to
 * every other frame on a device that can't keep up.
 */

export type Palette = {
  noise: string
  word: string
  primary: string
  free: string
  taken: string
  dark: boolean
}

export type Rect = { left: number; right: number; top: number; bottom: number }

/** Resolves any CSS color (oklch included) to rgb() via a 1px canvas. */
function toRgb(probe: CanvasRenderingContext2D, color: string): string {
  probe.clearRect(0, 0, 1, 1)
  probe.fillStyle = "#000"
  probe.fillStyle = color
  probe.fillRect(0, 0, 1, 1)
  const [r, g, b] = probe.getImageData(0, 0, 1, 1).data
  return `rgb(${r} ${g} ${b})`
}

export function readPalette(): Palette {
  const styles = getComputedStyle(document.documentElement)
  const probeCanvas = document.createElement("canvas")
  probeCanvas.width = probeCanvas.height = 1
  const probe = probeCanvas.getContext("2d", { willReadFrequently: true })!
  const token = (name: string) =>
    toRgb(probe, styles.getPropertyValue(name).trim())
  const dark = document.documentElement.classList.contains("dark")
  return {
    noise: token("--muted-foreground"),
    word: token("--foreground"),
    primary: dark ? toRgb(probe, "oklch(0.7 0.17 292)") : token("--primary"),
    free: dark ? "rgb(34 197 94)" : "rgb(21 128 61)",
    taken: dark ? "rgb(239 68 68)" : "rgb(185 28 28)",
    dark,
  }
}

/** The boxes of the host's own content (data-field-avoid), host-local. */
export function avoidRects(host: HTMLElement, padX = 8, padY = 6): Rect[] {
  const origin = host.getBoundingClientRect()
  return Array.from(host.querySelectorAll("[data-field-avoid]"), (el) => {
    const r = el.getBoundingClientRect()
    return {
      left: r.left - origin.left - padX,
      right: r.right - origin.left + padX,
      top: r.top - origin.top - padY,
      bottom: r.bottom - origin.top + padY,
    }
  })
}

export function inside(rects: Rect[], x: number, y: number): boolean {
  return rects.some(
    (r) => x > r.left && x < r.right && y > r.top && y < r.bottom
  )
}

/** Sizes a canvas to its CSS box at a capped pixel ratio. */
export function fitCanvas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  maxDpr: number
): void {
  const dpr = Math.min(window.devicePixelRatio || 1, maxDpr)
  canvas.width = Math.round(width * dpr)
  canvas.height = Math.round(height * dpr)
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

/** Horizontal screen position, -1 (left) to 1 (right), for panning. */
export function panOf(canvas: HTMLCanvasElement, x: number): number {
  const left = canvas.getBoundingClientRect().left
  const width = window.innerWidth || 1
  return Math.max(-1, Math.min(1, ((left + x) / width) * 2 - 1))
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

/**
 * Runs a field. `build` lays it out for the current size, `draw` paints
 * one frame. Returns the teardown. With `animate` false (reduced
 * motion) it only ever paints still frames: on mount, resize, theme
 * change, and when the caller asks via the returned `paint`.
 */
export function runField(opts: {
  host: Element
  build: () => void
  draw: (now: number) => void
  onTheme?: () => void
  animate: boolean
  /** Upper bound on frames per second; the screen rate if unset. */
  fps?: number
}): { stop: () => void; paint: () => void } {
  const { host, build, draw, onTheme, animate } = opts
  const minGap = opts.fps ? 1000 / opts.fps - 2 : 0
  let frame = 0
  let running = false
  let onScreen = true
  let lastFrame = 0
  let lastDraw = 0
  let slowFrames = 0
  let lite = false
  let skipNext = false

  const paint = () => draw(performance.now())

  function loop(now: number) {
    if (!running) return
    frame = requestAnimationFrame(loop)
    if (now - lastDraw < minGap) return
    // A device that can't keep up (long frames, again and again)
    // drops to every other frame for good rather than stuttering.
    const delta = now - lastFrame
    lastFrame = now
    if (!lite && delta < 100) {
      const budget = Math.max(24, minGap * 1.5)
      slowFrames = delta > budget ? slowFrames + 1 : Math.max(0, slowFrames - 1)
      if (slowFrames > 45) lite = true
    }
    skipNext = lite && !skipNext
    if (skipNext) return
    lastDraw = now
    draw(now)
  }

  function start() {
    if (running || !animate || !onScreen || document.hidden) return
    running = true
    lastFrame = performance.now()
    frame = requestAnimationFrame(loop)
  }

  function halt() {
    running = false
    cancelAnimationFrame(frame)
  }

  build()
  paint()
  void document.fonts?.ready.then(() => {
    build()
    paint()
  })

  const resize = new ResizeObserver(() => {
    build()
    paint()
  })
  resize.observe(host)

  const visibility = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting
    if (onScreen) start()
    else halt()
  })
  visibility.observe(host)

  const theme = new MutationObserver(() => {
    onTheme?.()
    paint()
  })
  theme.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  })

  const onVisibility = () => (document.hidden ? halt() : start())
  document.addEventListener("visibilitychange", onVisibility)
  start()

  return {
    paint,
    stop: () => {
      halt()
      resize.disconnect()
      visibility.disconnect()
      theme.disconnect()
      document.removeEventListener("visibilitychange", onVisibility)
    },
  }
}

/** True when a pointer event started on something the page handles. */
export function isControl(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    Boolean(
      target.closest(
        "a, button, input, textarea, select, label, form, [role='tab']"
      )
    )
  )
}

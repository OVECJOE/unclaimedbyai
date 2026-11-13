"use client"

import { useEffect, useRef } from "react"
import { prefersReducedMotion, readPalette, runField } from "@/components/fields/kit"

/**
 * The dashboard's background: faint contour lines, like a topographic
 * map of slowly shifting ground, drawn behind every dashboard page. It
 * is meant to be felt more than seen. The lines drift over minutes,
 * rise into a gentle hill under the cursor, and swell for a moment
 * when you click.
 *
 * Marching squares over two layers of value noise moving in different
 * directions, redrawn at most 30 times a second, at one canvas pixel
 * per CSS pixel. It sleeps in hidden tabs and holds still for reduced
 * motion.
 */

const LEVELS = 9
const LOW = 0.2
const HIGH = 0.8

function hash(x: number, y: number): number {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

function smooth(t: number): number {
  return t * t * (3 - 2 * t)
}

function valueNoise(x: number, y: number): number {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const tx = smooth(x - xi)
  const ty = smooth(y - yi)
  const a = hash(xi, yi)
  const b = hash(xi + 1, yi)
  const c = hash(xi, yi + 1)
  const d = hash(xi + 1, yi + 1)
  return a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty
}

export default function AmbientContours() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const reduced = prefersReducedMotion()
    let palette = readPalette()
    let width = 0
    let height = 0
    let step = 22
    let cols = 0
    let rows = 0
    let values = new Float32Array(0)
    const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999, amp: 0 }
    let pointerOn = false
    let pulse = 0
    let lastNow = performance.now()
    // A random starting place, so the ground differs per visit.
    const origin = { x: Math.random() * 500, y: Math.random() * 500 }

    function build() {
      width = window.innerWidth
      height = window.innerHeight
      step = width < 640 ? 26 : 22
      canvas!.width = width
      canvas!.height = height
      canvas!.style.width = `${width}px`
      canvas!.style.height = `${height}px`
      cols = Math.ceil(width / step) + 1
      rows = Math.ceil(height / step) + 1
      values = new Float32Array(cols * rows)
    }

    function sample(now: number) {
      const t = reduced ? 0 : now * 0.000035
      const sigma = width < 640 ? 120 : 170
      const twoSigma2 = 2 * sigma * sigma
      const amp = pointer.amp * (0.22 + pulse * 0.18)
      for (let r = 0; r < rows; r++) {
        const y = r * step
        for (let c = 0; c < cols; c++) {
          const x = c * step
          let v =
            0.65 *
              valueNoise(
                origin.x + x * 0.0042 + t * 0.9,
                origin.y + y * 0.0042 + t * 0.35
              ) +
            0.35 *
              valueNoise(
                origin.y + x * 0.0105 - t * 0.6,
                origin.x + y * 0.0105 + t * 0.8
              )
          if (amp > 0.001) {
            const dx = x - pointer.x
            const dy = y - pointer.y
            v += amp * Math.exp(-(dx * dx + dy * dy) / twoSigma2)
          }
          values[r * cols + c] = v
        }
      }
    }

    /** Marching squares for one level, appended to the current path. */
    function trace(level: number) {
      for (let r = 0; r < rows - 1; r++) {
        for (let c = 0; c < cols - 1; c++) {
          const i = r * cols + c
          const a = values[i]
          const b = values[i + 1]
          const d = values[i + cols]
          const e = values[i + cols + 1]
          const code =
            (a > level ? 8 : 0) |
            (b > level ? 4 : 0) |
            (e > level ? 2 : 0) |
            (d > level ? 1 : 0)
          if (code === 0 || code === 15) continue
          const x = c * step
          const y = r * step
          // Edge crossings: top, right, bottom, left.
          const top = () => [x + ((level - a) / (b - a)) * step, y]
          const right = () => [x + step, y + ((level - b) / (e - b)) * step]
          const bottom = () => [x + ((level - d) / (e - d)) * step, y + step]
          const left = () => [x, y + ((level - a) / (d - a)) * step]
          const seg = (p: number[], q: number[]) => {
            ctx!.moveTo(p[0], p[1])
            ctx!.lineTo(q[0], q[1])
          }
          switch (code) {
            case 1:
            case 14:
              seg(left(), bottom())
              break
            case 2:
            case 13:
              seg(bottom(), right())
              break
            case 3:
            case 12:
              seg(left(), right())
              break
            case 4:
            case 11:
              seg(top(), right())
              break
            case 6:
            case 9:
              seg(top(), bottom())
              break
            case 7:
            case 8:
              seg(left(), top())
              break
            case 5:
              seg(left(), top())
              seg(bottom(), right())
              break
            case 10:
              seg(left(), bottom())
              seg(top(), right())
              break
          }
        }
      }
    }

    function draw(now: number) {
      const delta = Math.min(100, now - lastNow)
      lastNow = now
      pointer.x += (pointer.tx - pointer.x) * Math.min(1, delta * 0.004)
      pointer.y += (pointer.ty - pointer.y) * Math.min(1, delta * 0.004)
      pointer.amp += ((pointerOn ? 1 : 0) - pointer.amp) * Math.min(1, delta * 0.002)
      pulse *= Math.pow(0.5, delta / 450)

      sample(now)
      ctx!.clearRect(0, 0, width, height)
      ctx!.strokeStyle = palette.primary
      ctx!.lineWidth = 1
      const base = palette.dark ? 0.075 : 0.06
      for (let i = 0; i < LEVELS; i++) {
        const level = LOW + ((HIGH - LOW) * i) / (LEVELS - 1)
        // Every fourth line is an index contour, a touch stronger,
        // the way printed maps do it.
        ctx!.globalAlpha = i % 4 === 0 ? base * 1.8 : base
        ctx!.beginPath()
        trace(level)
        ctx!.stroke()
      }
      ctx!.globalAlpha = 1
    }

    const field = runField({
      host: canvas,
      build,
      draw,
      animate: !reduced,
      fps: 30,
      onTheme: () => {
        palette = readPalette()
      },
    })

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return
      if (!pointerOn) {
        pointer.x = event.clientX
        pointer.y = event.clientY
      }
      pointer.tx = event.clientX
      pointer.ty = event.clientY
      pointerOn = true
    }
    const onPointerOut = (event: PointerEvent) => {
      if (!event.relatedTarget) pointerOn = false
    }
    const onPointerDown = () => {
      pulse = 1
    }
    const onResize = () => {
      build()
      field.paint()
    }

    if (!reduced) {
      window.addEventListener("pointermove", onPointerMove, { passive: true })
      document.addEventListener("pointerout", onPointerOut)
      window.addEventListener("pointerdown", onPointerDown, { passive: true })
    }
    window.addEventListener("resize", onResize)

    return () => {
      field.stop()
      window.removeEventListener("pointermove", onPointerMove)
      document.removeEventListener("pointerout", onPointerOut)
      window.removeEventListener("pointerdown", onPointerDown)
      window.removeEventListener("resize", onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
    />
  )
}

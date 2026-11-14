"use client"

import { useEffect, useRef, type MutableRefObject } from "react"
import {
  fitCanvas,
  prefersReducedMotion,
  readPalette,
  runField,
} from "@/components/fields/kit"

/**
 * The film behind the three chapters. One canvas, one slow camera, three
 * scenes that dissolve into each other as you scroll:
 *
 *  1. A field of small squares, one per possible name. The names this
 *     check tried sit in a row near the top and light up violet when
 *     free, or hollow out when taken.
 *  2. The field pulls away and the social platforms form a ring. Open
 *     ones glow, taken ones go dark.
 *  3. Faint lines of text drift past like subtitles; the real chatbot
 *     answer comes into focus.
 *
 * It paints with plain 2D rectangles and text: no images, no video, no
 * blur filters. It sleeps when off screen, drops frames on a slow
 * device, and takes its position from the scroll through `film.p`.
 */

export type Film = { p: number }

type Props = {
  film: MutableRefObject<Film>
  domains: ("free" | "taken" | "unknown")[]
  handles: ("free" | "taken" | "unknown")[]
  lines: string[]
}

const clamp = (n: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n))
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}

type Dot = {
  x: number
  y: number
  phase: number
  size: number
  speed: number
  z: number
}

export default function StoryBackdrop({
  film,
  domains,
  handles,
  lines,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const host = canvas?.parentElement
    if (!canvas || !host) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const reduced = prefersReducedMotion()
    let palette = readPalette()
    let width = 0
    let height = 0
    let dots: Dot[] = []
    let rowX: number[] = []
    let scatter: { x: number; y: number }[] = []
    let starts: { x: number; y: number }[] = []
    let nodes: { x: number; y: number }[] = []
    let drift = 0
    let shown = reduced ? 0.12 : 0
    let scroller: { y: number; speed: number; size: number; text: string }[] =
      []

    function build() {
      const rect = host!.getBoundingClientRect()
      width = rect.width
      height = rect.height
      if (!width || !height) return
      const small = width < 640
      fitCanvas(canvas!, ctx!, width, height, small ? 1.25 : 1.5)

      // A grid of faint squares, thinned so it never passes ~380.
      let gap = small ? 34 : 40
      while ((width / gap) * (height / gap) > 380) gap += 4
      const cols = Math.ceil(width / gap) + 1
      const rows = Math.ceil(height / gap) + 1
      dots = []
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          dots.push({
            x: c * gap,
            y: r * gap,
            phase: Math.random() * Math.PI * 2,
            size: 1.5 + Math.random() * 2,
            speed: 0.4 + Math.random() * 0.8,
            z: 0.5 + Math.random() * 1.1,
          })
        }
      }

      // Scene one: the names that were tried, in a row near the top.
      const a = domains.length
      rowX = domains.map(
        (_, i) => width * (0.12 + (0.76 * (i + 0.5)) / Math.max(a, 1))
      )
      scatter = domains.map(() => ({
        x: width * (Math.random() * 1.2 - 0.1),
        y: height * (Math.random() * 1.2 - 0.1),
      }))

      // Scene two: the platforms, from a random spot in the field to a ring.
      const k = handles.length
      starts = handles.map(() => {
        const d = dots[Math.floor(Math.random() * dots.length)]
        return { x: d.x, y: d.y }
      })
      nodes = handles.map((_, i) => {
        const angle = -Math.PI / 2 + (i * Math.PI * 2) / Math.max(k, 1)
        return {
          x: width / 2 + Math.cos(angle) * width * 0.34,
          y: height / 2 + Math.sin(angle) * height * 0.36,
        }
      })

      // Scene three: lines drifting across at different depths.
      const pool = lines.length ? lines : ["no known association"]
      scroller = Array.from({ length: small ? 10 : 16 }, (_, i) => ({
        y: height * ((i + 0.5) / (small ? 10 : 16)),
        speed: 8 + (i % 4) * 7,
        size: 12 + (i % 3) * 4,
        text: pool[i % pool.length],
      }))
    }

    function draw(now: number) {
      const target = film.current.p
      shown += (target - shown) * (reduced ? 1 : 0.1)
      const p = shown
      drift = now / 1000

      const e1 = smooth(0.26, 0.4, p)
      const e2 = smooth(0.6, 0.72, p)
      const dpr = canvas!.width / Math.max(width, 1)

      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx!.clearRect(0, 0, width, height)

      // The camera: a slow push in with a little sideways drift.
      const zoom = 1 + 0.38 * p
      const pan = -(p - 0.5) * 60
      ctx!.setTransform(
        dpr * zoom,
        0,
        0,
        dpr * zoom,
        dpr * ((width / 2) * (1 - zoom) + pan),
        dpr * ((height / 2) * (1 - zoom))
      )

      const quiet = palette.dark ? 0.2 : 0.26

      // A slow violet light that moves from scene to scene.
      const lx = width * (0.5 + 0.18 * Math.sin(drift * 0.15) + 0.2 * e2)
      const ly = height * (0.2 + 0.3 * e1 + 0.05 * Math.cos(drift * 0.2))
      const radius = Math.max(width, height) * 0.55
      const glow = ctx!.createRadialGradient(lx, ly, 0, lx, ly, radius)
      glow.addColorStop(
        0,
        palette.primary.replace("rgb(", "rgb(").replace(")", " / 0.16)")
      )
      glow.addColorStop(1, palette.primary.replace(")", " / 0)"))
      ctx!.globalAlpha = palette.dark ? 0.7 : 0.55
      ctx!.fillStyle = glow
      ctx!.fillRect(-width, -height, width * 3, height * 3)

      // The field of squares.
      ctx!.fillStyle = palette.noise
      for (const dot of dots) {
        const sway = Math.sin(drift * dot.speed + dot.phase)
        const spread = 1 + 0.3 * e1
        const x =
          width / 2 +
          (dot.x - width / 2) * spread +
          pan * (dot.z - 1) * 1.6 +
          sway * 1.5 * (1 + e2 * 6)
        const y =
          height / 2 +
          (dot.y - height / 2) * spread +
          Math.cos(drift * dot.speed * 0.8 + dot.phase) * 1.5 * (1 + e2 * 6)
        const alpha =
          (quiet + sway * 0.04) *
          (0.55 + 0.45 * dot.z) *
          (1 - 0.45 * e1) *
          (1 - e2)
        if (alpha <= 0.005) continue
        ctx!.globalAlpha = alpha
        const size = dot.size * dot.z
        ctx!.fillRect(x - size / 2, y - size / 2, size, size)
      }

      // Scene one: the names that were tried.
      domains.forEach((state, i) => {
        const lit = smooth(
          0.03 + (i / domains.length) * 0.17,
          0.09 + (i / domains.length) * 0.17,
          p
        )
        const ease = smooth(0.26 + i * 0.004, 0.4 + i * 0.004, p)
        const bob = Math.sin(drift * 0.9 + i) * 2
        const x = rowX[i] + (scatter[i].x - rowX[i]) * ease
        const y = height * 0.13 + (scatter[i].y - height * 0.13) * ease + bob
        const fade = 1 - e1
        if (fade <= 0.01) return
        const s = 11
        if (state === "free") {
          ctx!.fillStyle = palette.primary
          ctx!.globalAlpha = 0.16 * lit * fade
          ctx!.fillRect(x - s * 2.5, y - s * 2.5, s * 5, s * 5)
          ctx!.globalAlpha = (0.15 + 0.5 * lit) * fade
          ctx!.fillRect(x - s / 2, y - s / 2, s, s)
        } else {
          ctx!.strokeStyle = palette.noise
          ctx!.globalAlpha = (0.22 - 0.1 * lit) * fade
          ctx!.lineWidth = 1
          ctx!.strokeRect(x - s / 2, y - s / 2, s, s)
        }
      })

      // Scene two: the platforms gather into a ring.
      const ringAlpha = e1 * (1 - e2)
      if (ringAlpha > 0.01 && nodes.length > 1) {
        ctx!.strokeStyle = palette.primary
        ctx!.lineWidth = 1
        ctx!.globalAlpha = 0.16 * ringAlpha
        ctx!.beginPath()
        nodes.forEach((n, i) => {
          const ease = smooth(0.26 + i * 0.01, 0.46 + i * 0.01, p)
          const x = starts[i].x + (n.x - starts[i].x) * ease
          const y = starts[i].y + (n.y - starts[i].y) * ease
          if (i === 0) ctx!.moveTo(x, y)
          else ctx!.lineTo(x, y)
        })
        ctx!.closePath()
        ctx!.stroke()
      }
      handles.forEach((state, i) => {
        const ease = smooth(0.26 + i * 0.01, 0.46 + i * 0.01, p)
        const lit = smooth(0.4 + i * 0.03, 0.48 + i * 0.03, p)
        const orbit = Math.sin(drift * 0.6 + i * 1.7) * 3
        const x = starts[i].x + (nodes[i].x - starts[i].x) * ease + orbit
        const y =
          starts[i].y +
          (nodes[i].y - starts[i].y) * ease +
          Math.cos(drift * 0.5 + i) * 3
        const fade = 1 - e2
        if (fade <= 0.01) return
        const s = 12
        if (state === "free") {
          ctx!.fillStyle = palette.primary
          ctx!.globalAlpha = 0.18 * lit * fade
          ctx!.fillRect(x - s * 2.5, y - s * 2.5, s * 5, s * 5)
          ctx!.globalAlpha = (0.12 + 0.5 * lit) * fade
          ctx!.fillRect(x - s / 2, y - s / 2, s, s)
        } else {
          ctx!.strokeStyle = palette.noise
          ctx!.globalAlpha =
            (0.14 + 0.12 * (1 - lit)) * fade * Math.max(ease, 0.3)
          ctx!.strokeRect(x - s / 2, y - s / 2, s, s)
        }
      })

      // Scene three: subtitles drifting past.
      if (e2 > 0.01) {
        ctx!.fillStyle = palette.noise
        ctx!.textBaseline = "middle"
        scroller.forEach((line, i) => {
          ctx!.font = `${line.size}px ui-monospace, "Geist Mono", monospace`
          const span = width + 520
          const x = ((drift * line.speed + i * 173) % span) - 360
          const focus = i === Math.floor(scroller.length / 2) ? 1 : 0
          ctx!.globalAlpha = (focus ? 0.34 : 0.13) * e2
          ctx!.fillStyle = focus ? palette.primary : palette.noise
          ctx!.fillText(line.text, x, line.y)
        })
      }

      ctx!.globalAlpha = 1
    }

    const field = runField({
      host,
      build,
      draw,
      onTheme: () => {
        palette = readPalette()
      },
      animate: !reduced,
      fps: 40,
    })
    return () => field.stop()
  }, [film, domains, handles, lines])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black_55%,transparent_100%)]"
    />
  )
}

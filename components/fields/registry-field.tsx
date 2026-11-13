"use client"

import { useEffect, useRef } from "react"
import { playNote, playSound } from "@/lib/sound/engine"
import { cn } from "@/lib/utils"
import {
  avoidRects,
  fitCanvas,
  inside,
  isControl,
  panOf,
  prefersReducedMotion,
  readPalette,
  runField,
} from "./kit"

/**
 * A grid of small squares, one per name, filling up as names get
 * registered: mostly next to names already taken, the way real land
 * grabs cluster, with the odd one landing anywhere. It is the "land
 * grab" argument as a picture.
 *
 * The cursor pushes the squares aside and lights up the ones still
 * free around it; a click claims the nearest free one for you, in
 * violet, with a ring and a note. When the grid is nearly full it
 * clears back to where it started (your claims stay).
 */

type Dot = {
  x: number
  y: number
  dx: number
  dy: number
  state: 0 | 1 | 2 // free, taken, yours
  at: number
  covered: boolean
}

type Ring = { x: number; y: number; start: number }

const START_TAKEN = 0.32
const FULL = 0.9

export default function RegistryField({
  quiet = false,
  className,
}: {
  /** Slower, fainter: for inner pages. */
  quiet?: boolean
  className?: string
}) {
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
    let gap = 18
    let cols = 0
    let rows = 0
    let dots: Dot[] = []
    let taken = 0
    const rings: Ring[] = []
    const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999, on: false }
    let lastTick = 0
    let clearing = 0
    let fadeEdge: CanvasGradient | null = null

    function neighbours(index: number): number[] {
      const col = index % cols
      const out: number[] = []
      if (col > 0) out.push(index - 1)
      if (col < cols - 1) out.push(index + 1)
      if (index - cols >= 0) out.push(index - cols)
      if (index + cols < dots.length) out.push(index + cols)
      return out
    }

    /** One more name gets registered somewhere. */
    function register(now: number) {
      let index = -1
      if (Math.random() < 0.72 && taken > 0) {
        // Next to an existing one: grabs cluster.
        for (let attempt = 0; attempt < 12 && index === -1; attempt++) {
          const seed = Math.floor(Math.random() * dots.length)
          if (dots[seed].state !== 1) continue
          const free = neighbours(seed).filter((n) => dots[n].state === 0)
          if (free.length) index = free[Math.floor(Math.random() * free.length)]
        }
      }
      for (let attempt = 0; attempt < 20 && index === -1; attempt++) {
        const pick = Math.floor(Math.random() * dots.length)
        if (dots[pick].state === 0) index = pick
      }
      if (index === -1) return
      dots[index].state = 1
      dots[index].at = now
      taken += 1
    }

    function build() {
      const rect = host!.getBoundingClientRect()
      width = rect.width
      height = rect.height
      const small = width < 640
      gap = small ? 16 : 20
      fitCanvas(canvas!, ctx!, width, height, small ? 1.5 : 2)
      cols = Math.ceil(width / gap)
      rows = Math.ceil(height / gap)
      const offsetX = (width - (cols - 1) * gap) / 2
      const offsetY = (height - (rows - 1) * gap) / 2
      const rects = avoidRects(host!, 10, 10)
      dots = []
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = offsetX + c * gap
          const y = offsetY + r * gap
          dots.push({
            x,
            y,
            dx: 0,
            dy: 0,
            state: 0,
            at: Number.NEGATIVE_INFINITY,
            covered: inside(rects, x, y),
          })
        }
      }
      taken = 0
      const target = Math.floor(dots.length * START_TAKEN)
      while (taken < target) register(Number.NEGATIVE_INFINITY)

      fadeEdge = ctx!.createLinearGradient(0, height * 0.8, 0, height)
      fadeEdge.addColorStop(0, "rgb(0 0 0 / 0)")
      fadeEdge.addColorStop(1, "rgb(0 0 0 / 1)")
    }

    function draw(now: number) {
      ctx!.clearRect(0, 0, width, height)

      if (!reduced) {
        // Registrations speed up a little as the grid fills, like the
        // market does. Quiet fields fill at half the pace.
        const fullness = taken / (dots.length || 1)
        const every = (quiet ? 2 : 1) * (130 - fullness * 60)
        if (!clearing && now - lastTick > every) {
          lastTick = now
          register(now)
          if (fullness > FULL) clearing = now
        }
        if (clearing && now - clearing > 1400) {
          // Most names go back on the market; yours stay yours.
          clearing = 0
          for (const dot of dots) {
            if (dot.state === 1 && Math.random() > START_TAKEN) {
              dot.state = 0
              dot.at = now
              taken -= 1
            }
          }
        }
      }

      pointer.x += (pointer.tx - pointer.x) * 0.18
      pointer.y += (pointer.ty - pointer.y) * 0.18
      const radius = width < 640 ? 90 : 130
      const fadeOut = clearing ? Math.min(1, (now - clearing) / 1400) : 0
      // Taken squares are bigger and darker than free ones, so the
      // grid visibly fills up.
      const size = width < 640 ? 1.5 : 2
      const muted = palette.dark ? 0.16 : 0.13

      let currentColor = ""
      let currentAlpha = -1
      for (const dot of dots) {
        const ddx = dot.x - pointer.x
        const ddy = dot.y - pointer.y
        const dist = Math.hypot(ddx, ddy) || 1
        let heat = pointer.on ? Math.max(0, 1 - dist / radius) : 0
        heat *= heat
        const push = heat * 9
        dot.dx += ((ddx / dist) * push - dot.dx) * 0.2
        dot.dy += ((ddy / dist) * push - dot.dy) * 0.2

        const fresh = Math.max(0, 1 - (now - dot.at) / 900)
        let color: string
        let alpha: number
        let grow = 0
        if (dot.state === 2) {
          color = palette.primary
          alpha = 0.85
          grow = 1 + fresh * 2
        } else if (dot.state === 1) {
          color = fresh > 0 ? palette.taken : palette.word
          alpha = (palette.dark ? 0.3 : 0.24) + fresh * 0.5
          alpha *= 1 - fadeOut * 0.6
          grow = 1.5 + fresh * 2 - fadeOut * 1.5
        } else {
          // Free squares near the cursor light up: still available.
          color = heat > 0.08 ? palette.primary : palette.noise
          alpha = muted + heat * 0.7
          grow = heat * 1.5
        }
        if (dot.covered) alpha *= 0.3
        if (quiet) alpha *= 0.8
        alpha = Math.round(Math.min(1, alpha) * 20) / 20
        if (alpha !== currentAlpha) {
          ctx!.globalAlpha = alpha
          currentAlpha = alpha
        }
        if (color !== currentColor) {
          ctx!.fillStyle = color
          currentColor = color
        }
        const s = size + grow
        ctx!.fillRect(dot.x + dot.dx - s / 2, dot.y + dot.dy - s / 2, s, s)
      }

      // Rings spreading from claimed squares.
      ctx!.strokeStyle = palette.primary
      ctx!.lineWidth = 1
      for (let i = rings.length - 1; i >= 0; i--) {
        const t = (now - rings[i].start) / 900
        if (t >= 1) {
          rings.splice(i, 1)
          continue
        }
        const r = 4 + t * 46
        ctx!.globalAlpha = (1 - t) * 0.6
        ctx!.strokeRect(rings[i].x - r, rings[i].y - r, r * 2, r * 2)
      }

      ctx!.globalAlpha = 1
      if (fadeEdge) {
        ctx!.globalCompositeOperation = "destination-out"
        ctx!.fillStyle = fadeEdge
        ctx!.fillRect(0, height * 0.8, width, height * 0.2)
        ctx!.globalCompositeOperation = "source-over"
      }
    }

    const field = runField({
      host,
      build,
      draw,
      animate: !reduced,
      fps: 45,
      onTheme: () => {
        palette = readPalette()
      },
    })

    function local(clientX: number, clientY: number) {
      const rect = canvas!.getBoundingClientRect()
      return { x: clientX - rect.left, y: clientY - rect.top }
    }

    const onPointerMove = (event: PointerEvent) => {
      const p = local(event.clientX, event.clientY)
      if (!pointer.on) {
        pointer.x = p.x
        pointer.y = p.y
      }
      pointer.tx = p.x
      pointer.ty = p.y
      pointer.on = true
    }
    const onPointerLeave = () => {
      pointer.on = false
    }
    const onPointerDown = (event: PointerEvent) => {
      if (isControl(event.target)) return
      const p = local(event.clientX, event.clientY)
      let best: Dot | null = null
      let bestDistance = 80
      for (const dot of dots) {
        if (dot.state !== 0 || dot.covered) continue
        const d = Math.hypot(dot.x - p.x, dot.y - p.y)
        if (d < bestDistance) {
          best = dot
          bestDistance = d
        }
      }
      if (!best) {
        playNote({ step: 0, bright: false, pan: panOf(canvas!, p.x) })
        return
      }
      best.state = 2
      best.at = performance.now()
      rings.push({ x: best.x, y: best.y, start: best.at })
      playSound("spark", `square:${Math.round(best.x)}:${Math.round(best.y)}`, {
        pan: panOf(canvas!, best.x),
      })
      if (reduced) field.paint()
    }

    host.addEventListener("pointermove", onPointerMove)
    host.addEventListener("pointerleave", onPointerLeave)
    host.addEventListener("pointerdown", onPointerDown)

    return () => {
      field.stop()
      host.removeEventListener("pointermove", onPointerMove)
      host.removeEventListener("pointerleave", onPointerLeave)
      host.removeEventListener("pointerdown", onPointerDown)
    }
  }, [quiet])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 -z-10", className)}
    />
  )
}

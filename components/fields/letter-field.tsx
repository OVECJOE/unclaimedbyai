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
 * A field of letters with real names hidden in it, which is what the
 * product does: find a name among all the ones already out there. The
 * cursor is a lens that scatters the letters around it and brings the
 * hidden names into view.
 *
 * Two modes:
 *  - "check" (heroes): a click or tap sends out a check wave that marks
 *    each name it passes free or taken, with a rising ripple of notes;
 *    typing in a box inside the section drops your name into the field.
 *  - "claim" (closing sections): names get taken one by one while you
 *    watch, struck through in red. Click near a free one to claim it
 *    before someone else does. When most are gone a wave frees them up
 *    again, and anything you claimed stays yours.
 *
 * With no pointer (phones, or a still mouse) the lens drifts and pulses
 * on its own. One canvas, drawn with fillText; it sleeps off-screen and
 * in hidden tabs and draws a single still frame for reduced motion.
 */

type Mode = "check" | "claim"
type Status = "free" | "taken" | "yours"

type Cell = {
  x: number
  y: number
  ch: string
  dx: number
  dy: number
  /** Index into words, or -1 for a noise letter. */
  word: number
  /** Sits under the page's own content: drawn faint, never a word. */
  covered: boolean
}

type Word = {
  text: string
  /** Check mode: what a check wave reveals. */
  free: boolean
  /** Claim mode: where the name stands right now. */
  status: Status
  /** When a wave checked it, or its status last changed. */
  flashAt: number
  typed: boolean
  cells: number[]
  /** Last time hovering over it made a sound. */
  heardAt: number
}

type Wave = {
  x: number
  y: number
  start: number
  /** Started by the visitor, so it may make sound. */
  user: boolean
  /** "reset" frees taken names as it passes (claim mode). */
  kind: "check" | "reset"
  hits: Set<number>
}

const LETTERS = "abcdefghijklmnopqrstuvwxyz"
const FALLBACK_NAMES = [
  "quillfern",
  "nexuare",
  "lumivo",
  "brightly",
  "ledgerly",
  "tallyfox",
  "brushbook",
  "inkwise",
  "orbitly",
  "kindred",
  "parcelo",
  "vantly",
  "mossway",
  "ferrow",
  "plumio",
  "tidewell",
  "corvana",
  "hazelnut",
]
const WAVE_SPEED = 0.55 // px per ms
const WAVE_BAND = 70
const FLASH_MS = 1800
const IDLE_MS = 2600
const GRAB_MS = 1100

function randomLetter(): string {
  return LETTERS[Math.floor(Math.random() * LETTERS.length)]
}

export default function LetterField({
  names = [],
  mode = "check",
  quiet = false,
  fade = "bottom",
  className,
}: {
  /** Names to hide in the field; real ones from recent checks first. */
  names?: string[]
  mode?: Mode
  /** Fewer names, fainter letters, slower idle waves: for inner pages. */
  quiet?: boolean
  /** Which edges dissolve into the neighbouring sections. */
  fade?: "bottom" | "both"
  className?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const namesKey = names.join("|")

  useEffect(() => {
    const canvas = canvasRef.current
    const host = canvas?.parentElement
    if (!canvas || !host) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const reduced = prefersReducedMotion()
    const claimMode = mode === "claim"
    const pool = Array.from(
      new Set(
        [...namesKey.split("|"), ...FALLBACK_NAMES].map((n) =>
          n.toLowerCase().replace(/[^a-z0-9]/g, "")
        )
      )
    ).filter((n) => n.length >= 3 && n.length <= 14)

    let palette = readPalette()
    let width = 0
    let height = 0
    let cell = 24
    let cols = 0
    let rows = 0
    let cells: Cell[] = []
    let words: Word[] = []
    const waves: Wave[] = []
    let typedCells: number[] = []
    let fades: { gradient: CanvasGradient; y: number; h: number }[] = []

    // The lens: where it is drawn (eased) and where it is heading.
    const lens = { x: 0, y: 0, tx: 0, ty: 0, strength: 0 }
    let lastInput = Number.NEGATIVE_INFINITY
    let pointerLens = false
    let lastIdleWave = 0
    let lastGrab = 0
    let resetting = false

    function runAt(row: number, col: number, length: number): number[] | null {
      if (row < 1 || row >= rows - 1 || col < 1 || col + length >= cols - 1)
        return null
      const indices = Array.from({ length }, (_, i) => row * cols + col + i)
      // Keep a one-cell gap either side so names stay legible.
      for (let i = indices[0] - 1; i <= indices[length - 1] + 1; i++) {
        const c = cells[i]
        if (!c || c.word !== -1 || c.covered) return null
      }
      return indices
    }

    function claimCells(indices: number[], text: string, typed: boolean) {
      const index = words.length
      words.push({
        text,
        free: Math.random() < 0.55,
        status: typed ? "yours" : "free",
        flashAt: Number.NEGATIVE_INFINITY,
        typed,
        cells: indices,
        heardAt: Number.NEGATIVE_INFINITY,
      })
      indices.forEach((cellIndex, i) => {
        cells[cellIndex].word = index
        cells[cellIndex].ch = text[i]
      })
    }

    /** A hidden name at a random clear spot. */
    function scatterWord(text: string) {
      for (let attempt = 0; attempt < 40; attempt++) {
        const row = Math.floor(Math.random() * rows)
        const col = Math.floor(Math.random() * (cols - text.length))
        const indices = runAt(row, col, text.length)
        if (indices) return claimCells(indices, text, false)
      }
    }

    /** Your typed name, at the clear spot nearest the point given. */
    function placeNear(text: string, x: number, y: number): number[] | null {
      let best: number[] | null = null
      let bestDistance = Infinity
      for (let row = 1; row < rows - 1; row++) {
        for (let col = 1; col < cols - text.length - 1; col++) {
          const midX = (col + text.length / 2) * cell
          const midY = row * cell + cell / 2
          const distance = Math.hypot(midX - x, midY - y)
          if (distance >= bestDistance) continue
          const indices = runAt(row, col, text.length)
          if (indices) {
            best = indices
            bestDistance = distance
          }
        }
      }
      if (best) claimCells(best, text, true)
      return best
    }

    function wordCenter(word: Word) {
      const first = cells[word.cells[0]]
      const last = cells[word.cells[word.cells.length - 1]]
      return { x: (first.x + last.x) / 2, y: first.y }
    }

    function build() {
      const rect = host!.getBoundingClientRect()
      width = rect.width
      height = rect.height
      const small = width < 640
      cell = small ? 20 : 24
      fitCanvas(canvas!, ctx!, width, height, small ? 1.5 : 2)

      cols = Math.ceil(width / cell) + 1
      rows = Math.ceil(height / cell) + 1
      cells = []
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          cells.push({
            x: c * cell + cell / 2,
            y: r * cell + cell / 2,
            ch: randomLetter(),
            dx: 0,
            dy: 0,
            word: -1,
            covered: false,
          })
        }
      }
      words = []
      typedCells = []
      const rects = avoidRects(host!)
      for (const c of cells) c.covered = inside(rects, c.x, c.y)
      const per = quiet ? 100 : claimMode ? 60 : 70
      const target = Math.max(5, Math.floor((cols * rows) / (small ? per * 0.8 : per)))
      for (let i = 0; i < target; i++) scatterWord(pool[i % pool.length])

      lens.x = lens.tx = width * 0.5
      lens.y = lens.ty = height * 0.4

      // Fade edges into the neighbouring sections, inside the canvas
      // (a CSS mask on an animating canvas costs a full recomposite).
      fades = []
      const bottom = ctx!.createLinearGradient(0, height * 0.72, 0, height)
      bottom.addColorStop(0, "rgb(0 0 0 / 0)")
      bottom.addColorStop(1, "rgb(0 0 0 / 1)")
      fades.push({ gradient: bottom, y: height * 0.72, h: height * 0.28 })
      if (fade === "both") {
        const top = ctx!.createLinearGradient(0, 0, 0, height * 0.22)
        top.addColorStop(0, "rgb(0 0 0 / 1)")
        top.addColorStop(1, "rgb(0 0 0 / 0)")
        fades.push({ gradient: top, y: 0, h: height * 0.22 })
      }
      setFont()
    }

    function setFont() {
      const family =
        getComputedStyle(document.documentElement)
          .getPropertyValue("--font-mono")
          .trim() || "monospace"
      ctx!.font = `500 ${cell < 24 ? 12 : 13}px ${family}`
      ctx!.textAlign = "center"
      ctx!.textBaseline = "middle"
    }

    /** Claim mode: someone, somewhere, registers one more name. */
    function grabOne(now: number) {
      const open = words.filter((w) => w.status === "free")
      const total = words.filter((w) => !w.typed).length || 1
      if (!resetting && open.length <= total * 0.2) {
        resetting = true
        waves.push({
          x: width / 2,
          y: height / 2,
          start: now,
          user: false,
          kind: "reset",
          hits: new Set(),
        })
        return
      }
      if (resetting || !open.length) return
      const word = open[Math.floor(Math.random() * open.length)]
      word.status = "taken"
      word.flashAt = now
    }

    function noteFor(word: Word, front: number, index: number) {
      const center = wordCenter(word)
      const good = claimMode ? word.status !== "taken" : word.free
      playNote({
        // The ripple climbs as the wave spreads; taken names thud low.
        step: good ? Math.min(7, 1 + Math.floor(front / 140)) : index % 2,
        bright: good,
        level: 0.75,
        pan: panOf(canvas!, center.x),
      })
    }

    function draw(now: number) {
      ctx!.clearRect(0, 0, width, height)
      const idle = now - lastInput > IDLE_MS
      if (idle && !reduced) {
        pointerLens = false
        // A slow figure-of-eight drift, so phones see the lens move.
        const pace = quiet ? 0.7 : 1
        lens.tx = width * (0.5 + 0.34 * Math.sin(now * 0.00021 * pace))
        lens.ty = height * (0.45 + 0.28 * Math.sin(now * 0.00033 * pace + 1.3))
        if (now - lastIdleWave > (quiet ? 7000 : 4200)) {
          waves.push({
            x: lens.x,
            y: lens.y,
            start: now,
            user: false,
            kind: "check",
            hits: new Set(),
          })
          lastIdleWave = now
        }
      }
      if (claimMode && !reduced && now - lastGrab > GRAB_MS) {
        lastGrab = now
        grabOne(now)
      }
      lens.x += (lens.tx - lens.x) * 0.09
      lens.y += (lens.ty - lens.y) * 0.09
      lens.strength += ((reduced ? 0 : 1) - lens.strength) * 0.05

      const radius = width < 640 ? 120 : 170
      const maxWave = Math.hypot(width, height)
      for (let i = waves.length - 1; i >= 0; i--) {
        if ((now - waves[i].start) * WAVE_SPEED > maxWave + WAVE_BAND) {
          if (waves[i].kind === "reset") resetting = false
          waves.splice(i, 1)
        }
      }

      const base = (palette.dark ? 0.13 : 0.1) * (quiet ? 0.8 : 1)
      // Style changes are the expensive part of canvas text, and most
      // letters share one style, so only touch the context on change.
      let currentColor = ""
      let currentAlpha = -1
      for (let i = 0; i < cells.length; i++) {
        const c = cells[i]
        const ddx = c.x - lens.x
        const ddy = c.y - lens.y
        const dist = Math.hypot(ddx, ddy) || 1
        let heat = Math.max(0, 1 - dist / radius)
        heat = heat * heat * lens.strength

        let waveHeat = 0
        for (const wave of waves) {
          const front = (now - wave.start) * WAVE_SPEED
          const d = Math.hypot(c.x - wave.x, c.y - wave.y)
          const band =
            Math.max(0, 1 - Math.abs(d - front) / WAVE_BAND) *
            Math.max(0, 1 - front / maxWave)
          if (band > waveHeat) waveHeat = band
          if (c.word !== -1 && band > 0.6 && !wave.hits.has(c.word)) {
            wave.hits.add(c.word)
            const word = words[c.word]
            if (wave.kind === "reset") {
              if (word.status === "taken") {
                word.status = "free"
                word.flashAt = now
              }
            } else {
              if (!claimMode) word.flashAt = now
              if (wave.user) noteFor(word, front, c.word)
            }
          }
        }

        // Letters lean away from the lens and spring back.
        const push = heat * 16
        c.dx += ((ddx / dist) * push - c.dx) * 0.16
        c.dy += ((ddy / dist) * push - c.dy) * 0.16

        const word = c.word === -1 ? null : words[c.word]
        if (
          !word &&
          (heat > 0.15 || waveHeat > 0.3) &&
          Math.random() < 0.12 + heat * 0.3
        ) {
          c.ch = randomLetter()
        }

        // Hovering a hidden name with the mouse plucks it, softly.
        if (
          word &&
          pointerLens &&
          heat > 0.55 &&
          now - word.heardAt > 2500 &&
          word.status !== "taken"
        ) {
          word.heardAt = now
          playNote({
            step: 2 + (c.word % 4),
            level: 0.3,
            pan: panOf(canvas!, c.x),
          })
        }

        const flash = word
          ? Math.max(0, 1 - (now - word.flashAt) / FLASH_MS)
          : 0
        const glow = Math.max(heat, waveHeat * 0.8)
        let color: string
        let alpha: number
        if (word) {
          if (claimMode && word.status === "taken") {
            color = palette.taken
            alpha = 0.3 + flash * 0.6 + glow * 0.3
          } else if (word.status === "yours" || word.typed) {
            color = palette.primary
            alpha = 0.6 + glow * 0.4 + flash * 0.4
          } else if (flash > 0) {
            color = claimMode || word.free ? palette.free : palette.taken
            alpha = 0.35 + flash * 0.65
          } else {
            color = palette.word
            alpha = base * 1.7 + glow * 0.85
          }
        } else {
          color = glow > 0.28 ? palette.primary : palette.noise
          alpha = base + glow * 0.55
        }

        if (c.covered) alpha *= 0.35
        alpha = Math.round(Math.min(1, alpha) * 20) / 20
        if (alpha !== currentAlpha) {
          ctx!.globalAlpha = alpha
          currentAlpha = alpha
        }
        if (color !== currentColor) {
          ctx!.fillStyle = color
          currentColor = color
        }
        const claimed = word?.status === "yours" ? 0.12 : 0
        const scale = 1 + glow * 0.45 + flash * 0.15 + claimed
        if (scale > 1.02) {
          ctx!.save()
          ctx!.translate(c.x + c.dx, c.y + c.dy)
          ctx!.scale(scale, scale)
          ctx!.fillText(c.ch, 0, 0)
          ctx!.restore()
        } else {
          ctx!.fillText(c.ch, c.x + c.dx, c.y + c.dy)
        }
      }

      // Taken names are struck through, like a crossed-off list.
      if (claimMode) {
        ctx!.strokeStyle = palette.taken
        ctx!.lineWidth = 1
        for (const word of words) {
          if (word.status !== "taken") continue
          const flash = Math.max(0, 1 - (now - word.flashAt) / 600)
          const first = cells[word.cells[0]]
          const last = cells[word.cells[word.cells.length - 1]]
          // The line draws itself across the name when it is taken.
          const span = last.x - first.x + cell * 0.8
          const drawn = span * (1 - flash * flash)
          ctx!.globalAlpha = 0.45
          ctx!.beginPath()
          ctx!.moveTo(first.x - cell * 0.4, first.y + 0.5)
          ctx!.lineTo(first.x - cell * 0.4 + drawn, first.y + 0.5)
          ctx!.stroke()
        }
      }

      ctx!.globalAlpha = 1
      ctx!.globalCompositeOperation = "destination-out"
      for (const edge of fades) {
        ctx!.fillStyle = edge.gradient
        ctx!.fillRect(0, edge.y, width, edge.h)
      }
      ctx!.globalCompositeOperation = "source-over"
    }

    const field = runField({
      host,
      build,
      draw,
      animate: !reduced,
      onTheme: () => {
        palette = readPalette()
      },
    })

    function local(clientX: number, clientY: number) {
      const rect = canvas!.getBoundingClientRect()
      return { x: clientX - rect.left, y: clientY - rect.top }
    }

    function moveTo(clientX: number, clientY: number) {
      const p = local(clientX, clientY)
      lens.tx = p.x
      lens.ty = p.y
      lastInput = performance.now()
    }

    function wave(x: number, y: number) {
      waves.push({
        x,
        y,
        start: performance.now(),
        user: true,
        kind: "check",
        hits: new Set(),
      })
    }

    /** Claim mode: the free name nearest the tap becomes yours. */
    function claimNear(x: number, y: number): boolean {
      let best: Word | null = null
      let bestDistance = width < 640 ? 140 : 200
      for (const word of words) {
        if (word.status !== "free") continue
        const center = wordCenter(word)
        const distance = Math.hypot(center.x - x, center.y - y)
        if (distance < bestDistance) {
          best = word
          bestDistance = distance
        }
      }
      if (!best) return false
      best.status = "yours"
      best.flashAt = performance.now()
      playSound("spark", `claim:${best.text}`, {
        pan: panOf(canvas!, wordCenter(best).x),
      })
      return true
    }

    const onPointerMove = (event: PointerEvent) => {
      moveTo(event.clientX, event.clientY)
      pointerLens = event.pointerType === "mouse"
    }
    const onPointerDown = (event: PointerEvent) => {
      if (isControl(event.target)) return
      const p = local(event.clientX, event.clientY)
      moveTo(event.clientX, event.clientY)
      if (claimMode) claimNear(p.x, p.y)
      wave(p.x, p.y)
    }
    const onTouch = (event: TouchEvent) => {
      const touch = event.touches[0]
      if (touch) moveTo(touch.clientX, touch.clientY)
    }

    // Typing a name drops it into the field and checks it.
    let typeTimer = 0
    const onInput = (event: Event) => {
      const target = event.target
      if (
        !(
          target instanceof HTMLTextAreaElement ||
          target instanceof HTMLInputElement
        )
      )
        return
      window.clearTimeout(typeTimer)
      typeTimer = window.setTimeout(() => {
        // Put the old cells back to noise before placing the new name.
        for (const i of typedCells) {
          cells[i].word = -1
          cells[i].ch = randomLetter()
        }
        typedCells = []
        const text =
          target.value
            .trim()
            .toLowerCase()
            .split(/\s+/)[0]
            ?.replace(/[^a-z0-9.-]/g, "") ?? ""
        if (text.length < 2 || text.length > Math.min(18, cols - 3)) return
        const box = target.getBoundingClientRect()
        const origin = host!.getBoundingClientRect()
        const placed = placeNear(
          text,
          box.right - origin.left + 120,
          box.top - origin.top + box.height / 2
        )
        if (!placed) return
        typedCells = placed
        const first = cells[placed[0]]
        const last = cells[placed[placed.length - 1]]
        wave((first.x + last.x) / 2, first.y)
        if (reduced) field.paint()
      }, 280)
    }

    host.addEventListener("input", onInput)
    if (!reduced) {
      host.addEventListener("pointermove", onPointerMove)
      host.addEventListener("pointerdown", onPointerDown)
      host.addEventListener("touchstart", onTouch, { passive: true })
      host.addEventListener("touchmove", onTouch, { passive: true })
    }

    return () => {
      field.stop()
      window.clearTimeout(typeTimer)
      host.removeEventListener("input", onInput)
      host.removeEventListener("pointermove", onPointerMove)
      host.removeEventListener("pointerdown", onPointerDown)
      host.removeEventListener("touchstart", onTouch)
      host.removeEventListener("touchmove", onTouch)
    }
  }, [namesKey, mode, quiet, fade])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 -z-10", className)}
    />
  )
}

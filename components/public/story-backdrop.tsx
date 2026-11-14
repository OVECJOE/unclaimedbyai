"use client"

import { useEffect, useRef, type MutableRefObject } from "react"
import {
  fitCanvas,
  prefersReducedMotion,
  readPalette,
  runField,
} from "@/components/fields/kit"

/**
 * The film behind the three chapters, in the same language as the
 * landing hero: letters. One swarm of small letters drifts as noise,
 * then, as you scroll, pulls together and spells what the page is
 * about, over and over in new shapes:
 *
 *  1. the name itself, with the extensions that were tried below it.
 *     Free ones light up violet; taken ones lose their letters and fall.
 *  2. the same swarm re-forms as @name with the platforms below it,
 *     open ones lit, taken ones falling away.
 *  3. and finally the swarm writes out the chatbot's answer.
 *
 * Letters travel on curved paths, not straight lines, so every change
 * of scene is a flow rather than a swap. Drawn from a pre-rendered
 * glyph sheet with plain drawImage calls: no per-frame text layout, no
 * blur, no images. It sleeps off-screen and takes its position from the
 * scroll through `film.p`.
 */

export type Film = { p: number }

export type FilmTile = { label: string; state: "free" | "taken" | "unknown" }

type Props = {
  film: MutableRefObject<Film>
  name: string
  domains: FilmTile[]
  handles: FilmTile[]
  answer: string
}

const clamp = (n: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n))
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}

const GLYPHS = "abcdefghijklmnopqrstuvwxyz0123456789@."

type Point = { x: number; y: number; state: number; group: number }
// state: 0 plain, 1 free, 2 taken

type Letter = {
  hx: number
  hy: number
  z: number
  glyph: number
  phase: number
  swirl: number
  targets: (Point | null)[]
}

export default function StoryBackdrop({
  film,
  name,
  domains,
  handles,
  answer,
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
    let letters: Letter[] = []
    let sheet: HTMLCanvasElement | null = null
    let sheetPrimary: HTMLCanvasElement | null = null
    let cell = 12
    let glyph = 7
    let shown = reduced ? 0.12 : 0

    const family = () =>
      getComputedStyle(document.documentElement)
        .getPropertyValue("--font-heading")
        .trim() || "serif"
    const mono = () =>
      getComputedStyle(document.documentElement)
        .getPropertyValue("--font-mono")
        .trim() || "monospace"

    function makeSheet(color: string): HTMLCanvasElement {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const size = Math.ceil(cell * dpr)
      const sheet = document.createElement("canvas")
      sheet.width = size * GLYPHS.length
      sheet.height = size
      const c = sheet.getContext("2d")!
      c.fillStyle = color
      c.font = `500 ${Math.round(cell * dpr * 0.9)}px ${mono()}`
      c.textAlign = "center"
      c.textBaseline = "middle"
      for (let i = 0; i < GLYPHS.length; i++) {
        c.fillText(GLYPHS[i], i * size + size / 2, size / 2 + 1)
      }
      return sheet
    }

    function paintSheets() {
      sheet = makeSheet(palette.noise)
      sheetPrimary = makeSheet(palette.primary)
    }

    /** Samples the filled pixels of one piece of text into points. */
    function sampleText(
      off: CanvasRenderingContext2D,
      text: string,
      x: number,
      y: number,
      size: number,
      font: string,
      step: number,
      state: number,
      group: number,
      weight = 400
    ): Point[] {
      off.clearRect(0, 0, width, height)
      off.font = `${weight} ${size}px ${font}`
      off.textAlign = "left"
      off.textBaseline = "middle"
      off.fillStyle = "#000"
      off.strokeStyle = "#000"
      off.lineJoin = "round"
      off.lineWidth = Math.max(1.5, size * 0.03)
      off.strokeText(text, x, y)
      off.fillText(text, x, y)
      const w = Math.ceil(off.measureText(text).width) + 4
      const top = Math.max(0, Math.floor(y - size))
      const left = Math.max(0, Math.floor(x - 2))
      const bw = Math.min(Math.floor(width) - left, w)
      const bh = Math.min(Math.floor(height) - top, Math.ceil(size * 2))
      if (bw <= 0 || bh <= 0) return []
      const data = off.getImageData(left, top, bw, bh).data
      const points: Point[] = []
      for (let py = 0; py < bh; py += step) {
        for (let px = 0; px < bw; px += step) {
          if (data[(py * bw + px) * 4 + 3] > 60) {
            points.push({ x: left + px, y: top + py, state, group })
          }
        }
      }
      return points
    }

    function buildLayouts(step: number): Point[][] {
      const off = document.createElement("canvas")
      off.width = Math.max(1, Math.round(width))
      off.height = Math.max(1, Math.round(height))
      const o = off.getContext("2d", { willReadFrequently: true })!
      const serif = family()
      const monoFont = mono()
      const stateOf = (s: FilmTile["state"]) =>
        s === "free" ? 1 : s === "taken" ? 2 : 0
      const narrow = width < 640
      const bigSize = narrow
        ? Math.min(width * 0.19, 80)
        : Math.min(width * 0.085, 104)

      /** One headline, centered in the top band. */
      const headline = (text: string, fontFamily: string, size: number) => {
        o.font = `${size}px ${fontFamily}`
        const w = o.measureText(text).width
        return sampleText(
          o,
          text,
          (width - w) / 2,
          height * 0.2,
          size,
          fontFamily,
          step,
          0,
          0
        )
      }

      /** A row of labels in the bottom band, each its own group. */
      const row = (tiles: FilmTile[]) => {
        // On a phone the labels are too small to spell; the tiles say it.
        if (narrow) return []
        // As large as fits across, so the letters stay readable.
        let rowSize = Math.min(34, Math.max(16, width * 0.03))
        let widths: number[] = []
        let gap = 0
        let total = 0
        for (;;) {
          o.font = `600 ${rowSize}px ${monoFont}`
          gap = rowSize * 1.4
          widths = tiles.map((t) => o.measureText(t.label).width)
          total =
            widths.reduce((a, b) => a + b, 0) +
            gap * Math.max(tiles.length - 1, 0)
          if (total <= width * 0.88 || rowSize <= 12) break
          rowSize -= 2
        }
        let x = (width - total) / 2
        const out: Point[] = []
        tiles.forEach((tile, i) => {
          out.push(
            ...sampleText(
              o,
              tile.label,
              x,
              height * 0.86,
              rowSize,
              monoFont,
              step,
              stateOf(tile.state),
              i,
              600
            )
          )
          x += widths[i] + gap
        })
        return out
      }

      // Chapter one: the name, then the extensions tried.
      const l1 = [...headline(name, serif, bigSize), ...row(domains)]
      // Chapter two: the same name as a handle, then the platforms.
      const l2 = [
        ...headline(`@${name.toLowerCase()}`, serif, bigSize * 0.82),
        ...row(handles),
      ]
      // Chapter three: the answer itself is real text on the page, so
      // the swarm only gathers back into the name above it.
      const l3 = headline(name, serif, bigSize * 0.8)
      return [l1, l2, l3]
    }

    function build() {
      const rect = host!.getBoundingClientRect()
      width = rect.width
      height = rect.height
      if (!width || !height) return
      const small = width < 640
      cell = small ? 10 : 12
      fitCanvas(canvas!, ctx!, width, height, small ? 1.25 : 1.5)
      paintSheets()

      // Sample at a spacing that keeps the swarm to a few hundred
      // letters; widen it until all three scenes fit.
      const cap = small ? 1800 : 2600
      let step = 3
      let layouts = buildLayouts(step)
      for (
        let tries = 0;
        tries < 6 && Math.max(...layouts.map((l) => l.length)) > cap;
        tries++
      ) {
        step += 1
        layouts = buildLayouts(step)
      }
      glyph = small ? 4.4 : Math.max(4.5, Math.min(7, step * 1.7))
      const count = Math.min(
        cap,
        Math.max(...layouts.map((l) => l.length), 120)
      )

      const pool = (name + GLYPHS).toLowerCase()
      const orders = layouts.map((points) =>
        points
          .map((p, i) => [Math.random(), i] as const)
          .sort((a, b) => a[0] - b[0])
          .map(([, i]) => points[i])
      )
      letters = Array.from({ length: count }, (_, i) => {
        const ch = pool[Math.floor(Math.random() * pool.length)]
        const index = GLYPHS.indexOf(ch)
        return {
          hx: Math.random() * width,
          hy: Math.random() * height,
          z: 0.55 + Math.random() * 0.9,
          glyph: index === -1 ? 0 : index,
          phase: Math.random() * Math.PI * 2,
          swirl: (Math.random() < 0.5 ? -1 : 1) * (0.15 + Math.random() * 0.35),
          targets: orders.map((order) => order[i] ?? null),
        }
      })
    }

    /** From a to b by e, bowed sideways so a change of scene flows. */
    function travel(
      ax: number,
      ay: number,
      bx: number,
      by: number,
      e: number,
      swirl: number
    ): [number, number] {
      const dx = bx - ax
      const dy = by - ay
      const bow = Math.sin(Math.PI * e) * swirl
      return [ax + dx * e - dy * bow, ay + dy * e + dx * bow]
    }

    function draw(now: number) {
      if (!sheet || !sheetPrimary || !letters.length) return
      const target = film.current.p
      shown += (target - shown) * (reduced ? 1 : 0.08)
      const p = shown
      const t = now / 1000
      const dpr = canvas!.width / Math.max(width, 1)

      const a1 = smooth(0.0, 0.2, p)
      const a2 = smooth(0.27, 0.43, p)
      const a3 = smooth(0.6, 0.76, p)
      const eases = [a1, a2, a3]

      // A slow push in, with a little drift sideways.
      const zoom = 1 + 0.07 * p
      const pan = -(p - 0.5) * 24
      ctx!.setTransform(
        dpr * zoom,
        0,
        0,
        dpr * zoom,
        dpr * ((width / 2) * (1 - zoom) + pan),
        dpr * ((height / 2) * (1 - zoom))
      )
      ctx!.clearRect(-width, -height, width * 3, height * 3)

      const unit = Math.ceil(cell * dpr)
      for (const letter of letters) {
        const sway = Math.sin(t * 0.6 + letter.phase)
        const swayY = Math.cos(t * 0.5 + letter.phase * 1.3)
        // Ambient drift: always a little alive, calmer once settled.
        let x = letter.hx + sway * 9 * letter.z
        let y = letter.hy + swayY * 7 * letter.z
        let alpha = 0.2 * letter.z
        let usePrimary = false
        let size = cell * letter.z * 0.8
        let fall = 0

        for (let k = 0; k < 3; k++) {
          const dest = letter.targets[k]
          const e = eases[k]
          if (e <= 0) continue
          if (!dest) {
            // Nothing to spell in this scene: drift back into the noise.
            ;[x, y] = travel(
              x,
              y,
              letter.hx + sway * 9 * letter.z,
              letter.hy + swayY * 7 * letter.z,
              e,
              letter.swirl
            )
            continue
          }
          const wobble = (1 - e) * 5 + 0.6
          const tx = dest.x + Math.sin(t * 0.8 + letter.phase) * wobble
          const ty = dest.y + Math.cos(t * 0.7 + letter.phase) * wobble
          ;[x, y] = travel(x, y, tx, ty, e, letter.swirl)

          // Where this layout is the current scene, give letters their
          // meaning: free ones glow, taken ones lose their grip.
          const next = k < 2 ? eases[k + 1] : 0
          const present = e * (1 - next)
          if (present > 0.01) {
            const lit = smooth(
              k === 0 ? 0.08 + dest.group * 0.012 : 0.4 + dest.group * 0.02,
              k === 0 ? 0.14 + dest.group * 0.012 : 0.46 + dest.group * 0.02,
              p
            )
            if (dest.state === 1) {
              usePrimary = true
              alpha = Math.max(
                alpha,
                (0.3 + 0.5 * lit) * present * (0.85 + 0.15 * sway)
              )
              size = glyph * (0.95 + 0.1 * lit)
            } else if (dest.state === 2) {
              alpha = Math.max(alpha, 0.34 * present * (1 - lit * 0.85))
              fall = lit * present * (18 + 22 * letter.z)
              size = glyph * 0.9
            } else {
              usePrimary = k === 2 || dest.y < height * 0.5
              alpha = Math.max(alpha, (k === 2 ? 0.7 : 0.55) * present)
              size = glyph
            }
          }
        }

        y += fall
        if (alpha < 0.012) continue
        ctx!.globalAlpha = Math.min(alpha, 0.9)
        const source = usePrimary ? sheetPrimary : sheet
        ctx!.drawImage(
          source,
          letter.glyph * unit,
          0,
          unit,
          unit,
          x - size / 2,
          y - size / 2,
          size,
          size
        )
      }
      ctx!.globalAlpha = 1
    }

    const field = runField({
      host,
      build,
      draw,
      onTheme: () => {
        palette = readPalette()
        paintSheets()
      },
      animate: !reduced,
      fps: 40,
    })
    return () => field.stop()
  }, [film, name, domains, handles, answer])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,transparent,black_8%,black_92%,transparent)]"
    />
  )
}

"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { HugeiconsIcon } from "@hugeicons/react"
import { BrandfetchIcon } from "@hugeicons/core-free-icons"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { SocialAvailabilityList } from "@/components/dashboard/social-icons"
import { aiAssociationColor, tierColor, tierForScore } from "@/lib/name-results"
import type { LoomTickerItem } from "@/lib/landing/loom"

/**
 * The hero's "Haunted Shortlist" theatre. A field of candidate name
 * chips drifts behind a scanning reticle; every few seconds one chip is
 * pulled in and checked live, using the same anatomy as the dashboard's
 * name card: avatar, score, tier, then the Domains, Handles and AI
 * pillars. Clean names snap into the shortlist. Haunted names get a
 * ghost for an AI memory and drift away, because every dramatization
 * needs a villain.
 *
 * A violet glow rides the cursor on desktop while lightning streaks
 * race between chips claiming ground. The story writes itself.
 *
 * House rules: GSAP owns all motion, React owns all markup. Seeds and
 * positions come from a fixed-seed PRNG so the server-rendered poster
 * frame hydrates exactly. Motion is added afterwards and stands down
 * for reduced motion. Decorative: aria-hidden.
 */

type Chip = {
  name: string
  query: string
  score: number
  ghost: string | null
  domains: { tld: string; available: boolean }[]
  socials: { platform: string; available: boolean }[]
  ai: "Low" | "Medium" | "High" | "Very High"
}

const SOCIAL_MIX = (
  taken: string[]
): { platform: string; available: boolean }[] =>
  ["x", "github", "instagram", "tiktok", "youtube"].map((platform) => ({
    platform,
    available: !taken.includes(platform),
  }))

const CHIPS: Chip[] = [
  {
    name: "Fernport",
    query: "eco luggage brand",
    score: 71,
    ghost: "ChatGPT still associates it with a 2021 crypto wallet.",
    domains: [
      { tld: "com", available: true },
      { tld: "io", available: true },
      { tld: "co", available: false },
    ],
    socials: SOCIAL_MIX(["x"]),
    ai: "High",
  },
  {
    name: "Quibbl",
    query: "app for friendly debate clubs",
    score: 88,
    ghost: null,
    domains: [
      { tld: "com", available: true },
      { tld: "app", available: true },
      { tld: "io", available: false },
    ],
    socials: SOCIAL_MIX([]),
    ai: "Low",
  },
  {
    name: "Snackwyse",
    query: "AI snack recommender",
    score: 66,
    ghost: "Perplexity cites it in 4,112 answers about sourdough.",
    domains: [
      { tld: "com", available: true },
      { tld: "ai", available: false },
      { tld: "io", available: true },
    ],
    socials: SOCIAL_MIX(["github", "tiktok"]),
    ai: "Very High",
  },
  {
    name: "Tindrop",
    query: "rain alert app",
    score: 62,
    ghost: "Gemini is certain it's a discontinued Sony camera.",
    domains: [
      { tld: "com", available: true },
      { tld: "app", available: true },
      { tld: "dev", available: true },
    ],
    socials: SOCIAL_MIX(["instagram"]),
    ai: "High",
  },
  {
    name: "Marrowly",
    query: "bone broth subscription",
    score: 91,
    ghost: null,
    domains: [
      { tld: "com", available: true },
      { tld: "shop", available: true },
      { tld: "co", available: true },
    ],
    socials: SOCIAL_MIX([]),
    ai: "Low",
  },
  {
    name: "Blimpnote",
    query: "async standup tool",
    score: 58,
    ghost: "Every model ties it to a 2018 TikTok dance.",
    domains: [
      { tld: "com", available: true },
      { tld: "app", available: false },
      { tld: "io", available: true },
    ],
    socials: SOCIAL_MIX(["tiktok", "x"]),
    ai: "Very High",
  },
  {
    name: "Corkscrewx",
    query: "wine discovery club",
    score: 69,
    ghost: "In every model it resolves to an Ohio ham-radio call sign.",
    domains: [
      { tld: "com", available: true },
      { tld: "club", available: true },
      { tld: "co", available: false },
    ],
    socials: SOCIAL_MIX(["youtube"]),
    ai: "High",
  },
  {
    name: "Pastelio",
    query: "paint-by-numbers for kids",
    score: 84,
    ghost: null,
    domains: [
      { tld: "com", available: true },
      { tld: "shop", available: true },
      { tld: "io", available: false },
    ],
    socials: SOCIAL_MIX([]),
    ai: "Low",
  },
  {
    name: "Vantaworks",
    query: "window treatment installer",
    score: 55,
    ghost: "Claude dreams it's a shuttered Lisbon co-working space.",
    domains: [
      { tld: "com", available: true },
      { tld: "pro", available: true },
      { tld: "co", available: true },
    ],
    socials: SOCIAL_MIX(["github", "x", "tiktok"]),
    ai: "Very High",
  },
  {
    name: "Bellhaus",
    query: "hotel booking for dogs",
    score: 73,
    ghost: "ChatGPT calls it 'that failed metaverse hotel startup'.",
    domains: [
      { tld: "com", available: true },
      { tld: "pets", available: true },
      { tld: "io", available: true },
    ],
    socials: SOCIAL_MIX(["instagram"]),
    ai: "High",
  },
]

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Seeded resting positions for the chip field, rejection-sampled away
 * from the stage furniture so the static poster frame never occludes
 * the theatre. Module-level so server and client agree at hydration.
 */
const CHIP_POSITIONS = (() => {
  const rand = mulberry32(20261020)
  const boxes = [
    [2, 8, 30, 24],
    [34, 10, 62, 20],
    [66, 6, 94, 26],
    [2, 34, 26, 52],
    [64, 32, 92, 54],
    [6, 58, 30, 76],
    [36, 58, 60, 74],
    [64, 58, 92, 78],
    [12, 80, 40, 88],
    [46, 80, 72, 90],
  ]
  return CHIPS.map((_, i) => {
    const [x0, y0, x1, y1] = boxes[i % boxes.length]
    return {
      left: x0 + rand() * (x1 - x0),
      top: y0 + rand() * (y1 - y0),
    }
  })
})()

function agoLabel(secondsAgo: number): string {
  if (secondsAgo < 60) return `${secondsAgo}s ago`
  const minutes = Math.round(secondsAgo / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 48) return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
}

function PillarRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-16 shrink-0 pt-0.5 text-xs text-muted-foreground">
        {label}
      </span>
      <span className="min-w-0 flex-1">{children}</span>
    </div>
  )
}

/** Inert twin of the DomainChip's available/taken look: the loom is
 *  aria-hidden decoration, and focusable links inside aria-hidden are
 *  an accessibility trap. */
function LoomDomainChip({
  tld,
  available,
}: {
  tld: string
  available: boolean
}) {
  return (
    <span
      className={`border px-1.5 py-0.5 text-xs ${
        available
          ? "border-green-600/40 bg-green-600/10 text-green-800 dark:border-green-400/40 dark:bg-green-400/10 dark:text-green-400"
          : "border-destructive/40 bg-destructive/10 text-destructive"
      }`}
    >
      <span className="font-semibold">.{tld}</span>
    </span>
  )
}

export default function HeroLoom({ ticker }: { ticker: LoomTickerItem[] }) {
  const stageRef = useRef<HTMLDivElement>(null)
  const receiptRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLSpanElement>(null)
  const briefRef = useRef<HTMLParagraphElement>(null)
  const scoreRef = useRef<HTMLSpanElement>(null)
  const tierBadgeRef = useRef<HTMLSpanElement>(null)
  const ghostRef = useRef<HTMLParagraphElement>(null)
  const aiBadgeRef = useRef<HTMLSpanElement>(null)
  const verdictRef = useRef<HTMLParagraphElement>(null)
  const reticleLabelRef = useRef<HTMLSpanElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const streakRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const wrapperRefs = useRef<Array<HTMLDivElement | null>>([])
  const innerRefs = useRef<Array<HTMLDivElement | null>>([])

  // The poster frame shows one name already shortlisted; motion mode
  // clears the board before the first scan.
  const [landed, setLanded] = useState<string[]>(["Quibbl"])
  const [tickerIdx, setTickerIdx] = useState(0)

  useEffect(() => {
    const interval = setInterval(
      () => setTickerIdx((i) => (i + 1) % Math.max(1, ticker.length)),
      5000
    )
    return () => clearInterval(interval)
  }, [ticker.length])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const mm = gsap.matchMedia()
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      let io: IntersectionObserver | null = null
      let safety: number | null = null
      let pointer: ((e: PointerEvent) => void) | null = null
      const ctx = gsap.context(() => {
        const wrappers = wrapperRefs.current.filter(Boolean) as HTMLDivElement[]
        const inners = innerRefs.current.filter(Boolean) as HTMLDivElement[]
        const receipt = receiptRef.current
        const reticleLabel = reticleLabelRef.current
        const glow = glowRef.current
        const streak = streakRef.current
        const ring = ringRef.current
        if (!receipt || !reticleLabel || !glow) return

        const ORB = 420
        const slot = () => {
          const s = stage.getBoundingClientRect()
          return { x: s.width * 0.5, y: s.height * 0.34 }
        }
        const toSlot = (el: HTMLDivElement) => {
          const s = stage.getBoundingClientRect()
          const r = el.getBoundingClientRect()
          const target = slot()
          return {
            x:
              target.x -
              (r.left -
                s.left +
                r.width / 2 -
                (gsap.getProperty(el, "x") as number)),
            y:
              target.y -
              (r.top -
                s.top +
                r.height / 2 -
                (gsap.getProperty(el, "y") as number)),
          }
        }
        const chipCenter = (el: HTMLDivElement) => ({
          x: el.offsetLeft + el.offsetWidth / 2,
          y: el.offsetTop + el.offsetHeight / 2,
        })

        // Board reset between loops: chips home, ghosts cleared,
        // receipt closed, counter zeroed.
        const resetBoard = () => {
          setLanded([])
          wrappers.forEach((w, i) => {
            gsap.set(w, {
              x: 0,
              y: 0,
              scale: 1,
              autoAlpha: 1,
              zIndex: 10 + i,
            })
            const inner = inners[i]
            if (inner) {
              gsap.set(inner, {
                opacity: 1,
                filter: "grayscale(0)",
                borderColor: "var(--border)",
              })
              const strike = inner.querySelector("[data-strike]")
              if (strike) gsap.set(strike, { scaleX: 0 })
              const ghostBorder = inner.querySelector("[data-ghost-border]")
              if (ghostBorder) gsap.set(ghostBorder, { opacity: 0 })
            }
          })
          gsap.set(receipt, { autoAlpha: 0 })
          gsap.set(reticleLabel, { autoAlpha: 0 })
        }
        resetBoard()

        // The glow: cursor-following on desktop, parked at stage center
        // otherwise. It is the claiming force. The lightning does the
        // talking.
        const glowX = gsap.quickTo(glow, "x", {
          duration: 0.6,
          ease: "power3",
        })
        const glowY = gsap.quickTo(glow, "y", {
          duration: 0.6,
          ease: "power3",
        })
        const park = () => {
          const s = stage.getBoundingClientRect()
          glowX(s.width / 2 - ORB / 2)
          glowY(s.height / 2 - ORB / 2)
        }
        park()
        const hoverable = window.matchMedia(
          "(hover: hover) and (pointer: fine)"
        ).matches
        if (hoverable) {
          pointer = (e: PointerEvent) => {
            const s = stage.getBoundingClientRect()
            glowX(e.clientX - s.left - ORB / 2)
            glowY(e.clientY - s.top - ORB / 2)
          }
          stage.addEventListener("pointermove", pointer)
        }

        // Slow drift: each chip's inner layer wanders on an
        // incommensurate loop so the field never pulses in unison.
        const drifts = inners.map((inner, i) =>
          gsap.to(inner, {
            x: () => (mulberry32(9000 + i * 31)() - 0.5) * 34,
            y: () => (mulberry32(9100 + i * 17)() - 0.5) * 26,
            duration: 5 + (i % 5),
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: i * 0.4,
          })
        )
        drifts.forEach((d) => d.pause())

        // Lightning: streaks race chip to chip at genuinely rude
        // speeds, flash-ring whatever they touch, and move on. Someone
        // is out there claiming names. Might as well be us.
        const rand = mulberry32(777001)
        const zap = (
          from: { x: number; y: number },
          to: { x: number; y: number }
        ) => {
          if (!streak || !ring) return gsap.timeline()
          const angle =
            (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI
          const tl = gsap.timeline()
          tl.set(streak, {
            x: from.x,
            y: from.y,
            rotation: angle,
            scaleX: 0.2,
            autoAlpha: 0,
          })
            .set(ring, { x: to.x - 24, y: to.y - 24, scale: 0.4, autoAlpha: 0 })
            .to(streak, { autoAlpha: 0.9, duration: 0.05 })
            .to(streak, {
              x: to.x,
              y: to.y,
              scaleX: 1,
              duration: 0.16,
              ease: "power4.in",
            })
            .to(streak, { autoAlpha: 0, duration: 0.12 })
            .fromTo(
              ring,
              { scale: 0.4, autoAlpha: 0.9 },
              { scale: 1.9, autoAlpha: 0, duration: 0.5, ease: "power2.out" },
              ">-0.02"
            )
          const hit = wrappers.find((w) => chipCenter(w).x === to.x)
          if (hit) {
            const ghostBorder = hit.querySelector("[data-ghost-border]")
            if (ghostBorder) {
              tl.fromTo(
                ghostBorder,
                { opacity: 0.85 },
                { opacity: 0, duration: 0.6 },
                ">-0.5"
              )
            }
          }
          return tl
        }
        const lightning = gsap.timeline({ repeat: -1, paused: true })
        for (let hop = 0; hop < 3; hop++) {
          const a = wrappers[Math.floor(rand() * wrappers.length)]
          const b = wrappers[Math.floor(rand() * wrappers.length)]
          if (!a || !b || a === b) continue
          lightning.add(
            zap(chipCenter(a), chipCenter(b)),
            hop === 0 ? 0.4 : ">-1.6"
          )
        }
        lightning.to({}, { duration: 2.4 })

        const tl = gsap.timeline({ repeat: -1, paused: true })

        CHIPS.forEach((chip, i) => {
          const wrapper = wrappers[i]
          const inner = inners[i]
          if (!wrapper || !inner) return
          const label = `c${i}`
          const others = wrappers.filter((_, j) => j !== i)
          const strike = inner.querySelector("[data-strike]")
          const ghostBorder = inner.querySelector("[data-ghost-border]")
          const tier = tierForScore(chip.score)

          tl.addLabel(label)
            // Pull the chip under the reticle; the field dims around it.
            .to(
              wrapper,
              {
                x: () => toSlot(wrapper).x,
                y: () => toSlot(wrapper).y,
                scale: 1.06,
                zIndex: 40,
                duration: 0.9,
                ease: "power3.inOut",
              },
              label
            )
            .to(others, { opacity: 0.22, duration: 0.5 }, label)
            .to(reticleLabel, { autoAlpha: 1, duration: 0.3 }, label)
            .call(
              () => {
                if (nameRef.current) nameRef.current.textContent = chip.name
                if (briefRef.current)
                  briefRef.current.textContent = `BRIEF: "${chip.query}"`
                if (scoreRef.current)
                  scoreRef.current.textContent = String(chip.score)
                if (tierBadgeRef.current) {
                  tierBadgeRef.current.textContent = tier
                  tierBadgeRef.current.className = `animate-in duration-500 fade-in-0 zoom-in-95 ${tierColor(tier)}`
                }
                if (aiBadgeRef.current) {
                  aiBadgeRef.current.textContent = chip.ai
                  aiBadgeRef.current.className = `animate-in duration-300 fade-in-0 zoom-in-95 ${aiAssociationColor(chip.ai)}`
                }
                if (ghostRef.current)
                  ghostRef.current.textContent =
                    chip.ghost ?? "no ghosts found. this name is clean"
                if (verdictRef.current) {
                  verdictRef.current.textContent = chip.ghost
                    ? "verdict: haunted, skipped"
                    : "verdict: clean, shortlisted"
                  verdictRef.current.className = `border-t border-border pt-2 font-mono text-[10px] tracking-widest uppercase ${
                    chip.ghost ? "text-destructive" : "text-primary"
                  }`
                }
              },
              [],
              `${label}+=0.45`
            )
            .fromTo(
              receipt,
              { autoAlpha: 0, y: 12 },
              { autoAlpha: 1, y: 0, duration: 0.45, ease: "power2.out" },
              `${label}+=0.5`
            )
            // Act 1: the domains, chip by chip.
            .fromTo(
              "[data-domains] > span",
              { autoAlpha: 0, y: 6 },
              { autoAlpha: 1, y: 0, duration: 0.25, stagger: 0.16 },
              `${label}+=1.05`
            )
            // Act 2: the handles light up.
            .fromTo(
              "[data-handles] > span > span",
              { autoAlpha: 0 },
              { autoAlpha: 1, duration: 0.2, stagger: 0.12 },
              `${label}+=1.55`
            )
            // Act 3: the AI memory. The beat everyone screenshots.
            .fromTo(
              aiBadgeRef.current,
              { autoAlpha: 0, scale: 0.6 },
              {
                autoAlpha: 1,
                scale: 1,
                duration: 0.3,
                ease: "back.out(2)",
              },
              `${label}+=2.35`
            )
            .fromTo(
              ghostRef.current,
              { autoAlpha: 0, y: 4 },
              { autoAlpha: 1, y: 0, duration: 0.35 },
              `${label}+=2.5`
            )
            .fromTo(
              verdictRef.current,
              { autoAlpha: 0 },
              { autoAlpha: 1, duration: 0.3 },
              `${label}+=2.7`
            )

          if (chip.ghost) {
            // The kill: strike, desaturate, let the ghost have it.
            tl.to(
              strike,
              { scaleX: 1, duration: 0.4, ease: "power2.in" },
              `${label}+=4.2`
            )
              .to(
                inner,
                { opacity: 0.4, filter: "grayscale(1)", duration: 0.5 },
                `${label}+=4.3`
              )
              .to(
                wrapper,
                { y: "+=130", autoAlpha: 0, duration: 0.9, ease: "power2.in" },
                `${label}+=4.9`
              )
              .to(receipt, { autoAlpha: 0, duration: 0.4 }, `${label}+=5.4`)
              .to(
                reticleLabel,
                { autoAlpha: 0, duration: 0.3 },
                `${label}+=5.4`
              )
          } else {
            // The survival: the chip glows violet and snaps home.
            tl.to(ghostBorder, { opacity: 1, duration: 0.25 }, `${label}+=3.7`)
              .to(
                wrapper,
                {
                  x: () => {
                    const s = stage.getBoundingClientRect()
                    return (
                      s.width -
                      96 -
                      (wrapper.offsetLeft + wrapper.offsetWidth / 2)
                    )
                  },
                  y: () => 44 - (wrapper.offsetTop + wrapper.offsetHeight / 2),
                  scale: 0.42,
                  autoAlpha: 0,
                  duration: 0.95,
                  ease: "power3.inOut",
                },
                `${label}+=4.0`
              )
              .call(
                () => setLanded((prev) => [...prev, chip.name]),
                [],
                `${label}+=4.85`
              )
              .to(receipt, { autoAlpha: 0, duration: 0.4 }, `${label}+=5.1`)
              .to(
                reticleLabel,
                { autoAlpha: 0, duration: 0.3 },
                `${label}+=5.1`
              )
          }
        })

        // Loop hygiene: restore the board, then let repeat:-1 replay.
        tl.call(resetBoard, [], ">/")

        // Start once the stage is actually on screen; the safety timer
        // covers environments where IntersectionObserver never reports
        // so the hero never sits as a frozen poster for a visitor who
        // is in fact looking at it.
        let started = false
        const begin = () => {
          if (started) return
          started = true
          setLanded([])
          drifts.forEach((d) => d.play())
          lightning.play(0)
          tl.play(0)
        }
        const resume = () => {
          begin()
          tl.play()
          drifts.forEach((d) => d.play())
          lightning.play()
        }
        safety = window.setTimeout(begin, 2500)

        // Pause the whole theatre when scrolled out of view.
        io = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              resume()
            } else {
              tl.pause()
              drifts.forEach((d) => d.pause())
              lightning.pause()
            }
          },
          { threshold: 0.15 }
        )
        io?.observe(stage)
      }, stage)
      return () => {
        io?.disconnect()
        if (safety !== null) window.clearTimeout(safety)
        if (pointer) stage.removeEventListener("pointermove", pointer)
        ctx.revert()
      }
    })
    return () => mm.revert()
  }, [ticker.length])

  const item = ticker[tickerIdx % Math.max(1, ticker.length)]
  const posterTier = tierForScore(88)

  return (
    <div
      ref={stageRef}
      aria-hidden="true"
      className="relative h-[420px] overflow-hidden border border-border bg-sidebar/40 lg:h-[520px]"
    >
      {/* The claiming glow: cursor-tracked on desktop, parked center otherwise. */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute top-1/2 left-1/2 z-0 -translate-x-1/2 -translate-y-1/2 opacity-70"
        style={{ width: 420, height: 420 }}
      >
        <div className="h-full w-full rounded-full bg-[radial-gradient(circle,var(--primary)_0%,transparent_70%)] opacity-25 blur-[90px]" />
      </div>

      {/* The page's dashed column motif, carried inside the stage. */}
      <div className="pointer-events-none absolute inset-y-0 left-1/3 z-0 border-l border-dashed border-border" />
      <div className="pointer-events-none absolute inset-y-0 left-2/3 z-0 border-l border-dashed border-border" />

      {/* Lightning: a streak and its arrival ring, parked out of sight. */}
      <div
        ref={streakRef}
        className="pointer-events-none absolute top-0 left-0 z-[25] h-[3px] w-16 origin-left rounded-full bg-primary opacity-0 shadow-[0_0_18px_2px_var(--primary)]"
      />
      <div
        ref={ringRef}
        className="pointer-events-none absolute top-0 left-0 z-[25] size-12 rounded-full border-2 border-primary opacity-0"
      />

      {/* Live-from-the-wild ticker: real anonymous searches. */}
      <div className="absolute top-3 left-3 z-30 max-w-[52%]">
        <p className="font-mono text-[10px] tracking-widest text-primary uppercase">
          live from the wild
        </p>
        <p
          key={tickerIdx}
          className="mt-1 animate-in truncate font-mono text-xs text-muted-foreground duration-700 fade-in"
        >
          {item
            ? `anon ran “${item.query}”, checked ${agoLabel(item.secondsAgo)}`
            : "waiting for the wild…"}
        </p>
      </div>

      {/* The shortlist wall. */}
      <div className="absolute top-3 right-3 z-30 w-[168px] border border-border bg-card/90 p-3">
        <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
          Shortlist
        </p>
        <p className="font-mono text-lg font-semibold text-primary tabular-nums">
          {String(landed.length).padStart(3, "0")}
        </p>
        <ul className="mt-2 flex flex-col gap-1">
          {landed.map((name) => (
            <li
              key={name}
              className="animate-in truncate border border-primary/40 bg-primary/10 px-2 py-1 font-mono text-[10px] text-primary duration-300 zoom-in-95"
            >
              {name}
            </li>
          ))}
        </ul>
      </div>

      {/* The reticle. */}
      <div className="absolute top-[34%] left-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
        <div className="relative h-[92px] w-[220px]">
          <span className="absolute -top-px -left-px h-3 w-3 border-t-2 border-l-2 border-primary" />
          <span className="absolute -top-px -right-px h-3 w-3 border-t-2 border-r-2 border-primary" />
          <span className="absolute -bottom-px -left-px h-3 w-3 border-b-2 border-l-2 border-primary" />
          <span className="absolute -right-px -bottom-px h-3 w-3 border-r-2 border-b-2 border-primary" />
          <span
            ref={reticleLabelRef}
            className="absolute -bottom-5 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-widest whitespace-nowrap text-primary uppercase"
            style={{ opacity: 0 }}
          >
            scanning…
          </span>
        </div>
      </div>

      {/* The drifting candidate field. */}
      {CHIPS.map((chip, i) => (
        <div
          key={chip.name}
          ref={(el) => {
            wrapperRefs.current[i] = el
          }}
          className="absolute z-10"
          style={{
            left: `${CHIP_POSITIONS[i].left}%`,
            top: `${CHIP_POSITIONS[i].top}%`,
          }}
        >
          <div
            ref={(el) => {
              innerRefs.current[i] = el
            }}
            className="relative border border-border bg-card px-3 py-2"
          >
            <span
              className="pointer-events-none absolute inset-0 border border-primary"
              data-ghost-border
              style={{ opacity: 0 }}
            />
            <span
              className="pointer-events-none absolute top-1/2 right-0 left-0 h-[2px] origin-left bg-foreground"
              data-strike
              style={{ transform: "scaleX(0)" }}
            />
            <span className="font-mono text-xs whitespace-nowrap">
              {chip.name}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              .com
            </span>
          </div>
        </div>
      ))}

      {/* The check receipt, wearing the dashboard's name card clothes. */}
      <div
        ref={receiptRef}
        className="absolute bottom-3 left-3 z-30 w-[340px] space-y-3 border border-border bg-card p-4"
        style={{ opacity: 0 }}
      >
        <div className="flex items-start justify-between gap-3">
          <span className="flex min-w-0 items-center gap-3">
            <Avatar size="sm">
              <AvatarFallback>
                <HugeiconsIcon icon={BrandfetchIcon} className="size-4" />
              </AvatarFallback>
            </Avatar>
            <span className="min-w-0">
              <span ref={nameRef} className="block truncate font-medium">
                Quibbl
              </span>
              <p
                ref={briefRef}
                className="truncate font-mono text-[10px] text-muted-foreground"
              >
                BRIEF: &quot;app for friendly debate clubs&quot;
              </p>
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-2">
            <span ref={scoreRef} className="font-medium tabular-nums">
              88
            </span>
            <Badge ref={tierBadgeRef} className={tierColor(posterTier)}>
              {posterTier}
            </Badge>
          </span>
        </div>
        <p
          ref={ghostRef}
          className="truncate text-xs text-muted-foreground italic"
        >
          no ghosts found. this name is clean
        </p>
        <div className="space-y-1.5">
          <PillarRow label="Domains">
            <span data-domains className="flex flex-wrap gap-1.5">
              <LoomDomainChip tld="com" available />
              <LoomDomainChip tld="app" available />
              <LoomDomainChip tld="io" available={false} />
            </span>
          </PillarRow>
          <PillarRow label="Handles">
            <span data-handles>
              <SocialAvailabilityList socials={SOCIAL_MIX(["github"])} />
            </span>
          </PillarRow>
          <PillarRow label="AI">
            <Badge ref={aiBadgeRef} className={aiAssociationColor("Low")}>
              Low
            </Badge>
          </PillarRow>
        </div>
        <p
          ref={verdictRef}
          className="border-t border-border pt-2 font-mono text-[10px] tracking-widest text-primary uppercase"
          style={{ opacity: 0 }}
        >
          verdict: clean, shortlisted
        </p>
      </div>
    </div>
  )
}

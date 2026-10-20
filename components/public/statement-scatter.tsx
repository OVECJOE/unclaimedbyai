"use client"

import Link from "next/link"
import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Button } from "@/components/ui/button"

gsap.registerPlugin(ScrollTrigger)

/**
 * The page's signature scroll moment, told in the product's own words
 * instead of stock photography. A field of candidate names drifts in
 * the margins, each wearing the false memory a model already has of it:
 * struck through, dimmed, haunted. The few that are clean glow violet.
 * The statement sits directly on the page over a soft vignette, no
 * card, so the words and the ghosts share one plane. Positions are
 * seeded, so the static frame (reduced motion, no JS) is already the
 * finished composition.
 */

type Plate = { name: string; ghost: string; clean: boolean }

const PLATES: Plate[] = [
  {
    name: "Fernport",
    ghost: "a 2021 crypto wallet, per ChatGPT",
    clean: false,
  },
  { name: "Quibbl", ghost: "no ghosts. it is yours to claim.", clean: true },
  {
    name: "Snackwyse",
    ghost: "the internet's sourdough authority",
    clean: false,
  },
  { name: "Tindrop", ghost: "a discontinued camera, per Gemini", clean: false },
  { name: "Marrowly", ghost: "no ghosts. it is yours to claim.", clean: true },
  { name: "Blimpnote", ghost: "a 2018 TikTok dance, allegedly", clean: false },
  { name: "Corkscrewx", ghost: "an Ohio ham-radio call sign", clean: false },
  { name: "Pastelio", ghost: "no ghosts. it is yours to claim.", clean: true },
  {
    name: "Vantaworks",
    ghost: "a shuttered Lisbon studio, per Claude",
    clean: false,
  },
  {
    name: "Bellhaus",
    ghost: "a failed metaverse hotel, per GPT",
    clean: false,
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

/** Ring positions around the statement, seeded, in stage percentages,
 *  kept clear of the center column so the words never fight a name. */
const PLATE_POSITIONS = (() => {
  const rand = mulberry32(31415926)
  return PLATES.map((_, i) => {
    const angle = (i / PLATES.length) * Math.PI * 2 + rand() * 0.45
    const rx = 31 + rand() * 15
    const ry = 28 + rand() * 14
    return {
      left: 50 + Math.cos(angle) * rx,
      top: 50 + Math.sin(angle) * ry,
      rotate: (rand() - 0.5) * 14,
    }
  })
})()

/** A friendly ghost: the marker for a name a model already haunts. */
function GhostGlyph({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2C7.4 2 4.5 5.6 4.5 10.6V21l2.3-1.9 2.3 1.9 2.4-1.9 2.4 1.9 2.3-1.9 2.3 1.9v-10.4C19.5 5.6 16.6 2 12 2Z" />
      <circle cx="9.4" cy="10.2" r="1.35" fill="var(--background)" />
      <circle cx="14.6" cy="10.2" r="1.35" fill="var(--background)" />
    </svg>
  )
}

/** A sparkle: the marker for a clean name worth claiming. */
function SparkGlyph({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2L12 2z" />
    </svg>
  )
}

export default function StatementScatter() {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const mm = gsap.matchMedia()
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        const plates = gsap.utils.toArray<HTMLElement>(
          "[data-ghost-plate]",
          root
        )
        const stage = root.querySelector<HTMLElement>("[data-scatter-stage]")

        const centerDelta = (el: HTMLElement) => {
          const s = stage?.getBoundingClientRect()
          if (!s) return { x: 0, y: 0 }
          const r = el.getBoundingClientRect()
          return {
            x: s.width / 2 - (r.left - s.left + r.width / 2),
            y: s.height / 2 - (r.top - s.top + r.height / 2),
          }
        }

        gsap.from(plates, {
          x: (i, el) => centerDelta(el).x,
          y: (i, el) => centerDelta(el).y,
          rotate: 0,
          scale: 0.8,
          ease: "none",
          stagger: { each: 0.04, from: "random" },
          scrollTrigger: {
            trigger: root,
            start: "top 90%",
            end: "top 34%",
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        })

        gsap.from("[data-scatter-copy]", {
          y: 40,
          autoAlpha: 0,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top 72%",
            end: "top 40%",
            scrub: 0.5,
          },
        })
      }, root)
      return () => ctx.revert()
    })
    return () => mm.revert()
  }, [])

  return (
    <section ref={rootRef} className="relative overflow-hidden border-b">
      {/* A soft violet wash, so the section has a pulse without a box. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_45%,color-mix(in_oklch,var(--primary)_12%,transparent)_0%,transparent_70%)]"
      />
      {/* Ambient ghosts: game-like sprites haunting the margins, bobbing
          in place. Pure decoration, so they stay aria-hidden. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
      >
        <span className="ghost-bob absolute top-[10%] left-[7%] text-primary/25">
          <GhostGlyph className="size-8" />
        </span>
        <span
          className="ghost-bob absolute top-[68%] right-[9%] text-primary/20"
          style={{ animationDelay: "1.6s" }}
        >
          <GhostGlyph className="size-11" />
        </span>
        <span
          className="ghost-bob absolute bottom-[12%] left-[15%] text-primary/15"
          style={{ animationDelay: "3.1s" }}
        >
          <GhostGlyph className="size-7" />
        </span>
      </div>
      <div
        data-scatter-stage
        className="relative mx-auto flex min-h-[660px] max-w-7xl flex-col items-center justify-center px-4 py-20 lg:min-h-[820px]"
      >
        {PLATES.map((plate, i) => (
          <div
            key={plate.name}
            data-ghost-plate
            className="absolute z-0"
            style={{
              left: `${PLATE_POSITIONS[i].left}%`,
              top: `${PLATE_POSITIONS[i].top}%`,
              width: "clamp(150px, 19vw, 232px)",
              transform: `translate(-50%, -50%) rotate(${PLATE_POSITIONS[i].rotate}deg)`,
            }}
          >
            <div
              className={`border p-3 backdrop-blur-sm ${
                plate.clean
                  ? "border-primary/50 bg-primary/[0.06] shadow-[0_0_24px_-6px_var(--primary)]"
                  : "border-border bg-card/80 opacity-70"
              }`}
            >
              <p className="relative flex items-center gap-1.5 font-heading text-lg leading-tight">
                <span
                  className={
                    plate.clean
                      ? "sparkle text-primary"
                      : "ghost-bob text-muted-foreground/70"
                  }
                >
                  {plate.clean ? (
                    <SparkGlyph className="size-3.5" />
                  ) : (
                    <GhostGlyph className="size-3.5" />
                  )}
                </span>
                <span className="relative">
                  <span className={plate.clean ? "" : "text-muted-foreground"}>
                    {plate.name}
                  </span>
                  {plate.clean ? null : (
                    <span
                      aria-hidden="true"
                      className="absolute top-1/2 right-0 left-0 h-px origin-left bg-foreground/60"
                    />
                  )}
                </span>
              </p>
              <p
                className={`mt-1 font-sans text-[11px] leading-snug ${
                  plate.clean ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {plate.ghost}
              </p>
            </div>
          </div>
        ))}

        {/* The vignette: fades the drifting names to nothing behind the
            words, so the statement reads clean without a card. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(45%_42%_at_50%_50%,var(--background)_35%,transparent_75%)]"
        />

        <div data-scatter-copy className="relative z-10 max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            A name is a story.{" "}
            <span className="text-primary">
              Make sure no chatbot wrote yours already
            </span>
            .
          </h2>
          <p className="mx-auto mt-5 max-w-prose text-muted-foreground md:text-lg">
            Every week, founders fall in love with a name that already means
            something else inside the models: a dead startup, a discontinued
            camera, a TikTok dance. We surface the ghosts before you print the
            shirts.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/check">Run a free check</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/blog">Read the field guide</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

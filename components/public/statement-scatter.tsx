"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Button } from "@/components/ui/button"

gsap.registerPlugin(ScrollTrigger)

/**
 * The page's signature scroll moment. Ten curated photographs start
 * stacked behind the statement and fan outward as the section scrolls
 * up — positions seeded so the static frame (reduced motion, no JS)
 * is already the finished composition. GSAP only re-stages it into a
 * scrub. Theme: words, doors, crowds, fog — the life a name gets.
 */

const PHOTOS = [
  {
    src: "/images/landing/craft-typewriter.jpg",
    alt: "Amber typewriter keys in close-up",
  },
  {
    src: "/images/landing/sign-barber.jpg",
    alt: "Hand-painted barber shop sign",
  },
  { src: "/images/landing/crowd-blur.jpg", alt: "A blurred crowd in motion" },
  {
    src: "/images/landing/fog-ghosts.jpg",
    alt: "Fog rolling over a forested ridge",
  },
  {
    src: "/images/landing/chess-pieces.jpg",
    alt: "Black and white chess pieces, sculptural",
  },
  {
    src: "/images/landing/sign-thrift.jpg",
    alt: "Old storefront with a hand-lettered name",
  },
  {
    src: "/images/landing/billboards-night.jpg",
    alt: "Billboards glowing above a night street",
  },
  {
    src: "/images/landing/chess-board.jpg",
    alt: "A chess game mid-play, shallow focus",
  },
  {
    src: "/images/landing/lookout.jpg",
    alt: "Coin binoculars pointing at a valley",
  },
  {
    src: "/images/landing/crossing.jpg",
    alt: "A crowded crossing seen from above",
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

/** Ring positions around the statement, seeded, in stage percentages. */
const PHOTO_POSITIONS = (() => {
  const rand = mulberry32(19841024)
  return PHOTOS.map((_, i) => {
    const angle = (i / PHOTOS.length) * Math.PI * 2 + rand() * 0.5
    const rx = 30 + rand() * 14
    const ry = 27 + rand() * 13
    return {
      left: 50 + Math.cos(angle) * rx,
      top: 52 + Math.sin(angle) * ry,
      rotate: (rand() - 0.5) * 16,
    }
  })
})()

export default function StatementScatter() {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const mm = gsap.matchMedia()
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        const photos = gsap.utils.toArray<HTMLElement>(
          "[data-scatter-photo]",
          root
        )
        const stage = root.querySelector<HTMLElement>("[data-scatter-stage]")

        const centerDelta = (el: HTMLElement) => {
          const s = stage?.getBoundingClientRect()
          if (!s) return { x: 0, y: 0 }
          const r = el.getBoundingClientRect()
          return {
            x: s.width / 2 - (r.left - s.left + r.width / 2),
            y: s.height * 0.52 - (r.top - s.top + r.height / 2),
          }
        }

        gsap.from(photos, {
          x: (i, el) => centerDelta(el).x,
          y: (i, el) => centerDelta(el).y,
          rotate: 0,
          scale: 0.82,
          autoAlpha: 0.25,
          ease: "none",
          stagger: { each: 0.04, from: "random" },
          scrollTrigger: {
            trigger: root,
            start: "top 88%",
            end: "top 32%",
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
            start: "top 70%",
            end: "top 38%",
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
      <div
        data-scatter-stage
        className="relative mx-auto flex min-h-[620px] max-w-7xl flex-col items-center justify-center px-4 py-16 lg:min-h-[780px]"
      >
        {PHOTOS.map((photo, i) => (
          <div
            key={photo.src}
            data-scatter-photo
            className="absolute z-0 border border-border"
            style={{
              left: `${PHOTO_POSITIONS[i].left}%`,
              top: `${PHOTO_POSITIONS[i].top}%`,
              width: "clamp(140px, 18vw, 230px)",
              aspectRatio: "4 / 3",
              transform: `translate(-50%, -50%) rotate(${PHOTO_POSITIONS[i].rotate}deg)`,
            }}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              width={480}
              height={360}
              className="h-full w-full object-cover"
            />
          </div>
        ))}

        <div data-scatter-copy className="relative z-10 max-w-2xl">
          {/* The glow the glass casts on the photographs behind it. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-8 -z-10 bg-primary/15 blur-3xl"
          />
          {/* Bulletproof glass: took a round from a sniper, kept every
              molecule in place. The web is just showing off. */}
          <div className="relative border border-white/50 bg-background/55 p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.75),inset_0_-24px_48px_rgba(255,255,255,0.10),0_30px_60px_-30px_var(--primary)] backdrop-blur-xl sm:p-10 dark:border-white/15 dark:bg-background/75 dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),inset_0_-24px_48px_rgba(255,255,255,0.04),0_30px_60px_-30px_var(--primary)]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/45 via-white/5 to-white/20 dark:from-white/10 dark:via-white/0 dark:to-white/5"
            />
            <svg
              aria-hidden="true"
              viewBox="0 0 400 300"
              preserveAspectRatio="xMaxYMin slice"
              className="pointer-events-none absolute inset-0 h-full w-full opacity-60 dark:opacity-40"
              fill="none"
            >
              {/* Impact point, top right. Spokes. */}
              <g stroke="rgba(255,255,255,0.85)" strokeWidth="0.9">
                <path d="M338 44 L150 8" />
                <path d="M338 44 L208 78" />
                <path d="M338 44 L96 96" />
                <path d="M338 44 L14 178" />
                <path d="M338 44 L52 284" />
                <path d="M338 44 L214 296" />
                <path d="M338 44 L330 236" />
                <path d="M338 44 L398 156" />
                <path d="M338 44 L392 22" />
              </g>
              {/* Two torn rings of web between the spokes. */}
              <g
                stroke="rgba(255,255,255,0.6)"
                strokeWidth="0.7"
                strokeDasharray="3 5"
              >
                <path d="M318 20 L300 62 L262 74 L286 116 L244 148 L282 178 L272 224" />
                <path d="M262 6 L232 44 L188 38 L176 84 L120 78" />
              </g>
              <g
                stroke="rgba(167,139,250,0.55)"
                strokeWidth="0.7"
                strokeDasharray="2 6"
              >
                <path d="M212 30 L186 92 L118 118 L104 190 L34 226" />
                <path d="M244 148 L182 172 L150 236" />
              </g>
              {/* The impact itself: a bright chip of glass, intact. */}
              <circle cx="338" cy="44" r="4.5" fill="rgba(255,255,255,0.9)" />
              <circle
                cx="338"
                cy="44"
                r="9"
                stroke="rgba(255,255,255,0.7)"
                strokeWidth="0.9"
              />
            </svg>
            <div className="relative space-y-6 text-center">
              <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                A name is a story.{" "}
                <span className="text-primary dark:text-[color-mix(in_oklch,var(--primary)_55%,white)]">
                  Make sure no chatbot wrote yours already
                </span>
                .
              </h2>
              <p className="mx-auto max-w-prose text-muted-foreground md:text-lg">
                Every week, founders fall in love with a name that already means
                something else inside the models: a dead startup, a discontinued
                camera, a TikTok dance. We surface the ghosts before you print
                the shirts.
              </p>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button size="lg" asChild>
                  <Link href="/check">Run a free check</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/blog">Read the field guide</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

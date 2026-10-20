"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"

const MOCK_IDEAS = [
  { title: "Vantis", category: "business" },
  { title: "Loomwork", category: "business" },
  { title: "Sparrowkit", category: "product" },
  { title: "Nookline", category: "product" },
]

/**
 * A miniature of the canvas: four idea cards arriving one by one, the
 * way a real run lands them. Pure decoration, so the loop stands down
 * entirely under prefers-reduced-motion, where the cards just render.
 * No API and no state: gsap owns the visibility, React owns the markup.
 */
export default function GenerationMock() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const mm = gsap.matchMedia()
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const cards = el.querySelectorAll<HTMLElement>("[data-mock-card]")
      const ctx = gsap.context(() => {
        gsap.fromTo(
          cards,
          { autoAlpha: 0, y: 10 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.45,
            ease: "power2.out",
            stagger: 0.4,
            delay: 0.4,
            repeat: -1,
            repeatDelay: 2.2,
          }
        )
      }, el)
      return () => ctx.revert()
    })
    return () => mm.revert()
  }, [])

  return (
    <div
      ref={ref}
      className="border bg-card p-4"
      aria-label="Idea cards arriving on a sandbox canvas, one at a time"
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="font-mono text-[0.625rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
          Weekend bets / sandbox
        </p>
        <span className="flex items-center gap-1.5 font-mono text-[0.625rem] text-muted-foreground">
          <span
            aria-hidden
            className="size-1.5 rounded-full bg-primary motion-safe:animate-pulse"
          />
          generating
        </span>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {MOCK_IDEAS.map((idea, index) => (
          <li key={idea.title} data-mock-card className="border p-3">
            <div className="flex items-baseline justify-between gap-2">
              <p className="truncate font-heading text-base font-semibold">
                {idea.title}
              </p>
              <span className="shrink-0 font-mono text-[0.625rem] text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <p className="mt-1 font-mono text-[0.625rem] text-muted-foreground uppercase">
              {idea.category}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}

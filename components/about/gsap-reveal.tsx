"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

/**
 * Scroll-reveal wrapper used inside server pages. The content is fully
 * rendered on the server (visible without JS); this only adds a
 * fade/slide-in once the client hydrates, and it stands down entirely
 * when the visitor prefers reduced motion.
 *
 * Pass `stagger` to animate direct children marked with `data-reveal`.
 */
export default function GsapReveal({
  children,
  className,
  y = 24,
  stagger = 0,
  start = "top 85%",
}: {
  children: React.ReactNode
  className?: string
  y?: number
  stagger?: number
  start?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const mm = gsap.matchMedia()
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        const targets = stagger
          ? el.querySelectorAll<HTMLElement>("[data-reveal]")
          : [el]
        if (!targets.length) return
        gsap.from(targets, {
          y,
          autoAlpha: 0,
          duration: 0.7,
          ease: "power2.out",
          stagger,
          scrollTrigger: { trigger: el, start, once: true },
        })
      }, el)
      return () => ctx.revert()
    })
    return () => mm.revert()
  }, [y, stagger, start])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

"use client"

import { useEffect, useRef } from "react"

/**
 * A thin violet line along the top edge that fills as you read the
 * article body (not the comments or footer under it), so it reaches
 * the end when the writing does. Drawn with a transform on one
 * element, updated at most once a frame.
 */
export default function ReadingProgress({ targetId }: { targetId: string }) {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const target = document.getElementById(targetId)
    const bar = barRef.current
    if (!target || !bar) return

    let frame = 0
    const update = () => {
      frame = 0
      const rect = target.getBoundingClientRect()
      const total = rect.height - window.innerHeight * 0.6
      const read = -rect.top + window.innerHeight * 0.25
      const progress = total > 0 ? Math.min(1, Math.max(0, read / total)) : 1
      bar.style.transform = `scaleX(${progress})`
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
    }
  }, [targetId])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5"
    >
      <div
        ref={barRef}
        className="h-full origin-left scale-x-0 bg-primary"
      />
    </div>
  )
}

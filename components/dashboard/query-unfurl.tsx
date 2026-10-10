"use client"

import { useEffect, useRef, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

const CLAMPED_CLASS = "line-clamp-3"
const UNFURL_MS = 420
const UNFURL_EASING = "cubic-bezier(0.22, 1, 0.36, 1)"

/**
 * The search query rendered as the results heading. Long briefs clamp to
 * three lines under a fade — like the page continues below the fold — and
 * a pill unfurls them with a height animation.
 */
export default function QueryUnfurl({
  query,
  className,
}: {
  query: string
  className?: string
}) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const expandedRef = useRef(false)
  const [overflowing, setOverflowing] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    const el = headingRef.current
    if (!el) return
    const check = () => {
      // Only meaningful while clamped; a settled collapse re-triggers the
      // observer, so the flag re-evaluates then too.
      if (expandedRef.current) return
      setOverflowing(el.scrollHeight > el.clientHeight + 1)
    }
    check()
    const observer = new ResizeObserver(check)
    observer.observe(el)
    return () => observer.disconnect()
  }, [query])

  function toggle() {
    const el = headingRef.current
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (!el || reduce) {
      expandedRef.current = !expanded
      setExpanded(!expanded)
      return
    }
    const from = el.getBoundingClientRect().height
    const next = !expanded
    expandedRef.current = next
    setExpanded(next)
    setAnimating(true)
    requestAnimationFrame(() => {
      const to = next ? el.scrollHeight : el.clientHeight
      const animation = el.animate(
        [{ height: `${from}px` }, { height: `${to}px` }],
        { duration: UNFURL_MS, easing: UNFURL_EASING }
      )
      animation.onfinish = () => setAnimating(false)
      animation.oncancel = () => setAnimating(false)
    })
  }

  return (
    <div className="space-y-1">
      <h1
        ref={headingRef}
        className={cn(
          "relative overflow-hidden font-heading text-4xl font-semibold md:text-5xl",
          expanded ? "" : CLAMPED_CLASS,
          className
        )}
      >
        Results for &apos;
        <span className="text-primary">{query}</span>&apos;
        {overflowing && !expanded ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-background via-background/70 to-transparent"
          />
        ) : null}
      </h1>
      {overflowing || expanded ? (
        <button
          type="button"
          onClick={toggle}
          disabled={animating}
          aria-expanded={expanded}
          className="group inline-flex items-center gap-1.5 border px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/5 disabled:opacity-60"
        >
          {expanded ? "Fold the brief away" : "Read the whole brief"}
          <HugeiconsIcon
            icon={expanded ? ArrowUp01Icon : ArrowDown01Icon}
            strokeWidth={2}
            className="size-3.5 transition-transform duration-300 group-hover:translate-y-0.5"
          />
        </button>
      ) : null}
    </div>
  )
}

import type { ReactNode } from "react"
import { ArrowDown01Icon, ArrowUp01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "cn"

/**
 * A FAQ as native <details> rows, sharing one `name` so browsers that
 * support it keep a single row open at a time, like an accordion.
 *
 * This replaced the Radix accordion on the product page. Closed
 * accordion items are unmounted after hydration and empty in the
 * server HTML, so twenty of the twenty-one answers existed only in
 * the RSC payload and the FAQPage schema — a crawler reading the page
 * as HTML saw questions with no answers. <details> keeps every answer
 * in the markup while preserving the collapse, and it works without
 * JavaScript. The accordion's slide animation was already dead: the
 * data-open/closed keyframe classes had no keyframes to point at.
 */
export function FaqList({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn("flex w-full flex-col", className)}>{children}</div>
}

export function FaqItem({
  question,
  open = false,
  className,
  children,
}: {
  question: string
  /** The row shown expanded on first paint, before any interaction. */
  open?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <details name="faq" open={open} className="not-last:border-b">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-4 text-start text-lg font-semibold hover:underline sm:text-xl [&::-webkit-details-marker]:hidden">
        {/* A heading is allowed inside summary, so the questions keep
            their place in the outline instead of flattening into
            anonymous button text. */}
        <h3>{question}</h3>
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          strokeWidth={2}
          aria-hidden
          className="pointer-events-none size-3.5 shrink-0 [details[open]_&]:hidden"
        />
        <HugeiconsIcon
          icon={ArrowUp01Icon}
          strokeWidth={2}
          aria-hidden
          className="pointer-events-none hidden size-3.5 shrink-0 [details[open]_&]:block"
        />
      </summary>
      <div
        className={cn(
          "pb-4 text-base [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
          className
        )}
      >
        {children}
      </div>
    </details>
  )
}

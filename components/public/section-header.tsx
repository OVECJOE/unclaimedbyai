import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/**
 * The one way a public section introduces itself: a short label, a
 * serif title, and an optional lede. Every marketing page uses it, so the rhythm of
 * the site stays the same from the landing to the legal pages.
 */
export function SectionHeader({
  eyebrow,
  title,
  accent,
  lede,
  align = "center",
  as: Heading = "h2",
  className,
  children,
}: {
  eyebrow: string
  title: ReactNode
  accent?: ReactNode
  lede?: ReactNode
  align?: "center" | "start"
  as?: "h1" | "h2"
  className?: string
  children?: ReactNode
}) {
  const centered = align === "center"
  return (
    <div
      className={cn(
        "space-y-4",
        centered && "sm:text-center",
        className
      )}
    >
      <p
        data-field-avoid
        className={cn(
          "flex items-center gap-3 font-mono text-[0.6875rem] font-semibold tracking-[0.14em] text-primary uppercase",
          centered && "sm:justify-center"
        )}
      >
        {eyebrow}
      </p>
      <Heading
        data-field-avoid
        className={cn(
          "font-heading text-4xl leading-[1.05] tracking-tight text-balance sm:text-5xl md:text-6xl",
          centered && "sm:mx-auto sm:max-w-4xl"
        )}
      >
        {title}
        {accent ? (
          <>
            {" "}
            <span className="text-primary">{accent}</span>
          </>
        ) : null}
      </Heading>
      {lede ? (
        <p
          data-field-avoid
          className={cn(
            "max-w-2xl text-base text-pretty text-muted-foreground md:text-lg",
            centered && "sm:mx-auto"
          )}
        >
          {lede}
        </p>
      ) : null}
      {children}
    </div>
  )
}

/** A mono status tone, shared by every mock receipt on the site. */
export const TONE = {
  open: "text-green-700 dark:text-green-500",
  taken: "text-red-700 dark:text-red-500",
  warn: "text-amber-700 dark:text-amber-400",
  muted: "text-muted-foreground",
} as const

export type Tone = keyof typeof TONE

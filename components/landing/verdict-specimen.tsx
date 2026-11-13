"use client"

import { useEffect, useRef, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons"
import Link from "next/link"
import { fillPrompter } from "@/components/app/prompter"
import { TierBadge } from "@/components/tier-badge"
import { TONE } from "@/components/public/section-header"
import ReportRows from "@/components/landing/report-rows"
import { Button } from "@/components/ui/button"
import { EXAMPLE_SPECIMENS, type Row, type Specimen } from "@/lib/landing-reports"
import { cn } from "@/lib/utils"

const CYCLE_MS = 6500

function scoreTone(score: number): string {
  if (score >= 80) return TONE.open
  if (score >= 60) return "text-primary"
  if (score >= 40) return TONE.warn
  return TONE.taken
}

function Column({
  title,
  source,
  rows,
  offset,
}: {
  title: string
  source: string
  rows: Row[]
  offset: number
}) {
  return (
    <div className="flex flex-col gap-3 bg-background p-4 sm:p-5">
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-heading text-xl">{title}</p>
        <p className="font-mono text-[0.625rem] tracking-widest text-muted-foreground uppercase">
          {source}
        </p>
      </div>
      <ReportRows rows={rows} offset={offset} animate />
    </div>
  )
}

/**
 * The landing's centrepiece: reports you can flip through. Real public
 * checks when there are any, labelled examples when there are none. It
 * cycles by itself while on screen and stops the moment someone picks
 * a name.
 */
export default function VerdictSpecimen({
  specimens,
}: {
  /** Real checks from the API; empty means show the examples. */
  specimens: Specimen[]
}) {
  const real = specimens.length > 0
  const items = real ? specimens : EXAMPLE_SPECIMENS
  const [active, setActive] = useState(0)
  const [auto, setAuto] = useState(true)
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const specimen = items[active]

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.35 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!auto || !visible) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const id = window.setInterval(
      () => setActive((current) => (current + 1) % items.length),
      CYCLE_MS
    )
    return () => window.clearInterval(id)
  }, [auto, visible, items.length])

  return (
    <div
      ref={ref}
      className="overflow-hidden border border-border bg-border"
    >
      {/* Window bar */}
      <div className="flex items-center justify-between gap-3 border-b bg-sidebar px-4 py-2.5">
        <p className="truncate text-sm text-muted-foreground">
          {specimen.query ? (
            <>
              Found for: <span className="text-foreground">{specimen.query}</span>
            </>
          ) : (
            "Made-up examples, to show what a check tells you"
          )}
        </p>
        <p className="hidden shrink-0 font-mono text-[0.625rem] tracking-widest text-muted-foreground uppercase sm:block">
          {real ? "Real checks" : "Example"}
        </p>
      </div>

      <div className="grid gap-px md:grid-cols-[14rem_1fr]">
        {/* Picker */}
        <div
          role="tablist"
          aria-label={real ? "Recently checked names" : "Example names"}
          className="flex gap-px overflow-x-auto bg-border md:flex-col"
        >
          {items.map((item, index) => {
            const selected = index === active
            return (
              <button
                key={item.name}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls="specimen-panel"
                onClick={() => {
                  setAuto(false)
                  setActive(index)
                }}
                className={cn(
                  "relative flex min-w-36 flex-1 items-center justify-between gap-3 px-4 py-3 text-start transition-colors md:min-w-0 md:flex-none md:py-4",
                  selected
                    ? "bg-primary/5 text-foreground"
                    : "bg-background text-muted-foreground hover:bg-muted/50"
                )}
              >
                {selected ? (
                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-primary md:inset-y-0 md:right-auto md:left-0 md:h-auto md:w-0.5"
                  />
                ) : null}
                <span className="font-heading text-lg">{item.name}</span>
                <span
                  className={cn(
                    "font-mono text-sm tabular-nums",
                    scoreTone(item.score)
                  )}
                >
                  {item.score}
                </span>
                {selected && auto && visible ? (
                  <span
                    aria-hidden
                    key={`progress-${active}`}
                    className="absolute bottom-0 left-0 h-0.5 bg-primary/40 motion-safe:animate-[uba-progress_6.5s_linear_both] md:hidden"
                  />
                ) : null}
              </button>
            )
          })}
          <div aria-hidden className="hidden flex-1 bg-background md:block" />
        </div>

        {/* Report */}
        <div
          id="specimen-panel"
          role="tabpanel"
          aria-live="polite"
          className="relative flex flex-col gap-px bg-border"
        >
          <div
            key={`scan-${active}`}
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10 overflow-hidden motion-reduce:hidden"
          >
            <div className="scan-line absolute inset-y-0 w-1/2" />
          </div>

          <div className="flex flex-col gap-4 bg-background p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
            <div className="space-y-2">
              <TierBadge tier={specimen.tier} />
              <p
                key={specimen.name}
                className="row-in font-heading text-5xl leading-none sm:text-6xl"
              >
                {specimen.name}
              </p>
              <p className="text-muted-foreground">{specimen.verdict}</p>
            </div>
            <div className="flex items-baseline gap-1 sm:flex-col sm:items-end sm:gap-0">
              <p
                className={cn(
                  "font-heading text-6xl leading-none tabular-nums sm:text-7xl",
                  scoreTone(specimen.score)
                )}
              >
                {specimen.score}
              </p>
              <p className="font-mono text-xs text-muted-foreground">
                out of 100
              </p>
            </div>
          </div>

          <div key={specimen.name} className="grid gap-px lg:grid-cols-3">
            <Column
              title="Website addresses"
              source="Checked live"
              rows={specimen.domains}
              offset={0}
            />
            <Column
              title="Social usernames"
              source="5 platforms"
              rows={specimen.handles}
              offset={2}
            />
            <Column
              title="What chatbots say"
              source="3 asked"
              rows={specimen.ai}
              offset={4}
            />
          </div>

          <div className="flex flex-col gap-3 bg-sidebar p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-sm text-muted-foreground">
              {real
                ? "A real check someone ran. Yours shows the same three answers."
                : "Made-up example. Your own check shows real results."}
            </p>
            {specimen.href ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={specimen.href}>
                  See the full report
                  <HugeiconsIcon icon={ArrowUpRight01Icon} />
                </Link>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  fillPrompter({ value: specimen.name, mode: "name" })
                }
              >
                Check this name yourself
                <HugeiconsIcon icon={ArrowUpRight01Icon} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

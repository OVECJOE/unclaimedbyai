import type { Funnel } from "@/lib/ideas"
import { count } from "@/lib/ideas"
import { cn } from "@/lib/utils"

/**
 * The survival chart: every name starts in the top bar, and each check
 * takes some out. It reads left to right as "how many were still
 * standing", which is the question a visitor actually has, and the
 * last bar (violet) is the answer. Plain boxes sized by percentage, so
 * it costs no script and renders the same everywhere.
 */
export default function SurvivalFunnel({ funnel }: { funnel: Funnel }) {
  const { total, steps } = funnel
  const summary = steps
    .map((step) => `${step.label}: ${count(step.count)}`)
    .join(". ")

  return (
    <figure className="space-y-3">
      <ol aria-label={summary} className="space-y-2.5">
        {steps.map((step, index) => {
          const last = index === steps.length - 1
          const width = total ? Math.max((step.count / total) * 100, 3) : 3
          return (
            <li key={step.key} className="space-y-1">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span
                  className={cn(last ? "font-medium" : "text-muted-foreground")}
                >
                  {step.label}
                </span>
                <span className="font-heading text-2xl leading-none tabular-nums">
                  {step.count}
                </span>
              </div>
              <div className="h-5 bg-muted">
                <div
                  className={cn(
                    "h-full",
                    last ? "bg-primary" : "bg-foreground/20"
                  )}
                  style={{ width: `${width}%` }}
                />
              </div>
              {step.lost > 0 ? (
                <p className="text-xs text-muted-foreground">
                  {step.lost} lost here
                </p>
              ) : null}
            </li>
          )
        })}
      </ol>
      <figcaption className="text-xs text-muted-foreground">
        A name moves down only if it passes the check above it.
      </figcaption>
    </figure>
  )
}

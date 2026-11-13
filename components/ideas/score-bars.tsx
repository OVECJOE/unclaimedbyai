import type { NameFacts } from "@/lib/ideas"
import { cn } from "@/lib/utils"

const FILL: Record<string, string> = {
  Excellent: "bg-green-600",
  Good: "bg-lime-700",
  Okay: "bg-yellow-500",
  Poor: "bg-red-600",
}

/**
 * Every name's overall score on one scale, best first. A violet ring
 * marks the ones that cleared every check, because a high score and a
 * clean sweep are not always the same thing and the chart should show
 * when they differ.
 */
export default function ScoreBars({ facts }: { facts: NameFacts[] }) {
  return (
    <figure className="space-y-3">
      <ol className="space-y-2">
        {facts.map((entry) => {
          const clean = entry.failures.length === 0
          return (
            <li
              key={entry.name.id}
              className="grid grid-cols-[minmax(5rem,9rem)_1fr_2.25rem] items-center gap-3 text-sm"
            >
              <span className="truncate font-medium" title={entry.name.name}>
                {entry.name.name}
              </span>
              <span className="h-4 bg-muted">
                <span
                  className={cn(
                    "block h-full",
                    FILL[entry.name.tier] ?? "bg-foreground/30",
                    clean && "outline-2 outline-offset-2 outline-primary"
                  )}
                  style={{ width: `${Math.max(entry.name.score, 2)}%` }}
                />
              </span>
              <span className="text-right tabular-nums">
                {entry.name.score}
              </span>
            </li>
          )
        })}
      </ol>
      <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 outline-2 outline-primary" /> Cleared every
          check
        </span>
        <span>Score out of 100</span>
      </figcaption>
    </figure>
  )
}

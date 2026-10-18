import { TierBadge, type Tier } from "@/components/tier-badge"
import CopyPermalink from "@/components/public/copy-permalink"
import { cn } from "@/lib/utils"

export type LeaderboardCheck = {
  overall_score: number
  overall_risk_level: string
  judgment?: string
  pillars?: {
    pillar_type: string
    score: number
    verdict: string
    items_checked: number
    items_passed: number
  }[]
}

export type LeaderboardEntry = {
  id: number | string
  name: string
  about: string | null
  check: LeaderboardCheck
}

function toTier(level: string): Tier {
  const mapped = level.charAt(0).toUpperCase() + level.slice(1)
  return (["Excellent", "Good", "Okay", "Poor"] as const).includes(
    mapped as Tier
  )
    ? (mapped as Tier)
    : "Okay"
}

const AI_VERDICT_LABEL: Record<string, string> = {
  excellent: "AI clean",
  good: "AI light overlap",
  okay: "AI overlap",
  poor: "AI collision",
}

export default function ReportLeaderboard({
  entries,
  uncheckedNames = [],
  highlight,
}: {
  entries: LeaderboardEntry[]
  uncheckedNames?: string[]
  highlight?: string
}) {
  return (
    <div className="space-y-6">
      {entries.length > 0 ? (
        <>
          <div className="space-y-1">
            <h2 className="font-heading text-2xl font-semibold md:text-3xl">
              The names, ranked
            </h2>
            <p className="text-sm text-muted-foreground">
              Safest to build on first. Each row shows the score, the verdict
              behind it, and what the three checks found.
            </p>
          </div>
          <ol className="divide-y divide-border border">
            {entries.map((entry, index) => {
              const pillars = Object.fromEntries(
                (entry.check.pillars ?? []).map((pillar) => [
                  pillar.pillar_type,
                  pillar,
                ])
              )
              const domains = pillars.domain
              const handles = pillars.social
              const ai = pillars.ai_association
              return (
                <li
                  key={entry.id}
                  className={cn(
                    "flex items-center gap-4 p-4 sm:p-5",
                    highlight &&
                      entry.name.toLowerCase() === highlight.toLowerCase() &&
                      "bg-primary/5 ring-1 ring-primary/40 ring-inset"
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="w-6 shrink-0 text-end font-mono text-sm text-muted-foreground tabular-nums"
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <span className="flex flex-wrap items-center gap-2">
                      <h3 className="font-heading text-xl">{entry.name}</h3>
                      <TierBadge
                        tier={toTier(entry.check.overall_risk_level)}
                      />
                    </span>
                    {entry.check.judgment ? (
                      <p className="max-w-prose text-sm text-muted-foreground">
                        {entry.check.judgment}
                      </p>
                    ) : null}
                    {entry.about ? (
                      <p className="max-w-prose text-sm text-muted-foreground italic">
                        {entry.about}
                      </p>
                    ) : null}
                    <span className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-0.5 text-xs text-muted-foreground">
                      {domains ? (
                        <span>
                          <span className="font-medium text-foreground tabular-nums">
                            {domains.items_passed}/{domains.items_checked}
                          </span>{" "}
                          domains free
                        </span>
                      ) : null}
                      {handles ? (
                        <span>
                          <span className="font-medium text-foreground tabular-nums">
                            {handles.items_passed}/{handles.items_checked}
                          </span>{" "}
                          handles open
                        </span>
                      ) : null}
                      {ai ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className={cn(
                              "size-1.5 rounded-full",
                              ai.verdict === "excellent"
                                ? "bg-green-600"
                                : ai.verdict === "good"
                                  ? "bg-primary"
                                  : ai.verdict === "okay"
                                    ? "bg-amber-500"
                                    : "bg-red-600"
                            )}
                          />
                          {AI_VERDICT_LABEL[ai.verdict] ?? "AI checked"}
                        </span>
                      ) : null}
                    </span>
                  </div>
                  <div className="shrink-0 space-y-2 text-end">
                    <p className="font-heading text-3xl leading-none font-semibold tabular-nums">
                      {entry.check.overall_score}
                    </p>
                    <p className="text-xs text-muted-foreground">/100</p>
                    <CopyPermalink name={entry.name} />
                  </div>
                </li>
              )
            })}
          </ol>
        </>
      ) : null}

      {uncheckedNames.length > 0 ? (
        <p className="text-sm text-muted-foreground">
          Also generated but not checked yet:{" "}
          {uncheckedNames.map((name, index) => (
            <span key={name}>
              {index > 0 ? ", " : ""}
              {name}
            </span>
          ))}
          .
        </p>
      ) : null}
    </div>
  )
}

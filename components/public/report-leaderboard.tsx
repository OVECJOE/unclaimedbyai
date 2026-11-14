import { TierBadge, type Tier } from "@/components/tier-badge"
import CopyPermalink from "@/components/public/copy-permalink"
import Link from "next/link"
import { ScoreGauge } from "@/components/app/score-gauge"
import { cn, nameToSlug } from "@/lib/utils"

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

function ratio(pillar?: { items_passed: number; items_checked: number }) {
  return pillar && pillar.items_checked > 0
    ? pillar.items_passed / pillar.items_checked
    : null
}

/** A short labelled bar: how much of one check came out well. */
function Meter({
  label,
  value,
  note,
}: {
  label: string
  value: number | null
  note: string
}) {
  return (
    <div className="min-w-0 space-y-1.5">
      <dt className="text-[0.625rem] font-semibold tracking-widest text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="space-y-1">
        <span className="block h-1 overflow-hidden bg-border">
          <span
            className="block h-full origin-left bg-primary transition-transform duration-700 ease-out"
            style={{ transform: `scaleX(${value ?? 0})` }}
          />
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {note}
        </span>
      </dd>
    </div>
  )
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
          <ol className="grid gap-3">
            {entries.map((entry, index) => {
              const pillars = Object.fromEntries(
                (entry.check.pillars ?? []).map((pillar) => [
                  pillar.pillar_type,
                  pillar,
                ])
              )
              const tier = toTier(entry.check.overall_risk_level)
              const mine =
                highlight &&
                entry.name.toLowerCase() === highlight.toLowerCase()
              return (
                <li
                  key={entry.id}
                  data-tier={tier.toLowerCase()}
                  className={cn(
                    "card-skip group relative isolate overflow-hidden border bg-card transition-colors hover:border-primary/60",
                    mine &&
                      "border-primary/50 ring-1 ring-primary/30 ring-inset"
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn("card-aura", index === 0 && "card-aura-lead")}
                  />
                  <span aria-hidden="true" className="card-sheen" />
                  <div className="grid items-center gap-5 p-5 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-7 sm:p-7">
                    <p
                      aria-hidden="true"
                      className="hidden font-heading text-5xl leading-none text-muted-foreground/40 tabular-nums sm:block"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <div className="min-w-0 space-y-4">
                      <div className="space-y-2">
                        <span className="flex flex-wrap items-center gap-3">
                          <h3 className="font-heading text-3xl leading-none md:text-4xl">
                            {entry.name}
                          </h3>
                          <TierBadge tier={tier} />
                        </span>
                        {entry.check.judgment ? (
                          <p className="max-w-prose text-pretty text-muted-foreground">
                            {entry.check.judgment}
                          </p>
                        ) : null}
                        {entry.about ? (
                          <p className="line-clamp-2 max-w-prose text-sm text-muted-foreground/80 italic">
                            {entry.about}
                          </p>
                        ) : null}
                      </div>
                      <dl className="grid max-w-xl grid-cols-3 gap-4">
                        <Meter
                          label="Domains"
                          value={ratio(pillars.domain)}
                          note={
                            pillars.domain
                              ? `${pillars.domain.items_passed}/${pillars.domain.items_checked} free`
                              : "n/a"
                          }
                        />
                        <Meter
                          label="Usernames"
                          value={ratio(pillars.social)}
                          note={
                            pillars.social
                              ? `${pillars.social.items_passed}/${pillars.social.items_checked} open`
                              : "n/a"
                          }
                        />
                        <Meter
                          label="Chatbots"
                          value={
                            pillars.ai_association
                              ? pillars.ai_association.score / 100
                              : null
                          }
                          note={
                            pillars.ai_association
                              ? (AI_VERDICT_LABEL[
                                  pillars.ai_association.verdict
                                ] ?? "checked")
                              : "n/a"
                          }
                        />
                      </dl>
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                      <ScoreGauge
                        score={entry.check.overall_score}
                        tier={tier}
                        size={88}
                      />
                      <span className="flex items-center gap-1">
                        <Link
                          href={`/check/${nameToSlug(entry.name)}`}
                          className="px-2 py-1.5 text-xs font-semibold tracking-widest text-primary uppercase hover:underline"
                        >
                          Open
                        </Link>
                        <CopyPermalink name={entry.name} />
                      </span>
                    </div>
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

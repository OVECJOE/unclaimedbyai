import { ScoreGauge } from "@/components/app/score-gauge"
import { TierBadge, type Tier } from "@/components/tier-badge"
import type { CheckReport as Report } from "@/lib/api"

function toTier(level: Report["overall_risk_level"]): Tier {
  return (level.charAt(0).toUpperCase() + level.slice(1)) as Tier
}

const STATUS_TONE: Record<string, string> = {
  available: "text-green-600 dark:text-green-400",
  taken: "text-red-600 dark:text-red-400",
  unknown: "text-muted-foreground",
  error: "text-yellow-600 dark:text-yellow-400",
  rate_limited: "text-yellow-600 dark:text-yellow-400",
}

export default function CheckReport({ report }: { report: Report }) {
  return (
    <div className="space-y-6 border p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-4">
        <ScoreGauge
          score={report.overall_score}
          tier={toTier(report.overall_risk_level)}
        />
        <div className="space-y-1">
          <TierBadge tier={toTier(report.overall_risk_level)} />
          <p className="max-w-prose text-sm text-muted-foreground">
            {report.judgment}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {report.pillars.map((pillar) => (
          <div key={pillar.pillar_type} className="border p-3">
            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              {pillar.pillar_type.replace("_", " ")}
            </p>
            <p className="font-heading text-2xl">
              {pillar.score}
              <span className="text-sm text-muted-foreground">/100</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {pillar.items_passed}/{pillar.items_checked} clear
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <h4 className="font-heading text-lg">Domains</h4>
        <ul className="divide-y divide-border border-y">
          {report.domains.map((domain) => (
            <li
              key={domain.domain}
              className="flex items-center justify-between gap-2 py-2 text-sm"
            >
              <span className="font-mono">{domain.domain}</span>
              <span
                className={
                  STATUS_TONE[domain.status] ?? "text-muted-foreground"
                }
              >
                {domain.status.replace("_", " ")}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-2">
        <h4 className="font-heading text-lg">Handles</h4>
        <ul className="divide-y divide-border border-y">
          {report.socials.map((social) => (
            <li
              key={social.platform}
              className="flex items-center justify-between gap-2 py-2 text-sm"
            >
              <span>
                {social.platform}{" "}
                <span className="text-muted-foreground">@{social.handle}</span>
              </span>
              <span
                className={
                  STATUS_TONE[social.status] ?? "text-muted-foreground"
                }
              >
                {social.status.replace("_", " ")}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-2">
        <h4 className="font-heading text-lg">AI associations</h4>
        <ul className="space-y-2">
          {report.ai.map((row, index) => (
            <li
              key={`${row.model ?? "unknown"}-${index}`}
              className="border p-3 text-sm"
            >
              <p className="font-mono text-xs text-muted-foreground">
                {row.model ?? "unknown model"}
              </p>
              {row.error ? (
                <p className="text-yellow-600 dark:text-yellow-400">
                  Check failed: {row.error}
                </p>
              ) : (
                <>
                  <p>{row.association ?? "No strong association"}</p>
                  {typeof row.collision_confidence === "number" ? (
                    <p className="text-xs text-muted-foreground">
                      Collision confidence: {row.collision_confidence}/100
                    </p>
                  ) : null}
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

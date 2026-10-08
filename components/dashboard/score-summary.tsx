import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { HugeiconsIcon } from "@hugeicons/react"
import { BrandfetchIcon } from "@hugeicons/core-free-icons"
import type { NameResult } from "@/lib/constants"
import type { SearchSummaryPayload } from "@/lib/api"
import { summarizeResults, tierForScore } from "@/lib/name-results"
import { TierBadge } from "@/components/tier-badge"
import { diceLogo } from "@/lib/dashboard-data"

type ScoreSummaryProps = {
  results?: NameResult[]
  topPick?: { name: string; logo: string }
  summary?: SearchSummaryPayload
}

export default function ScoreSummary({
  results = [],
  topPick,
  summary,
}: ScoreSummaryProps) {
  const computed = summarizeResults(results)
  const total = summary?.total ?? computed.total
  const passCount = summary?.pass_count ?? computed.passCount
  const passRate = summary?.pass_rate ?? computed.passRate
  const overall = summary?.overall ?? computed.overall
  const summaryTopPick = summary?.top_pick
    ? {
        name: summary.top_pick.name,
        logo: diceLogo(summary.top_pick.name),
      }
    : undefined
  const effectiveTopPick = summaryTopPick ?? topPick
  const scoreColor =
    overall >= 80
      ? "text-green-600"
      : overall >= 60
        ? "text-yellow-600"
        : "text-red-600"
  const topPickResult = effectiveTopPick
    ? results.find(
        (result) =>
          result.name.toLowerCase() === effectiveTopPick.name.toLowerCase()
      )
    : undefined

  return (
    <Card className="min-w-0 flex-1 self-start">
      <CardHeader>
        <CardTitle>Score summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div className="flex items-end gap-3">
            <div>
              <p className="text-xs tracking-wider text-muted-foreground uppercase">
                Overall score
              </p>
              <p
                className={`mt-1 font-heading text-4xl leading-none font-semibold ${scoreColor}`}
              >
                {overall}
                <span className="text-base font-normal text-muted-foreground">
                  /100
                </span>
              </p>
            </div>
            <div className="mb-1">
              <TierBadge tier={tierForScore(overall)} />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {passCount} of {total} pass
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Good or better</span>
            <span className="font-medium tabular-nums">{passRate}%</span>
          </div>
          <div className="h-1.5 w-full bg-muted">
            <div
              className="h-full bg-green-500"
              style={{ width: `${passRate}%` }}
            />
          </div>
        </div>

        {effectiveTopPick && (
          <div className="flex items-center gap-3 border border-border bg-muted/50 p-3">
            <Avatar size="sm">
              <AvatarImage
                src={effectiveTopPick.logo}
                alt={effectiveTopPick.name}
              />
              <AvatarFallback>
                <HugeiconsIcon icon={BrandfetchIcon} className="size-4" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {effectiveTopPick.name}
              </p>
              <p className="text-xs text-muted-foreground">Top pick</p>
            </div>
            {topPickResult && (
              <div className="ml-auto">
                <TierBadge tier={topPickResult.tier} />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

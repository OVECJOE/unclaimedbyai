import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { HugeiconsIcon } from "@hugeicons/react"
import { BrandfetchIcon } from "@hugeicons/core-free-icons"
import type { NameResult } from "@/lib/constants"
import { summarizeResults } from "@/lib/name-results"

type ScoreSummaryProps = {
  results: NameResult[]
  topPick?: { name: string; logo: string }
}

export default function ScoreSummary({ results, topPick }: ScoreSummaryProps) {
  const { total, passCount, passRate, overall } = summarizeResults(results)
  const scoreColor =
    overall >= 80 ? "text-green-600" : overall >= 60 ? "text-yellow-600" : "text-red-600"

  return (
    <Card className="min-w-0 flex-1 self-start">
      <CardHeader>
        <CardTitle>Score summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Overall score
            </p>
            <p className={`mt-1 font-heading text-4xl font-semibold leading-none ${scoreColor}`}>
              {overall}
              <span className="text-base font-normal text-muted-foreground">/100</span>
            </p>
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

        {topPick && (
          <div className="flex items-center gap-3 border border-border bg-muted/50 p-3">
            <Avatar size="sm">
              <AvatarImage src={topPick.logo} alt={topPick.name} />
              <AvatarFallback>
                <HugeiconsIcon icon={BrandfetchIcon} className="size-4" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{topPick.name}</p>
              <p className="text-xs text-muted-foreground">Top pick</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
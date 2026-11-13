import Link from "next/link"
import { TierBadge } from "@/components/tier-badge"
import type { CheckedNameItem } from "@/lib/api"
import { formatDateTime } from "@/lib/utils"

/**
 * The names you checked most recently, newest first, each linking to
 * its report. Single-name checks never appear in search history, so
 * without this they had nowhere to be found from the home page.
 */
export default function RecentChecks({ items }: { items: CheckedNameItem[] }) {
  if (!items.length) {
    return (
      <div className="border border-dashed p-5 text-sm text-muted-foreground">
        Names you check show up here. Switch the box to{" "}
        <span className="font-semibold text-foreground">Name</span> and try
        one.
      </div>
    )
  }

  return (
    <ul className="divide-y border">
      {items.map((item) => (
        <li key={item.name_id}>
          <Link
            href={`/dashboard/history/${item.search_id}/results/${encodeURIComponent(item.name)}`}
            className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
          >
            <span className="min-w-0">
              <span className="block truncate font-heading text-lg font-semibold">
                {item.name}
              </span>
              <span className="block text-xs text-muted-foreground">
                {item.checked_at ? formatDateTime(item.checked_at) : "Not checked yet"}
                {item.watch_id ? " · On your watchlist" : ""}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-2">
              {item.score !== null ? (
                <span className="text-xs text-muted-foreground">
                  {item.score}/100
                </span>
              ) : null}
              {item.tier ? <TierBadge tier={item.tier} /> : null}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

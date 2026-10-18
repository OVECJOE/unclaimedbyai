import Link from "next/link"
import type { MeStats } from "@/lib/api"

function StatCard({
  label,
  value,
  note,
  href,
}: {
  label: string
  value: string
  note: string
  href?: string
}) {
  const body = (
    <>
      <p className="text-[0.625rem] font-semibold tracking-widest text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-2 font-heading text-4xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
    </>
  )
  if (href) {
    return (
      <Link
        href={href}
        className="block border p-5 transition-colors hover:border-primary/50"
      >
        {body}
      </Link>
    )
  }
  return <div className="border p-5">{body}</div>
}

/**
 * The five numbers the home page leads with. Each card is a link to
 * where the number is acted on, because a stat that cannot be acted on
 * is decoration.
 *
 * Columns step 2, 3, 5 across the breakpoints: the dashboard's 240px
 * rail eats the left of every viewport above md, so three cards wait
 * until lg has the room and five wait until xl, which keeps every note
 * readable instead of wrapping one word per line.
 */
export default function StatsRow({ stats }: { stats: MeStats }) {
  return (
    <div
      data-tour="stats"
      className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-5"
    >
      <StatCard
        label="Searches"
        value={`${stats.searches_used}/${stats.searches_limit}`}
        note="This month. Resets on the first."
        href="/dashboard/history"
      />
      <StatCard
        label="Sandboxes"
        value={String(stats.sandboxes)}
        note="Idea collections you hold."
        href="/dashboard/playground/sandboxes"
      />
      <StatCard
        label="Ideas"
        value={String(stats.ideas)}
        note="Generated or written by hand."
        href="/dashboard/playground"
      />
      <StatCard
        label="Checks"
        value={String(stats.checks)}
        note="Name checks run this month."
        href="/dashboard/history"
      />
      <StatCard
        label="Credits"
        value={String(stats.credits)}
        note="Spend on research, searches, re-checks."
        href="/dashboard/billing"
      />
    </div>
  )
}

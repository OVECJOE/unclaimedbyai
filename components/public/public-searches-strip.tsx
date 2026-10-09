import Link from "next/link"
import { TierBadge } from "@/components/tier-badge"
import type { GradeTier } from "@/lib/name-results"
import { formatDateTime } from "@/lib/utils"

type PublicSearch = {
  query: string
  top_name: string
  top_score: number
  top_tier: string
  created_at: string
}

function toTier(level: string): GradeTier {
  const tier = level.charAt(0).toUpperCase() + level.slice(1)
  return (["Excellent", "Good", "Okay", "Poor"] as const).includes(
    tier as GradeTier
  )
    ? (tier as GradeTier)
    : "Okay"
}

async function loadPublicSearches(): Promise<PublicSearch[]> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8007"
    const res = await fetch(`${base}/api/v1/searches/public-top?limit=5`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const data = (await res.json()) as { items: PublicSearch[] }
    return data.items
  } catch {
    return []
  }
}

export default async function PublicSearchesStrip() {
  const items = await loadPublicSearches()
  if (!items.length) return null

  return (
    <section className="border-b px-4 py-10">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-heading text-2xl font-semibold md:text-3xl">
            Fresh from the wild
          </h2>
          <p className="text-sm text-muted-foreground">
            Anonymous checks people ran before signing up
          </p>
        </div>
        <ul className="grid grid-cols-1 gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-5">
          {items.map((item) => (
            <li key={`${item.query}-${item.top_name}`}>
              <Link
                href={`/searches/${encodeURIComponent(item.top_name)}`}
                className="flex h-full flex-col gap-2 bg-background p-4 transition-colors hover:bg-muted/50"
                aria-label={`See check results for ${item.top_name}, found for "${item.query}"`}
              >
                <p className="line-clamp-2 text-xs text-muted-foreground italic">
                  &ldquo;{item.query}&rdquo;
                </p>
                <p className="font-medium text-primary">{item.top_name}</p>
                <div className="mt-auto flex items-center justify-between gap-2">
                  <TierBadge tier={toTier(item.top_tier)} />
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {item.top_score}/100
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {formatDateTime(item.created_at)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

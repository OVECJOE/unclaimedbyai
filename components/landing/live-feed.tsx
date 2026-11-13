import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons"
import { TierBadge } from "@/components/tier-badge"
import { SectionHeader } from "@/components/public/section-header"
import { formatDateTime, nameToSlug } from "@/lib/utils"

type PublicSearch = {
  query: string
  top_name: string
  top_score: number
  top_tier: string
  created_at: string
}

async function loadPublicSearches(): Promise<PublicSearch[]> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8007"
    const res = await fetch(`${base}/api/v1/searches/public-top?limit=6`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const data = (await res.json()) as { items: PublicSearch[] }
    return data.items
  } catch {
    return []
  }
}

/**
 * Real searches people ran, newest first: social proof that is also a
 * door into the public reports. Renders nothing when the API is quiet,
 * because an empty feed argues against the product.
 */
export default async function LiveFeed() {
  const items = await loadPublicSearches()
  if (!items.length) return null

  return (
    <section className="border-b px-4 py-20 md:py-24">
      <div className="mx-auto max-w-7xl space-y-10">
        <SectionHeader
          align="start"
          eyebrow="Fresh from the wild"
          title="Real briefs."
          accent="Real verdicts."
          lede="Searches people ran this week, with the strongest name each one found. Every row opens its public report."
        />

        <ul className="divide-y border-y">
          {items.map((item) => (
            <li key={`${item.query}-${item.top_name}`}>
              <Link
                href={`/searches/${nameToSlug(item.top_name)}`}
                aria-label={`See check results for ${item.top_name}, found for "${item.query}"`}
                className="group grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-1 py-5 transition-colors hover:bg-muted/40 sm:grid-cols-[1.4fr_1fr_auto_auto] sm:px-3"
              >
                <p className="col-span-2 line-clamp-1 text-sm text-muted-foreground italic sm:col-span-1">
                  &ldquo;{item.query}&rdquo;
                </p>
                <p className="font-heading text-2xl transition-colors group-hover:text-primary">
                  {item.top_name}
                </p>
                <div className="flex items-center gap-3">
                  <TierBadge tier={item.top_tier} />
                  <span className="font-mono text-sm tabular-nums">
                    {item.top_score}
                    <span className="text-muted-foreground">/100</span>
                  </span>
                </div>
                <span className="hidden items-center gap-2 font-mono text-xs text-muted-foreground sm:flex">
                  {formatDateTime(item.created_at)}
                  <HugeiconsIcon
                    icon={ArrowUpRight01Icon}
                    className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

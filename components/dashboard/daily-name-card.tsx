"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { getPublicSearchStrip, type PublicSearchStripItem } from "@/lib/api"
import { TierBadge } from "@/components/tier-badge"

function hashSeed(seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i)
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)
  }
  return h >>> 0
}

function pickDaily(items: PublicSearchStripItem[], seed: string): PublicSearchStripItem | null {
  if (items.length === 0) return null
  const candidates = items.filter((item) => item.top_score >= 60)
  const pool = candidates.length > 0 ? candidates : items
  return pool[hashSeed(seed) % pool.length]
}

/**
 * A name that already cleared the same screening as any search on the
 * site — picked deterministically per visitor per calendar day from
 * the public strip. No generation cost, no AI call; it's a window into
 * what the product actually returns, and a gentle nudge to try one of
 * your own.
 */
export default function DailyNameCard({ userKey }: { userKey: string }) {
  const [items, setItems] = useState<PublicSearchStripItem[] | null>(null)
  const today = useMemo(() => {
    const d = new Date()
    return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`
  }, [])
  const picked = useMemo(
    () => (items ? pickDaily(items, `${today}:${userKey}`) : null),
    [items, today, userKey]
  )

  useEffect(() => {
    let cancelled = false
    getPublicSearchStrip(10)
      .then((res) => {
        if (!cancelled) setItems(res.items)
      })
      .catch(() => {
        if (!cancelled) setItems([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (items === null || !picked) return null

  return (
    <div className="border p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[0.625rem] font-semibold tracking-widest text-primary uppercase">
          Daily name
        </p>
        <p className="text-xs text-muted-foreground">{today}</p>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <p className="font-heading text-2xl font-semibold">{picked.top_name}</p>
        <TierBadge tier={picked.top_tier} />
        <span className="text-xs text-muted-foreground">
          {picked.top_score}/100
        </span>
      </div>
      <p className="mt-1 max-w-prose text-sm text-muted-foreground">
        From a brief: {picked.query}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Link href="/check" className="text-sm text-primary underline">
          Check any name for free
        </Link>
        <Link href="/" className="text-sm text-muted-foreground underline">
          Run your own search
        </Link>
      </div>
    </div>
  )
}

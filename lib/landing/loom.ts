import "server-only"

/**
 * Data for the hero loom. The ticker strip is the honest half: real
 * anonymous searches from the public feed, with their real queries and
 * timestamps. The scanning theatre itself (candidate chips, their
 * receipts, their ghosts) is seeded demo copy — a dramatization of what
 * a check looks like, never a claim about a specific real name.
 */

export type LoomTickerItem = {
  query: string
  topName: string
  secondsAgo: number
}

const SEED_TICKER: LoomTickerItem[] = [
  {
    query: "meal kit delivery for new dads",
    topName: "Forkling",
    secondsAgo: 42,
  },
  {
    query: "AI lawyer for small claims",
    topName: "Pleadwise",
    secondsAgo: 240,
  },
  {
    query: "sock subscription with funny patterns",
    topName: "Toepoke",
    secondsAgo: 610,
  },
  {
    query: "budgeting app for freelancers",
    topName: "Duedate",
    secondsAgo: 1450,
  },
  {
    query: "bike repair that comes to you",
    topName: "Spokeo",
    secondsAgo: 3200,
  },
]

function secondsSince(iso: string): number {
  const at = Date.parse(iso)
  if (Number.isNaN(at)) return 60
  return Math.max(1, Math.round((Date.now() - at) / 1000))
}

export async function getLoomTicker(): Promise<LoomTickerItem[]> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8007"
    const res = await fetch(`${base}/api/v1/searches/public-top?limit=5`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return SEED_TICKER
    const data = (await res.json()) as {
      items: { query: string; top_name: string; created_at: string }[]
    }
    if (!data.items?.length) return SEED_TICKER
    return data.items.map((item) => ({
      query: item.query,
      topName: item.top_name,
      secondsAgo: secondsSince(item.created_at),
    }))
  } catch {
    return SEED_TICKER
  }
}

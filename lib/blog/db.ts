import "server-only"
import { neon, neonConfig } from "@neondatabase/serverless"
import { fetchWithRetry } from "./fetch-retry"

// The driver makes exactly one fetch per query batch, so any transient
// network blip (Neon compute wake-up, pooler reset, DNS hiccup) surfaces
// as `NeonDbError: Error connecting to database: TypeError: fetch failed`
// and crashes the page. Retrying at the fetch layer lets every query —
// reads, writes, transactions — self-heal instead of failing the
// navigation that triggered it.
neonConfig.fetchFunction = fetchWithRetry

let client: ReturnType<typeof neon> | undefined

export function getSql() {
  if (!client) {
    const url = process.env.BLOG_DATABASE_URL
    if (!url) throw new Error("BLOG_DATABASE_URL is not set")
    client = neon(url)
  }
  return client
}

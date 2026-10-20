import "server-only"
import type { WildChip, WildStage } from "./wild-format"

/**
 * Data for the hero's "Live from the wild" loom. It reads the same
 * public feed the Fresh from the wild strip does, takes the most recent
 * search, and pulls every name under it, then each name's real check
 * report. The scanning theatre is therefore honest: a name is haunted
 * because a model actually associates it with something, and clean when
 * nothing does. Every fetch is cached for an hour, and the whole thing
 * degrades to a seeded dramatization when the backend is quiet, so the
 * hero is never empty and never blocks the page.
 */

type RawReport = {
  domains: { tld: string; status: string }[]
  socials: { platform: string; status: string }[]
  ai: { model: string | null; association: string | null }[]
}

type RawCheckedName = {
  name: string
  latest_check: {
    public_id: string
    overall_score: number
    overall_risk_level: "excellent" | "good" | "okay" | "poor"
  } | null
}

type RawDetail = { names: RawCheckedName[] }

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8007"
const HOUR = { next: { revalidate: 3600 } } as const

const SEED_QUERY = "a budgeting app for freelancers"

/** A dramatized fallback for when the backend is quiet (local dev,
 *  cold start). Never shown in prod while real searches exist. */
const SEED: WildStage = {
  query: SEED_QUERY,
  secondsAgo: 96,
  chips: [
    seed("Fernport", 71, "ChatGPT already links this to a 2021 crypto wallet."),
    seed("Quibbl", 88, null),
    seed(
      "Snackwyse",
      66,
      "Perplexity cites it in 4,112 answers about sourdough."
    ),
    seed("Marrowly", 91, null),
    seed("Blimpnote", 58, "Every model ties it to a 2018 TikTok dance."),
    seed("Pastelio", 84, null),
  ],
}

function seed(name: string, score: number, ghost: string | null): WildChip {
  return {
    name,
    query: SEED_QUERY,
    score,
    tier: score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Okay",
    aiLevel: ghost ? "High" : "Low",
    ghost,
    domains: [
      { tld: "com", available: true },
      { tld: "io", available: true },
      { tld: "co", available: false },
    ],
    socials: ["x", "github", "instagram", "tiktok", "youtube"].map((p) => ({
      platform: p,
      available: p !== "github",
    })),
  }
}

function capitalize(value: string): WildChip["tier"] {
  const c = value.charAt(0).toUpperCase() + value.slice(1)
  return (["Excellent", "Good", "Okay", "Poor"] as const).includes(
    c as WildChip["tier"]
  )
    ? (c as WildChip["tier"])
    : "Okay"
}

function secondsSince(iso: string): number {
  const at = Date.parse(iso)
  if (Number.isNaN(at)) return 60
  return Math.max(1, Math.round((Date.now() - at) / 1000))
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      ...HOUR,
      // The loom streams in behind a Suspense boundary, so a hung
      // request must not hold the hero skeleton forever. A slow or
      // moved server degrades to the seed instead of an empty frame.
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

function buildChip(
  raw: RawCheckedName,
  query: string,
  report: RawReport | null
): WildChip {
  const check = raw.latest_check!
  const collisions = report?.ai.filter((a) => a.association) ?? []
  const first = collisions[0]
  return {
    name: raw.name,
    query,
    score: check.overall_score,
    tier: capitalize(check.overall_risk_level),
    aiLevel:
      collisions.length >= 2
        ? "Very High"
        : collisions.length === 1
          ? "High"
          : "Low",
    ghost: first
      ? `${first.model ?? "A model"} already links this to “${first.association}”.`
      : null,
    domains: (report?.domains ?? []).map((d) => ({
      tld: d.tld,
      available: d.status === "available",
    })),
    socials: (report?.socials ?? []).map((s) => ({
      platform: s.platform,
      available: s.status === "available",
    })),
  }
}

export async function getWildStage(): Promise<WildStage> {
  try {
    const top = await fetchJson<{
      items: { query: string; created_at: string }[]
    }>(`${API}/api/v1/searches/public-top?limit=5`)
    const last = top?.items?.[top.items.length - 1]
    if (!last) return SEED

    const detail = await fetchJson<RawDetail>(
      `${API}/api/v1/searches/by-query?q=${encodeURIComponent(last.query)}`
    )
    const checked = (detail?.names ?? [])
      .filter((n) => n.latest_check?.public_id)
      .slice(0, 6)
    // No scannable names: fall back to the dramatization rather than an
    // empty frame, so the hero always has a field to show.
    if (!checked.length) return SEED

    const reports = await Promise.all(
      checked.map((n) =>
        fetchJson<RawReport>(
          `${API}/api/v1/reports/${n.latest_check!.public_id}`
        )
      )
    )

    const chips = checked.map((n, i) => buildChip(n, last.query, reports[i]))
    return {
      query: last.query,
      secondsAgo: secondsSince(last.created_at),
      chips: chips.length
        ? chips
        : SEED.chips.map((c) => ({ ...c, query: last.query })),
    }
  } catch {
    // Any surprise upstream degrades to the seed, never to a broken hero.
    return SEED
  }
}

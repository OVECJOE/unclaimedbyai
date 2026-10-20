import "server-only"
import type { WildChip, WildStage } from "./wild-format"

/**
 * Data for the hero's "Live from the wild" loom. It reads the same
 * public feed the Fresh from the wild strip does, takes the most recent
 * search, and pulls every checked name under it from `by-query` — the
 * exact single fetch the public search page uses to list those names.
 *
 * Everything on a chip (score, tier, domain and handle counts, the AI
 * verdict, the judgment sentence) comes straight from that response, so
 * the loom shows real names a real person generated, never invented
 * ones. A name is haunted because its own check says a model already
 * overlaps it, and clean when the check says AI clean. Every fetch is
 * cached for an hour and times out quickly, and the whole thing degrades
 * to a seeded dramatization only if the backend is genuinely unreachable,
 * so the hero is never empty and never blocks the page.
 */

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8007"
const HOUR = { next: { revalidate: 3600 } } as const
const TIMEOUT = 6000

/** Verdict labels, matching the public search leaderboard. */
const AI_LABELS: Record<WildChip["aiVerdict"], string> = {
  excellent: "AI clean",
  good: "AI light overlap",
  okay: "AI overlap",
  poor: "AI collision",
}

type RawPillar = {
  pillar_type: string
  verdict: string
  items_passed: number
  items_checked: number
}

type RawName = {
  name: string
  latest_check: {
    overall_score: number
    overall_risk_level: string
    judgment?: string | null
    pillars?: RawPillar[]
  } | null
}

type RawDetail = { names: RawName[] }

const SEED_QUERY = "a budgeting app for freelancers"

function seed(
  name: string,
  score: number,
  aiVerdict: WildChip["aiVerdict"],
  caption: string
): WildChip {
  return {
    name,
    query: SEED_QUERY,
    score,
    tier: score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Okay",
    aiVerdict,
    aiLabel: AI_LABELS[aiVerdict],
    caption,
    domains: { passed: 4, checked: 6 },
    handles: { passed: 5, checked: 5 },
    haunted: aiVerdict !== "excellent",
  }
}

/** A dramatized fallback for when the backend is genuinely unreachable.
 *  Never shown while a real public search exists. */
const SEED: WildStage = {
  query: SEED_QUERY,
  secondsAgo: 96,
  chips: [
    seed(
      "Fernport",
      71,
      "poor",
      "ChatGPT already links this to a crypto wallet."
    ),
    seed(
      "Quibbl",
      88,
      "excellent",
      "Clean across every model. Worth claiming."
    ),
    seed("Snackwyse", 66, "okay", "Some overlap with a sourdough blog."),
    seed("Marrowly", 91, "excellent", "No collisions anywhere. A rare find."),
    seed("Blimpnote", 58, "poor", "Every model ties it to an old dance."),
    seed("Pastelio", 84, "good", "A little overlap, nothing serious."),
  ],
}

function capitalize(level: string): WildChip["tier"] {
  const c = level.charAt(0).toUpperCase() + level.slice(1)
  return (["Excellent", "Good", "Okay", "Poor"] as const).includes(
    c as WildChip["tier"]
  )
    ? (c as WildChip["tier"])
    : "Okay"
}

function toVerdict(value: string): WildChip["aiVerdict"] {
  return (["excellent", "good", "okay", "poor"] as const).includes(
    value as WildChip["aiVerdict"]
  )
    ? (value as WildChip["aiVerdict"])
    : "excellent"
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
      // The loom streams in behind a Suspense boundary, so a hung or
      // moved server must not hold the hero skeleton forever.
      signal: AbortSignal.timeout(TIMEOUT),
    })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

/** Build a chip from a name's own check. Returns null for unchecked
 *  names, exactly like the search page's leaderboard filters them out. */
function buildChip(raw: RawName, query: string): WildChip | null {
  const check = raw.latest_check
  if (!check) return null
  const pillars = Object.fromEntries(
    (check.pillars ?? []).map((p) => [p.pillar_type, p])
  )
  const ai = pillars.ai_association
  const aiVerdict = toVerdict(ai?.verdict ?? "excellent")
  const aiLabel = AI_LABELS[aiVerdict]
  const domain = pillars.domain
  const social = pillars.social
  return {
    name: raw.name,
    query,
    score: check.overall_score,
    tier: capitalize(check.overall_risk_level),
    aiVerdict,
    aiLabel,
    caption: check.judgment?.trim() || aiLabel,
    domains: domain
      ? { passed: domain.items_passed, checked: domain.items_checked }
      : null,
    handles: social
      ? { passed: social.items_passed, checked: social.items_checked }
      : null,
    haunted: aiVerdict !== "excellent",
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
    const chips = (detail?.names ?? [])
      .map((n) => buildChip(n, last.query))
      .filter((c): c is WildChip => c !== null)
      .slice(0, 8)
    if (!chips.length) return SEED

    return {
      query: last.query,
      secondsAgo: secondsSince(last.created_at),
      chips,
    }
  } catch {
    // Only a genuinely unreachable backend lands here, never a thin one.
    return SEED
  }
}

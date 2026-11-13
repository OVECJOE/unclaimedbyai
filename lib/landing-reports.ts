import { API_ORIGIN, type CheckReport, type SearchDetail } from "@/lib/api"
import { nameToSlug } from "@/lib/utils"

/**
 * Real checks for the landing page. The hero card and the "three
 * answers" section both show reports people actually ran, pulled from
 * the public searches feed. When the API has none (a fresh install, or
 * the API is down) they fall back to clearly labelled examples.
 *
 * Plain module, no "use client": the hero renders on the server and
 * the flip-through renders on the client, and both import from here.
 */

export type Tone = "open" | "taken" | "warn" | "muted"

export type RowKind =
  | "domain"
  | "github"
  | "x"
  | "instagram"
  | "tiktok"
  | "youtube"
  | "chatgpt"
  | "claude"
  | "perplexity"

export type Row = { kind: RowKind; label: string; value: string; tone: Tone }

export type Specimen = {
  name: string
  score: number
  tier: "Excellent" | "Good" | "Okay" | "Poor"
  verdict: string
  domains: Row[]
  handles: Row[]
  ai: Row[]
  /** Set on real checks only: the idea it came from, and its report. */
  query?: string
  href?: string
  checkedAt?: string
  /** The other checked names from the same search, best first. */
  shortlist?: { name: string; score: number }[]
}

const TIER: Record<string, Specimen["tier"]> = {
  excellent: "Excellent",
  good: "Good",
  okay: "Okay",
  poor: "Poor",
}

const DOMAIN_ORDER = ["com", "ai", "io", "co"]

const PLATFORMS: { platform: string; kind: RowKind; label: string }[] = [
  { platform: "github", kind: "github", label: "GitHub" },
  { platform: "x", kind: "x", label: "X" },
  { platform: "instagram", kind: "instagram", label: "Instagram" },
  { platform: "tiktok", kind: "tiktok", label: "TikTok" },
  { platform: "youtube", kind: "youtube", label: "YouTube" },
]

function status(value: string): { value: string; tone: Tone } {
  if (value === "available") return { value: "free", tone: "open" }
  if (value === "taken") return { value: "taken", tone: "taken" }
  return { value: "couldn't check", tone: "muted" }
}

function chatbot(model: string | null): { kind: RowKind; label: string } {
  const id = (model ?? "").toLowerCase()
  if (id.includes("claude") || id.includes("anthropic")) {
    return { kind: "claude", label: "Claude" }
  }
  if (id.includes("perplexity") || id.includes("sonar")) {
    return { kind: "perplexity", label: "Perplexity" }
  }
  return { kind: "chatgpt", label: "ChatGPT" }
}

function shorten(text: string, max = 26): string {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text
}

/** Turns an API report into the rows the landing cards show. */
export function reportToSpecimen(
  name: string,
  report: CheckReport,
  query?: string
): Specimen {
  const domains = [...report.domains]
    .sort((a, b) => {
      const ai = DOMAIN_ORDER.indexOf(a.tld)
      const bi = DOMAIN_ORDER.indexOf(b.tld)
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
    })
    .slice(0, 4)
    .map((domain) => ({
      kind: "domain" as const,
      label: domain.domain.toLowerCase(),
      ...status(domain.status),
    }))

  const handles = PLATFORMS.flatMap(({ platform, kind, label }) => {
    const row = report.socials.find((social) => social.platform === platform)
    return row ? [{ kind, label, ...status(row.status) }] : []
  })

  const ai = report.ai.map((answer) => {
    const bot = chatbot(answer.model)
    if (answer.error) {
      return { ...bot, value: "couldn't ask", tone: "muted" as const }
    }
    const category = answer.association_category ?? "none"
    if (category === "none") {
      return { ...bot, value: "nothing known", tone: "open" as const }
    }
    if (category === "common_word") {
      return { ...bot, value: "a common word", tone: "warn" as const }
    }
    return {
      ...bot,
      value: shorten(answer.association ?? `a ${category}`),
      tone: "taken" as const,
    }
  })

  return {
    name,
    score: report.overall_score,
    tier: TIER[report.overall_risk_level] ?? "Okay",
    verdict: report.judgment,
    domains,
    handles,
    ai,
    query,
    href: query ? `/searches/${nameToSlug(query)}` : undefined,
    checkedAt: report.created_at,
  }
}

type PublicSearch = { query: string; top_name: string }

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_ORIGIN}${path}`, {
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

/**
 * The newest public searches, each reduced to its strongest checked
 * name and that name's full report. Any step that fails just drops
 * that search; an empty result means "show the examples".
 */
export async function loadRealSpecimens(limit = 4): Promise<Specimen[]> {
  const feed = await getJson<{ items: PublicSearch[] }>(
    `/api/v1/searches/public-top?limit=${limit}`
  )
  if (!feed?.items.length) return []

  const specimens = await Promise.all(
    feed.items.map(async (item): Promise<Specimen | null> => {
      const search = await getJson<SearchDetail>(
        `/api/v1/searches/by-query?q=${encodeURIComponent(item.query)}`
      )
      const ranked = (search?.names ?? [])
        .filter((name) => name.latest_check !== null)
        .sort(
          (a, b) =>
            b.latest_check!.overall_score - a.latest_check!.overall_score
        )
      const top = ranked[0]
      if (!top?.latest_check) return null
      const report = await getJson<CheckReport>(
        `/api/v1/reports/${top.latest_check.public_id}`
      )
      if (!report) return null
      return {
        ...reportToSpecimen(top.name, report, item.query),
        shortlist: ranked.slice(0, 4).map((name) => ({
          name: name.name,
          score: name.latest_check!.overall_score,
        })),
      }
    })
  )
  // One card per name, even if two searches landed on the same one.
  const seen = new Set<string>()
  return specimens.filter((specimen): specimen is Specimen => {
    if (!specimen || seen.has(specimen.name)) return false
    seen.add(specimen.name)
    return true
  })
}

const domainRows = (name: string, free: boolean[]): Row[] =>
  DOMAIN_ORDER.map((tld, index) => ({
    kind: "domain",
    label: `${name.toLowerCase()}.${tld}`,
    value: free[index] ? "free" : "taken",
    tone: free[index] ? "open" : "taken",
  }))

const handleRows = (free: boolean[]): Row[] =>
  PLATFORMS.map(({ kind, label }, index) => ({
    kind,
    label,
    value: free[index] ? "free" : "taken",
    tone: free[index] ? "open" : "taken",
  }))

const aiRows = (answers: [string, Tone][]): Row[] =>
  (["ChatGPT", "Claude", "Perplexity"] as const).map((label, index) => ({
    kind: label === "ChatGPT" ? "chatgpt" : label === "Claude" ? "claude" : "perplexity",
    label,
    value: answers[index][0],
    tone: answers[index][1],
  }))

/**
 * Made-up names with made-up results, shown only when there are no
 * real public checks to show. Every place that renders them says so.
 */
export const EXAMPLE_SPECIMENS: Specimen[] = [
  {
    name: "Quillfern",
    score: 94,
    tier: "Excellent",
    verdict: "Wide open. Nobody has a story for this name yet.",
    domains: domainRows("Quillfern", [true, true, true, true]),
    handles: handleRows([true, true, true, true, false]),
    ai: aiRows([
      ["nothing known", "open"],
      ["nothing known", "open"],
      ["nothing known", "open"],
    ]),
  },
  {
    name: "Nexuare",
    score: 76,
    tier: "Good",
    verdict: "Usable. The .com is gone, but everything else is free.",
    domains: domainRows("Nexuare", [false, true, true, true]),
    handles: handleRows([false, true, true, true, true]),
    ai: aiRows([
      ["nothing known", "open"],
      ["a common word", "warn"],
      ["nothing known", "open"],
    ]),
  },
  {
    name: "Lumivo",
    score: 48,
    tier: "Okay",
    verdict: "Crowded. Two chatbots already link it to other brands.",
    domains: domainRows("Lumivo", [false, false, true, false]),
    handles: handleRows([false, false, false, true, true]),
    ai: aiRows([
      ["a lighting brand", "taken"],
      ["a skincare line", "taken"],
      ["nothing known", "open"],
    ]),
  },
  {
    name: "Brightly",
    score: 17,
    tier: "Poor",
    verdict: "Taken almost everywhere, and the chatbots know who has it.",
    domains: domainRows("Brightly", [false, false, false, false]),
    handles: handleRows([false, false, false, false, false]),
    ai: aiRows([
      ["a software company", "taken"],
      ["a software company", "taken"],
      ["several companies", "taken"],
    ]),
  },
]

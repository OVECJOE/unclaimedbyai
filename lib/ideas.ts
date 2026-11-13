import { API_ORIGIN } from "@/lib/api"

/**
 * Public idea pages: a published search, told as a post by its owner.
 *
 * Plain module on purpose. The page, its share image, the sitemap and
 * the gallery all read from here, and the analysis below is pure, so it
 * runs the same on the server and can be reasoned about without a
 * browser. Nothing here reads cookies, which is what lets the pages be
 * cached and served from the edge.
 */

export type IdeaAi = {
  model: string
  category: string | null
  association: string | null
  confidence: number | null
  failed: boolean
}

export type IdeaName = {
  id: number
  name: string
  about: string | null
  score: number
  tier: "Excellent" | "Good" | "Okay" | "Poor"
  judgment: string
  report_id: string
  checked_at: string
  domains: { tld: string; available: boolean | null }[]
  socials: { platform: string; available: boolean | null }[]
  ai: IdeaAi[]
}

export type IdeaOwner = {
  name: string
  named: boolean
  avatar_url: string | null
  member_since: string | null
  searches_run: number
  names_checked: number
}

export type IdeaPage = {
  slug: string
  title: string
  brief: string
  category: string
  note: string | null
  published_at: string | null
  updated_at: string
  checked_at: string | null
  owner: IdeaOwner
  names: IdeaName[]
  hidden_count: number
  models: string[]
}

export type IdeaCard = {
  slug: string
  title: string
  owner: string
  name_count: number
  best: { name: string; score: number } | null
  published_at: string | null
  updated_at: string
  top_names: string[]
}

const REVALIDATE_SECONDS = 300

export async function getIdeaPage(slug: string): Promise<IdeaPage | null> {
  try {
    const res = await fetch(
      `${API_ORIGIN}/api/v1/public/ideas/${encodeURIComponent(slug)}`,
      { next: { revalidate: REVALIDATE_SECONDS, tags: [`idea:${slug}`] } }
    )
    if (!res.ok) return null
    return (await res.json()) as IdeaPage
  } catch {
    return null
  }
}

export async function listIdeas(
  limit = 24,
  offset = 0
): Promise<{ items: IdeaCard[]; total: number }> {
  try {
    const res = await fetch(
      `${API_ORIGIN}/api/v1/public/ideas?limit=${limit}&offset=${offset}`,
      { next: { revalidate: REVALIDATE_SECONDS, tags: ["ideas"] } }
    )
    if (!res.ok) return { items: [], total: 0 }
    return (await res.json()) as { items: IdeaCard[]; total: number }
  } catch {
    return { items: [], total: 0 }
  }
}

/* ------------------------------ analysis ------------------------------ */

/** Above this a chatbot is describing a different, existing brand. */
export const COLLISION_AT = 30

export type Stage = "domain" | "handles" | "chatbots"

export const STAGE_LABEL: Record<Stage, string> = {
  domain: "the .com was taken",
  handles: "a social handle was taken",
  chatbots: "chatbots already link it to another brand",
}

export type NameFacts = {
  name: IdeaName
  /** true free, false taken, null not confirmed */
  com: boolean | null
  freeDomains: string[]
  handlesOpen: number
  handlesTaken: number
  takenHandles: string[]
  peak: number
  confusedBy: IdeaAi[]
  /** Every stage this name failed, in the order people hit them. */
  failures: Stage[]
  /** The first one: where the name died. */
  diedAt: Stage | null
}

export function factsFor(name: IdeaName): NameFacts {
  const com = name.domains.find((domain) => domain.tld === "com")?.available
  const peak = name.ai.reduce(
    (best, row) =>
      row.confidence !== null ? Math.max(best, row.confidence) : best,
    0
  )
  const takenHandles = name.socials
    .filter((social) => social.available === false)
    .map((social) => social.platform)
  const confusedBy = name.ai.filter(
    (row) => !row.failed && (row.confidence ?? 0) >= COLLISION_AT
  )
  const failures: Stage[] = []
  if (com === false) failures.push("domain")
  if (takenHandles.length > 0) failures.push("handles")
  if (confusedBy.length > 0) failures.push("chatbots")
  return {
    name,
    com: com ?? null,
    freeDomains: name.domains
      .filter((domain) => domain.available === true)
      .map((domain) => domain.tld),
    handlesOpen: name.socials.filter((social) => social.available === true)
      .length,
    handlesTaken: takenHandles.length,
    takenHandles,
    peak,
    confusedBy,
    failures,
    diedAt: failures[0] ?? null,
  }
}

export type Funnel = {
  total: number
  /** Cumulative: how many were still standing after each stage. */
  steps: { key: "start" | Stage; label: string; count: number; lost: number }[]
}

export type Story = {
  facts: NameFacts[]
  survivors: NameFacts[]
  funnel: Funnel
  deaths: Record<Stage, number>
  average: number
  best: NameFacts | null
  comFree: number
  /** The one-line result the page leads with. */
  headline: string
  /** A sentence of what actually happened, from the largest loss. */
  lede: string
  /** The best name that failed, and what it failed on. */
  closest: NameFacts | null
  /** A name that passed everything people can see, then failed on chatbots. */
  trap: NameFacts | null
  /** Real chatbot answers about the most confused name. */
  quotes: { name: string; ai: IdeaAi }[]
}

const WORDS = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
]

export function count(n: number): string {
  return n >= 0 && n < WORDS.length ? WORDS[n] : String(n)
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function analyze(names: IdeaName[]): Story {
  const facts = names.map(factsFor)
  const survivors = facts.filter((entry) => entry.failures.length === 0)
  const total = facts.length

  const deaths: Record<Stage, number> = { domain: 0, handles: 0, chatbots: 0 }
  for (const entry of facts) if (entry.diedAt) deaths[entry.diedAt] += 1

  const afterDomain = total - deaths.domain
  const afterHandles = afterDomain - deaths.handles
  const funnel: Funnel = {
    total,
    steps: [
      { key: "start", label: "Names we tested", count: total, lost: 0 },
      {
        key: "domain",
        label: "Still had a free .com",
        count: afterDomain,
        lost: deaths.domain,
      },
      {
        key: "handles",
        label: "And open social handles",
        count: afterHandles,
        lost: deaths.handles,
      },
      {
        key: "chatbots",
        label: "And no chatbot confusion",
        count: survivors.length,
        lost: deaths.chatbots,
      },
    ],
  }

  const average = total
    ? Math.round(
        facts.reduce((sum, entry) => sum + entry.name.score, 0) / total
      )
    : 0
  const best = facts[0] ?? null
  const comFree = facts.filter((entry) => entry.com === true).length

  const headline =
    survivors.length === 0
      ? `${capitalize(count(total))} names tested. None cleared every check.`
      : survivors.length === 1
        ? `${capitalize(count(total))} names tested. One survived.`
        : `${capitalize(count(total))} names tested. ${capitalize(count(survivors.length))} survived.`

  const worst = (Object.entries(deaths) as [Stage, number][]).sort(
    (a, b) => b[1] - a[1]
  )[0]
  let lede: string
  if (total === 0) {
    lede = ""
  } else if (worst[1] === 0) {
    lede = "Every name made it through the domain, handle and chatbot checks."
  } else if (worst[0] === "domain") {
    lede = `${capitalize(count(worst[1]))} of ${count(total)} fell at the first hurdle: the .com was already taken.`
  } else if (worst[0] === "handles") {
    lede = `Domains held up better than handles. ${capitalize(count(worst[1]))} names lost on a social handle someone else already owns.`
  } else {
    lede = `The domains were fine. ${capitalize(count(worst[1]))} names lost because chatbots already link them to another brand.`
  }

  const failed = facts.filter((entry) => entry.failures.length > 0)
  const closest =
    survivors.length === 0
      ? ([...failed].sort(
          (a, b) =>
            a.failures.length - b.failures.length || b.name.score - a.name.score
        )[0] ?? null)
      : null
  const trap =
    failed
      .filter(
        (entry) =>
          entry.diedAt === "chatbots" &&
          entry.com !== false &&
          entry.handlesTaken === 0
      )
      .sort((a, b) => b.name.score - a.name.score)[0] ?? null

  const confused = [...facts].sort((a, b) => b.peak - a.peak)[0]
  const quotes =
    confused && confused.peak >= COLLISION_AT
      ? confused.name.ai
          .filter((row) => !row.failed && row.association)
          .sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0))
          .slice(0, 3)
          .map((ai) => ({ name: confused.name.name, ai }))
      : []

  return {
    facts,
    survivors,
    funnel,
    deaths,
    average,
    best,
    comFree,
    headline,
    lede,
    closest,
    trap,
    quotes,
  }
}

/** One plain sentence about a single name, for its write-up and the FAQ. */
export function verdictLine(entry: NameFacts): string {
  const { name } = entry
  if (entry.failures.length === 0) {
    const handles =
      name.socials.length > 0 && entry.handlesOpen === name.socials.length
        ? "every handle we checked is open"
        : "no handle we checked is taken"
    return `Cleared every check: ${entry.com === true ? "the .com is free, " : ""}${handles}, and no chatbot confused it with another brand.`
  }
  const parts: string[] = []
  if (entry.failures.includes("domain")) parts.push("the .com is taken")
  if (entry.failures.includes("handles")) {
    parts.push(
      `${entry.takenHandles.length === 1 ? "the" : ""} ${entry.takenHandles.join(", ")} handle${entry.takenHandles.length === 1 ? " is" : "s are"} taken`.trim()
    )
  }
  if (entry.failures.includes("chatbots")) {
    const model = entry.confusedBy[0]?.model
    parts.push(`${model ?? "a chatbot"} already ties it to another brand`)
  }
  const list =
    parts.length > 1
      ? `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`
      : parts[0]
  return capitalize(list) + "."
}

export function checkedLabel(iso: string | null): string {
  if (!iso) return ""
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

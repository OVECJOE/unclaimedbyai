import type { CheckReport } from "@/lib/api"
import { COLLISION_AT, count } from "@/lib/ideas"

/**
 * The answer to "is this name still free?", read straight off one
 * check. Pure functions, shared by the public name page and the public
 * search page so both say the same thing the same way.
 */

type Facts = {
  comStatus: "free" | "taken" | "unknown"
  freeDomains: CheckReport["domains"]
  domainsChecked: number
  openHandles: number
  takenHandles: CheckReport["socials"]
  handlesChecked: number
  peak: number
  confused: CheckReport["ai"]
  answered: number
}

export function factsOf(report: CheckReport): Facts {
  const com = report.domains.find((domain) => domain.tld === "com")
  const known = report.domains.filter(
    (domain) => domain.status === "available" || domain.status === "taken"
  )
  const socials = report.socials.filter(
    (social) => social.status === "available" || social.status === "taken"
  )
  const answers = report.ai.filter((row) => !row.error)
  return {
    comStatus:
      com?.status === "available"
        ? "free"
        : com?.status === "taken"
          ? "taken"
          : "unknown",
    freeDomains: report.domains.filter(
      (domain) => domain.status === "available"
    ),
    domainsChecked: known.length,
    openHandles: socials.filter((social) => social.status === "available")
      .length,
    takenHandles: socials.filter((social) => social.status === "taken"),
    handlesChecked: socials.length,
    peak: answers.reduce(
      (best, row) => Math.max(best, row.collision_confidence ?? 0),
      0
    ),
    confused: answers.filter(
      (row) => (row.collision_confidence ?? 0) >= COLLISION_AT
    ),
    answered: answers.length,
  }
}

export const PLATFORM: Record<string, string> = {
  x: "X",
  github: "GitHub",
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  npm: "npm",
  linkedin: "LinkedIn",
}
export const platformName = (key: string) => PLATFORM[key] ?? key

/** The one-sentence answer, honest in both directions. */
export function answerLine(report: CheckReport): string {
  const facts = factsOf(report)
  const problems: string[] = []
  if (facts.comStatus === "taken") problems.push("the .com is taken")
  if (facts.takenHandles.length > 0) {
    const names = facts.takenHandles.map((social) =>
      platformName(social.platform)
    )
    problems.push(
      `${names.slice(0, 3).join(", ")}${names.length > 3 ? " and more" : ""} ${
        names.length === 1 ? "has" : "have"
      } the handle already`
    )
  }
  if (facts.confused.length > 0) {
    problems.push("a chatbot already ties it to another brand")
  }
  if (problems.length === 0) {
    return `Yes. ${
      facts.comStatus === "free" ? "The .com is free, " : ""
    }every handle we checked is open, and no chatbot confused it with another brand.`
  }
  const text =
    problems.length > 1
      ? `${problems.slice(0, -1).join(", ")} and ${problems[problems.length - 1]}`
      : problems[0]
  return `Not completely. ${text.charAt(0).toUpperCase()}${text.slice(1)}.`
}

const cap = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

const TLD_ORDER = ["com", "ai", "io", "co", "app", "dev", "net", "org"]

export type StoryTile = {
  key: string
  label: string
  detail?: string
  state: "free" | "taken" | "unknown"
}

export type NameStoryData = {
  name: string
  score: number
  domains: {
    headline: string
    sub: string
    tiles: StoryTile[]
  }
  handles: {
    headline: string
    sub: string
    tiles: StoryTile[]
  }
  chatbots: {
    headline: string
    sub: string
    models: string[]
    quote: { text: string; model: string | null } | null
  }
}

/** Everything the scroll story shows, as plain data. */
export function storyFrom(
  name: string,
  score: number,
  report: CheckReport
): NameStoryData {
  const facts = factsOf(report)
  const rank = (tld: string) => {
    const index = TLD_ORDER.indexOf(tld)
    return index === -1 ? TLD_ORDER.length : index
  }
  const known = report.domains
    .filter((d) => d.status === "available" || d.status === "taken")
    .sort((a, b) => rank(a.tld) - rank(b.tld) || a.tld.localeCompare(b.tld))
  const hiddenFree = known
    .slice(8)
    .filter((d) => d.status === "available").length

  const topAi = [...facts.confused].sort(
    (a, b) => (b.collision_confidence ?? 0) - (a.collision_confidence ?? 0)
  )[0]
  const answered = report.ai.filter((row) => !row.error)

  return {
    name,
    score,
    domains: {
      headline:
        facts.comStatus === "free"
          ? "The .com is free."
          : facts.comStatus === "taken"
            ? "The .com is taken."
            : "We couldn't confirm the .com.",
      sub: `${facts.freeDomains.length} of ${facts.domainsChecked} extensions are free to register${
        hiddenFree > 0 ? `, including ${hiddenFree} not shown here` : ""
      }.`,
      tiles: known.slice(0, 8).map((d) => ({
        key: d.tld,
        label: `.${d.tld}`,
        state: d.status === "available" ? "free" : "taken",
      })),
    },
    handles: {
      headline:
        facts.handlesChecked === 0
          ? "We couldn't confirm the usernames."
          : facts.takenHandles.length === 0
            ? "Every username is open."
            : facts.openHandles === 0
              ? "Every username is taken."
              : `${cap(count(facts.takenHandles.length))} of ${count(facts.handlesChecked)} usernames ${
                  facts.takenHandles.length === 1 ? "is" : "are"
                } already taken.`,
      sub:
        facts.handlesChecked === 0
          ? "Social platforms didn't answer, so nothing is guessed."
          : `${facts.openHandles} of ${facts.handlesChecked} are still open for @${name.toLowerCase().replace(/\s+/g, "")}.`,
      tiles: report.socials
        .filter((s) => s.status === "available" || s.status === "taken")
        .map((s) => ({
          key: s.platform,
          label: platformName(s.platform),
          state: s.status === "available" ? "free" : "taken",
        })),
    },
    chatbots: {
      headline:
        answered.length === 0
          ? "The chatbots didn't answer."
          : facts.confused.length === 0
            ? "No chatbot confuses it."
            : `${cap(count(facts.confused.length))} of ${count(answered.length)} chatbots link it to a brand.`,
      sub:
        answered.length === 0
          ? "The chatbot check didn't finish for this name. Run a fresh check to try again."
          : facts.confused.length === 0
            ? "We asked what they already know about the name. None tied it to another brand."
            : "Asked about this name, the strongest answer was:",
      models: answered
        .map((row) => row.model)
        .filter((model): model is string => Boolean(model)),
      quote: topAi?.association
        ? { text: topAi.association, model: topAi.model }
        : null,
    },
  }
}

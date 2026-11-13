import type { NameResult } from "@/lib/constants"

export type GradeTier = "Excellent" | "Good" | "Okay" | "Poor"

export function summarizeResults(results: NameResult[]) {
  const grading: Record<GradeTier, number> = {
    Excellent: 0,
    Good: 0,
    Okay: 0,
    Poor: 0,
  }
  let scoreTotal = 0

  for (const result of results) {
    grading[result.tier] += 1
    scoreTotal += result.score
  }

  const total = results.length
  const passCount = grading.Excellent + grading.Good

  return {
    grading,
    total,
    passCount,
    passRate: total ? Math.round((passCount / total) * 100) : 0,
    overall: total ? Math.round(scoreTotal / total) : 0,
  }
}

export function tierForScore(score: number): GradeTier {
  if (score >= 80) return "Excellent"
  if (score >= 60) return "Good"
  if (score >= 40) return "Okay"
  return "Poor"
}

export function overallScoreColor(score: number): string {
  if (score >= 80) return "bg-green-600 text-white px-1.5 py-0.5"
  if (score >= 60) return "bg-yellow-500 text-black px-1.5 py-0.5"
  return "bg-red-600 text-white px-1.5 py-0.5"
}

const TIER_COLORS: Record<GradeTier, string> = {
  Excellent: "bg-green-600 text-white px-1.5 py-0.5",
  Good: "bg-lime-700 text-white px-1.5 py-0.5",
  Okay: "bg-yellow-500 text-black px-1.5 py-0.5",
  Poor: "bg-red-600 text-white px-1.5 py-0.5",
}

export function tierColor(tier: GradeTier): string {
  return TIER_COLORS[tier]
}

const AI_ASSOCIATION_COLORS: Record<NameResult["aiAssociation"], string> = {
  Low: "bg-green-600 text-white px-1.5 py-0.5",
  Medium: "bg-yellow-500 text-black px-1.5 py-0.5",
  High: "bg-orange-600 text-white px-1.5 py-0.5",
  "Very High": "bg-red-600 text-white px-1.5 py-0.5",
}

export function aiAssociationColor(
  association: NameResult["aiAssociation"]
): string {
  return AI_ASSOCIATION_COLORS[association]
}

/**
 * One plain sentence on what to do with a name, from the facts we
 * checked. The .com is the deciding fact for most people, so it leads;
 * a name with nothing free says so rather than staying quiet. Unknown
 * answers (null) are never treated as taken.
 */
export function nextStep(result: NameResult): {
  /** A few words, for a crowded table row. */
  short: string
  /** The full sentence, for the comparison and detail views. */
  text: string
  tone: "good" | "warn" | "bad"
} {
  const free = result.domains.filter((domain) => domain.available === true)
  const com = result.domains.find((domain) => domain.tld === "com")
  const handlesFree = result.socials.filter(
    (social) => social.available === true
  ).length
  const handlesTaken = result.socials.filter(
    (social) => social.available === false
  ).length
  const crowded =
    result.aiAssociation === "High" || result.aiAssociation === "Very High"
  // Long lists read as noise: name three and count the rest.
  const some = free.slice(0, 3).map((domain) => `.${domain.tld}`)
  const list =
    free.length > 3
      ? `${some.join(", ")} and ${free.length - 3} more`
      : some.join(", ").replace(/, ([^,]*)$/, " and $1")

  if (com?.available === true) {
    if (crowded) {
      return {
        short: ".com free, but chatbots link it to something else",
        text: "The .com is free, but chatbots already link this name to something else. Check what they say first.",
        tone: "warn",
      }
    }
    return {
      short: "Register the .com now",
      text:
        handlesTaken > 0
          ? `Register the .com now. ${handlesTaken} handle${handlesTaken === 1 ? " is" : "s are"} already taken, so claim the rest soon.`
          : "Register the .com now, then claim the handles.",
      tone: "good",
    }
  }
  if (free.length > 0) {
    return {
      short: `No .com. ${some[0]} is free`,
      text: `The .com is ${com?.available === false ? "taken" : "not confirmed"}. ${list} ${free.length === 1 ? "is" : "are"} free if that works for you.`,
      tone: "warn",
    }
  }
  if (result.domains.every((domain) => domain.available === null)) {
    return {
      short: "Domains not confirmed. Check again",
      text: "We could not confirm the domains. Check this name again.",
      tone: "warn",
    }
  }
  return {
    short: "Probably skip this one",
    text:
      handlesFree > 0
        ? "Every domain we checked is taken. Only worth it if you can buy one."
        : "Domains and handles are mostly taken. Probably skip this one.",
    tone: "bad",
  }
}

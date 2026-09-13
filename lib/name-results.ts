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
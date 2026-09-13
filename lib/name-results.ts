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
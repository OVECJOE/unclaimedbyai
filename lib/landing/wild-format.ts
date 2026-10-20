/**
 * Client-safe shapes and helpers for the "Live from the wild" loom.
 * Kept free of the server-only guard so the hero's client component can
 * import the types and the time label without dragging server code into
 * the browser bundle.
 *
 * A chip is built entirely from the `by-query` response, the same single
 * fetch the public search page uses to list every checked name. Nothing
 * here is invented: the score, tier, domain and handle counts, AI
 * verdict, and the caption sentence all come straight from a name's
 * real check.
 */

export type WildChip = {
  name: string
  query: string
  score: number
  tier: "Excellent" | "Good" | "Okay" | "Poor"
  /** The real AI-association verdict, straight from the check. */
  aiVerdict: "excellent" | "good" | "okay" | "poor"
  /** Human label for that verdict, e.g. "AI collision". */
  aiLabel: string
  /** The check's own judgment sentence, the honest caption. */
  caption: string
  /** Domains still free: passed / checked, from the domain pillar. */
  domains: { passed: number; checked: number } | null
  /** Handles still open: passed / checked, from the social pillar. */
  handles: { passed: number; checked: number } | null
  /** Haunted when a model already overlaps this name. */
  haunted: boolean
}

export type WildStage = {
  query: string
  secondsAgo: number
  chips: WildChip[]
}

/** Human "checked Xm ago" for a secondsAgo value. */
export function agoLabel(secondsAgo: number): string {
  if (secondsAgo < 60) return `${secondsAgo}s ago`
  const minutes = Math.round(secondsAgo / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 48) return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
}

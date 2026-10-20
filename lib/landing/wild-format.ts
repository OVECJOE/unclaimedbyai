/**
 * Client-safe shapes and helpers for the "Live from the wild" loom.
 * Kept free of the server-only guard so the hero's client component can
 * import the types and the time label without dragging server code into
 * the browser bundle.
 */

export type WildChip = {
  name: string
  query: string
  score: number
  tier: "Excellent" | "Good" | "Okay" | "Poor"
  aiLevel: "Low" | "Medium" | "High" | "Very High"
  /** The real thing a model already links this name to, if any. */
  ghost: string | null
  domains: { tld: string; available: boolean }[]
  socials: { platform: string; available: boolean }[]
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

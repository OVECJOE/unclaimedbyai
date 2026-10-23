import { Badge } from "@/components/ui/badge"
import { tierColor, type GradeTier } from "@/lib/name-results"

export type Tier = "Excellent" | "Good" | "Okay" | "Poor"

const KNOWN_TIERS: readonly string[] = ["Excellent", "Good", "Okay", "Poor"]

/**
 * The one tier badge, wherever a tier shows: report pages, leaderboards,
 * history cards, the watchlist browse tab. Accepts either the display
 * spelling ("Good") or the API's lowercase tier ("good") and colors
 * both exactly the way the report page always has — one tier, one
 * voice, one color. An unrecognized tier renders uncolored rather
 * than borrowing a color that would lie.
 */
export function TierBadge({ tier }: { tier: string }) {
  const normalized = tier.charAt(0).toUpperCase() + tier.slice(1)
  const known = KNOWN_TIERS.includes(normalized)
  return (
    <Badge className={known ? tierColor(normalized as GradeTier) : undefined}>
      {known ? normalized : tier}
    </Badge>
  )
}

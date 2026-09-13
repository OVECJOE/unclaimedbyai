import { Badge } from "@/components/ui/badge"
import { tierColor } from "@/lib/name-results"

export type Tier = "Excellent" | "Good" | "Okay" | "Poor"

export function TierBadge({ tier }: { tier: Tier }) {
  return <Badge className={tierColor(tier)}>{tier}</Badge>
}
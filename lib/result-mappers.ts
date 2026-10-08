import type { CheckReport, NameItem, SearchResultsPayload } from "./api"
import type { NameResult } from "./constants"
import type { GradeTier } from "./name-results"

export function diceLogo(name: string): string {
  return `https://api.dicebear.com/10.x/shapes/svg?seed=${encodeURIComponent(name)}`
}

export function toTier(level: string): GradeTier {
  const tier = level.charAt(0).toUpperCase() + level.slice(1)
  return (["Excellent", "Good", "Okay", "Poor"] as const).includes(
    tier as GradeTier
  )
    ? (tier as GradeTier)
    : "Okay"
}

function associationFor(report: CheckReport): NameResult["aiAssociation"] {
  const confidences = report.ai
    .map((row) => row.collision_confidence ?? 0)
    .filter((value) => value > 0)
  const max = Math.max(0, ...confidences)
  if (max >= 70) return "High"
  if (max >= 30) return "Medium"
  return "Low"
}

export function toNameResult(
  name: NameItem,
  report: CheckReport | null
): NameResult | null {
  if (!report) return null
  return {
    name: name.name,
    logo: diceLogo(name.name),
    score: report.overall_score,
    tier: toTier(report.overall_risk_level),
    domains: report.domains.map((domain) => ({
      tld: domain.tld as NameResult["domains"][number]["tld"],
      available: domain.status === "available",
    })),
    socials: report.socials.map((social) => ({
      platform: social.platform as NameResult["socials"][number]["platform"],
      available: social.status === "available",
    })),
    aiAssociation: associationFor(report),
  }
}

export function toNameResultFromPayload(
  item: SearchResultsPayload["items"][number]
): NameResult {
  return {
    name: item.name,
    logo: diceLogo(item.name),
    score: item.score,
    tier: toTier(item.tier),
    domains: item.domains.map((domain) => ({
      tld: domain.tld as NameResult["domains"][number]["tld"],
      available: domain.available,
    })),
    socials: item.socials.map((social) => ({
      platform: social.platform as NameResult["socials"][number]["platform"],
      available: social.available,
    })),
    aiAssociation: (["Low", "Medium", "High", "Very High"] as const).includes(
      item.aiAssociation as NameResult["aiAssociation"]
    )
      ? (item.aiAssociation as NameResult["aiAssociation"])
      : "Low",
  }
}

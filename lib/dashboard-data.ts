import { cache } from "react"
import { apiServer } from "./api-server"
import type { CheckReport, NameItem, SearchDetail, SearchItem } from "./api"
import type { SearchResultCardProps } from "@/components/dashboard/search-result-card"
import type { NameResult } from "./constants"
import type { GradeTier } from "./name-results"

export function diceLogo(name: string): string {
  return `https://api.dicebear.com/10.x/shapes/svg?seed=${encodeURIComponent(name)}`
}

export const getCachedSearchDetail = cache(
  (searchId: number): Promise<SearchDetail> =>
    apiServer<SearchDetail>(`/api/v1/searches/${searchId}`)
)

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

async function reportFor(publicId: string | null): Promise<CheckReport | null> {
  if (!publicId) return null
  try {
    return await apiServer<CheckReport>(`/api/v1/reports/${publicId}`)
  } catch {
    return null
  }
}

export async function getSearchResults(searchId: number): Promise<{
  search: SearchDetail
  results: NameResult[]
}> {
  const search = await getCachedSearchDetail(searchId)
  const pairs = await Promise.all(
    search.names.map(async (name) => ({
      name,
      report: await reportFor(name.latest_check?.public_id ?? null),
    }))
  )
  const results: NameResult[] = []
  for (const { name, report } of pairs) {
    const mapped = report ? toNameResult(name, report) : null
    if (mapped) results.push(mapped)
  }
  results.sort((a, b) => b.score - a.score)
  return { search, results }
}

export const getCachedSearchResults = cache(getSearchResults)

export function toCardProps(item: SearchItem): SearchResultCardProps {
  const preview = item.preview_names.map((name) => ({
    name,
    logo: diceLogo(name),
  }))
  const topPick = item.top
    ? { name: item.top.name, logo: diceLogo(item.top.name) }
    : (preview[0] ?? { name: "", logo: "" })
  return {
    id: String(item.id),
    query: item.query,
    nameCount: item.name_count,
    topPick,
    namesPreview: preview,
    createdAt: item.created_at,
    tier: item.top ? toTier(item.top.tier) : "Okay",
  }
}

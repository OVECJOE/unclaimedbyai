import { cache } from "react"
import { apiServer } from "./api-server"
import type {
  SearchHeader,
  SearchItem,
  SearchResultsPayload,
  SearchSummaryPayload,
} from "./api"
import type { SearchResultCardProps } from "@/components/dashboard/search-result-card"
import { diceLogo, toTier } from "./result-mappers"

export const getCachedSearchHeader = cache(
  (searchId: number, anonSessionId?: string): Promise<SearchHeader> => {
    const sid = anonSessionId ? `?anon_session_id=${anonSessionId}` : ""
    return apiServer<SearchHeader>(`/api/v1/searches/${searchId}/header${sid}`)
  }
)

export const getCachedSearchSummary = cache(
  (searchId: number, anonSessionId?: string): Promise<SearchSummaryPayload> => {
    const sid = anonSessionId ? `?anon_session_id=${anonSessionId}` : ""
    return apiServer<SearchSummaryPayload>(
      `/api/v1/searches/${searchId}/summary${sid}`
    )
  }
)

export const getCachedSearchResultsPage = cache(
  (
    searchId: number,
    availableOnly: boolean,
    sort: string,
    anonSessionId?: string,
    q?: string
  ): Promise<SearchResultsPayload> => {
    const params = new URLSearchParams()
    if (anonSessionId) params.set("anon_session_id", anonSessionId)
    if (availableOnly) params.set("available_only", "true")
    if (sort) params.set("sort", sort)
    if (q) params.set("q", q)
    const query = params.toString()
    return apiServer<SearchResultsPayload>(
      `/api/v1/searches/${searchId}/results${query ? `?${query}` : ""}`
    )
  }
)

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
    tier: item.top ? toTier(item.top.tier) : undefined,
  }
}

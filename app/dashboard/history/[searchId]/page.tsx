import { notFound, redirect } from "next/navigation"
import { Suspense } from "react"
import LiveSearch from "@/components/dashboard/live-search"
import { SearchDetailSkeleton } from "@/components/skeletons/shared"
import { ApiError, type WatchList } from "@/lib/api"
import {
  getCachedSearchHeader,
  getCachedSearchResultsPage,
  getCachedSearchSummary,
} from "@/lib/dashboard-data"
import { apiServer } from "@/lib/api-server"

export const dynamic = "force-dynamic"

async function SearchLiveBlock({
  searchId,
  availableOnly,
  sort,
  q,
}: {
  searchId: number
  availableOnly: boolean
  sort: string
  q?: string
}) {
  let header, summary, data, watches
  try {
    ;[header, summary, data, watches] = await Promise.all([
      getCachedSearchHeader(searchId),
      getCachedSearchSummary(searchId),
      getCachedSearchResultsPage(searchId, availableOnly, sort, undefined, q),
      apiServer<WatchList>("/api/v1/watches").catch(() => null),
    ])
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound()
    if (error instanceof ApiError && error.status === 401) redirect("/auth")
    throw error
  }

  const watched: Record<string, number> = {}
  for (const item of watches?.items ?? []) watched[item.name] = item.id

  return (
    <LiveSearch
      key={`${availableOnly}-${sort}-${q ?? ""}`}
      searchId={searchId}
      availableOnly={availableOnly}
      sort={sort}
      q={q}
      homeHref="/dashboard"
      homeLabel="Dashboard"
      historyHref="/dashboard/history"
      initialWatched={watched}
      initialHeader={header}
      initialSummary={summary}
      initialItems={data.items}
      initialPending={data.pending}
    />
  )
}

export default async function HistorySearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ searchId: string }>
  searchParams: Promise<{ [key: string]: string }>
}) {
  const { searchId } = await params
  const id = Number.parseInt(searchId, 10)
  if (!Number.isInteger(id)) notFound()
  const query = await searchParams
  const availableOnly = query.available === "1"
  const sort = query.sort || "overall-score-high-to-low"
  const q = query.q || undefined

  return (
    <section className="px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <Suspense fallback={<SearchDetailSkeleton />}>
          <SearchLiveBlock
            searchId={id}
            availableOnly={availableOnly}
            sort={sort}
            q={q}
          />
        </Suspense>
      </div>
    </section>
  )
}

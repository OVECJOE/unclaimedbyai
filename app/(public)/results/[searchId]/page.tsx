import Link from "next/link"
import { Button } from "@/components/ui/button"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import LiveSearch from "@/components/dashboard/live-search"
import { TableSkeleton } from "@/components/dashboard/skeletons"
import { ApiError } from "@/lib/api"
import {
  getCachedSearchHeader,
  getCachedSearchResultsPage,
  getCachedSearchSummary,
} from "@/lib/dashboard-data"

export const dynamic = "force-dynamic"

async function SearchLiveBlock({
  searchId,
  sid,
  availableOnly,
  sort,
  q,
}: {
  searchId: number
  sid: string
  availableOnly: boolean
  sort: string
  q?: string
}) {
  let header, summary, data
  try {
    ;[header, summary, data] = await Promise.all([
      getCachedSearchHeader(searchId, sid),
      getCachedSearchSummary(searchId, sid),
      getCachedSearchResultsPage(searchId, availableOnly, sort, sid, q),
    ])
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound()
    throw error
  }

  return (
    <LiveSearch
      key={`${availableOnly}-${sort}-${q ?? ""}`}
      searchId={searchId}
      sid={sid}
      availableOnly={availableOnly}
      sort={sort}
      q={q}
      homeHref="/"
      homeLabel="Home"
      detailBase={null}
      initialHeader={header}
      initialSummary={summary}
      initialItems={data.items}
      initialPending={data.pending}
      banner={
        <div className="flex flex-col items-center gap-3 border border-dashed p-6 text-center">
          <p className="font-heading text-xl">
            Like what you see? Keep these names.
          </p>
          <p className="max-w-prose text-sm text-muted-foreground">
            Sign in and this search moves into your dashboard history
            automatically.
          </p>
          <Button asChild>
            <Link href="/auth">Sign in to save</Link>
          </Button>
        </div>
      }
    />
  )
}

export default async function PublicResultsPage({
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
  if (!query.sid) notFound()
  const sid = query.sid
  const availableOnly = query.available === "1"
  const sort = query.sort || "overall-score-high-to-low"
  const q = query.q || undefined

  return (
    <section className="px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <Suspense fallback={<TableSkeleton />}>
          <SearchLiveBlock
            searchId={id}
            sid={sid}
            availableOnly={availableOnly}
            sort={sort}
            q={q}
          />
        </Suspense>
      </div>
    </section>
  )
}

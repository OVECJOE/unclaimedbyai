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

function LinkNotice({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto max-w-prose space-y-4 border border-dashed p-10 text-center">
      <h1 className="font-heading text-3xl font-semibold">{title}</h1>
      <p className="text-sm text-muted-foreground">{body}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/dashboard">Start your own search</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/auth">Sign in</Link>
        </Button>
      </div>
    </div>
  )
}

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
    if (error instanceof ApiError && error.status === 404) {
      return (
        <LinkNotice
          title="This results link has moved on"
          body="The link is missing its access token, or the search no longer exists. Shared links only work for the browser that created them — sign in to keep names, or start a fresh search."
        />
      )
    }
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
          <p className="font-heading text-xl">Keep these names.</p>
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
  if (!query.sid) {
    return (
      <section className="px-4 py-10">
        <LinkNotice
          title="This results link is incomplete"
          body="It's missing the session token that keeps your names private. If you shared it from another browser or device, open the original link there — or start your own search; it only takes a moment."
        />
      </section>
    )
  }
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

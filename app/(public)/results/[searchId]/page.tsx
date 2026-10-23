import Link from "next/link"
import { Button } from "@/components/ui/button"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import LiveSearch from "@/components/dashboard/live-search"
import { TableSkeleton } from "@/components/skeletons/shared"
import { ApiError } from "@/lib/api"
import {
  getCachedSearchHeader,
  getCachedSearchResultsPage,
  getCachedSearchSummary,
} from "@/lib/dashboard-data"
import SignInToClaim from "@/components/public/sign-in-to-claim"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Your live search results",
  robots: { index: false, follow: false },
}

function LinkNotice({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto max-w-prose space-y-4 border border-dashed p-10 text-center">
      <h1 className="font-heading text-3xl font-semibold">{title}</h1>
      <p className="text-sm text-muted-foreground">{body}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/dashboard">Start your own search</Link>
        </Button>
        <SignInToClaim href="/auth" variant="outline">
          Sign in
        </SignInToClaim>
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
  sid: string | null
  availableOnly: boolean
  sort: string
  q?: string
}) {
  let header, summary, data
  try {
    ;[header, summary, data] = await Promise.all([
      getCachedSearchHeader(searchId, sid ?? undefined),
      getCachedSearchSummary(searchId, sid ?? undefined),
      getCachedSearchResultsPage(
        searchId,
        availableOnly,
        sort,
        sid ?? undefined,
        q
      ),
    ])
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 404 || error.status === 401)
    ) {
      // The session cookie is tried before giving up: an email or
      // shared link has no sid, but its owner is usually signed in,
      // and the API resolves their search from the cookie alone.
      return (
        <LinkNotice
          title={
            sid
              ? "This results link has moved on"
              : "This results link is incomplete"
          }
          body="These links only open in the browser that made them, while its session is still around. Sign in to open your own searches from any device, or start a fresh search."
        />
      )
    }
    throw error
  }

  return (
    <LiveSearch
      key={`${availableOnly}-${sort}-${q ?? ""}`}
      searchId={searchId}
      sid={sid ?? undefined}
      availableOnly={availableOnly}
      sort={sort}
      q={q}
      homeHref="/"
      homeLabel="Home"
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
          <SignInToClaim href={`/auth?next=${encodeURIComponent(`/results/${searchId}`)}`}>
            Sign in to save
          </SignInToClaim>
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
  // No sid is fine: the live block falls back to the session cookie,
  // which resolves the search for its owner (email links, bookmarks).
  const sid = query.sid ?? null
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

import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import LiveSearch from "@/components/dashboard/live-search"
import { TableSkeleton } from "@/components/dashboard/skeletons"
import DirectCheckKickoff from "@/components/public/direct-check-kickoff"
import PrompterCta from "@/components/public/prompter-cta"
import ReportLeaderboard from "@/components/public/report-leaderboard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ApiError, searchByQuery } from "@/lib/api"
import {
  getCachedSearchHeader,
  getCachedSearchResultsPage,
  getCachedSearchSummary,
} from "@/lib/dashboard-data"
import { formatDateTime } from "@/lib/utils"
import { OG_PATH, SITE_URL } from "@/lib/site"

export const dynamic = "force-dynamic"

type PageProps = {
  params: Promise<{ name: string }>
  searchParams: Promise<{ s?: string; sid?: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { name } = await params
  const decoded = decodeURIComponent(name).replace(/-/g, " ").trim()
  return {
    title: `Check the name "${decoded}"`,
    description: `Live check of "${decoded}": domain availability, open social handles, and what AI models already associate with it.`,
    // The /searches sibling owns the ranking for this content; the
    // permalink exists for humans and links, so point crawlers home.
    alternates: { canonical: `/searches/${name}` },
    openGraph: {
      title: `Check the name "${decoded}"`,
      description: `Domains, handles, and AI associations for "${decoded}".`,
      url: `${SITE_URL}/check/${name}`,
      type: "website",
      images: [OG_PATH],
    },
    twitter: {
      card: "summary_large_image",
      images: [OG_PATH],
    },
  }
}

async function LiveCheckView({
  searchId,
  sid,
}: {
  searchId: number
  sid: string
}) {
  let header, summary, data
  try {
    ;[header, summary, data] = await Promise.all([
      getCachedSearchHeader(searchId, sid),
      getCachedSearchSummary(searchId, sid),
      getCachedSearchResultsPage(
        searchId,
        false,
        "overall-score-high-to-low",
        sid,
        undefined
      ),
    ])
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound()
    throw error
  }

  return (
    <LiveSearch
      key={`${searchId}-${sid}`}
      searchId={searchId}
      sid={sid}
      availableOnly={false}
      sort="overall-score-high-to-low"
      homeHref="/"
      homeLabel="Home"
      detailBase={null}
      initialHeader={header}
      initialSummary={summary}
      initialItems={data.items}
      initialPending={data.pending}
    />
  )
}

export default async function CheckNamePage({ params, searchParams }: PageProps) {
  const { name } = await params
  const decoded = decodeURIComponent(name).replace(/-/g, " ").trim()
  if (!decoded) notFound()
  const query = await searchParams

  // Phase one: this browser just started the check, so stream it live.
  const liveId = Number.parseInt(query.s ?? "", 10)
  if (query.s && query.sid && Number.isInteger(liveId)) {
    return (
      <section className="px-4 py-10">
        <div className="mx-auto max-w-7xl">
          <Suspense fallback={<TableSkeleton />}>
            <LiveCheckView searchId={liveId} sid={query.sid} />
          </Suspense>
        </div>
      </section>
    )
  }

  // Phase two: someone already checked this name, show them the report.
  let search: Awaited<ReturnType<typeof searchByQuery>> | null = null
  try {
    search = await searchByQuery(decoded)
  } catch {
    search = null
  }
  const entry = search?.names.find(
    (candidate) => candidate.name.toLowerCase() === decoded.toLowerCase()
  )
  if (search && entry?.latest_check) {
    const checked = search.names
      .filter((candidate) => candidate.latest_check !== null)
      .map((candidate) => ({
        id: candidate.id,
        name: candidate.name,
        about: candidate.about,
        check: candidate.latest_check!,
      }))
      .sort((a, b) => b.check.overall_score - a.check.overall_score)
    const uncheckedNames = search.names
      .filter((candidate) => candidate.latest_check === null)
      .map((candidate) => candidate.name)
    const star = checked.find(
      (candidate) => candidate.name.toLowerCase() === decoded.toLowerCase()
    )!

    return (
      <>
        <section className="space-y-5 border-b px-4 py-10 sm:text-center">
          <Badge
            className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground"
            asChild
          >
            <p className="px-2 py-1 sm:px-3">
              Checked {formatDateTime(search.created_at)}, free to read
            </p>
          </Badge>
          <div className="space-y-3">
            <h1 className="font-heading text-4xl font-semibold md:text-5xl">
              Is <span className="text-primary">&ldquo;{decoded}&rdquo;</span>{" "}
              still free?
            </h1>
            <p className="mx-auto max-w-prose text-muted-foreground md:text-lg">
              It scored <strong>{star.check.overall_score} out of 100</strong>{" "}
              across domain availability, open social handles, and what AI
              models already associate with it. The full ranking of candidates
              from the same check sits below, and you can run a fresh check on
              any name of your own at the bottom of this page.
            </p>
          </div>
          <Button size="lg" asChild>
            <Link href="#check-yours">Check a name of your own</Link>
          </Button>
        </section>

        <section className="px-4 py-10">
          <div className="mx-auto max-w-7xl space-y-6">
            <ReportLeaderboard
              entries={checked}
              uncheckedNames={uncheckedNames}
              highlight={decoded}
            />
            <div
              id="check-yours"
              className="space-y-3 border-t pt-8 sm:mx-auto sm:max-w-prose sm:text-center"
            >
              <p className="font-heading text-2xl">Check a name of your own</p>
              <p className="text-sm text-muted-foreground">
                Pick the Name option, type a candidate, and we&apos;ll check it
                right here, no account needed.
              </p>
              <PrompterCta />
            </div>
          </div>
        </section>
      </>
    )
  }

  // Phase three: nobody has checked this name, so run the free first check.
  return (
    <section className="px-4 py-10">
      <DirectCheckKickoff name={decoded} />
    </section>
  )
}

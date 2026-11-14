import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import LiveSearch from "@/components/dashboard/live-search"
import { TableSkeleton } from "@/components/skeletons/shared"
import DirectCheckKickoff from "@/components/public/direct-check-kickoff"
import CopyPermalink from "@/components/public/copy-permalink"
import PrompterCta from "@/components/public/prompter-cta"
import NameStory from "@/components/public/name-story"
import FreeStrip from "@/components/public/free-strip"
import { answerLine, storyFrom } from "@/lib/name-facts"
import ResultHero, { toTier } from "@/components/public/result-hero"
import LetterField from "@/components/fields/letter-field"
import ReportLeaderboard from "@/components/public/report-leaderboard"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ApiError, getReport, searchByQuery, type CheckReport } from "@/lib/api"
import {
  getCachedSearchHeader,
  getCachedSearchResultsPage,
  getCachedSearchSummary,
} from "@/lib/dashboard-data"
import { getMeServer } from "@/lib/api-server"
import { formatDateTime, slugToName } from "@/lib/utils"
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
  const decoded = slugToName(name)
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
  sid: string | null
}) {
  let header, summary, data
  try {
    ;[header, summary, data] = await Promise.all([
      getCachedSearchHeader(searchId, sid ?? undefined),
      getCachedSearchSummary(searchId, sid ?? undefined),
      getCachedSearchResultsPage(
        searchId,
        false,
        "overall-score-high-to-low",
        sid ?? undefined,
        undefined
      ),
    ])
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound()
    throw error
  }

  return (
    <LiveSearch
      key={`${searchId}-${sid ?? "session"}`}
      searchId={searchId}
      sid={sid ?? undefined}
      availableOnly={false}
      sort="overall-score-high-to-low"
      homeHref="/"
      homeLabel="Home"
      initialHeader={header}
      initialSummary={summary}
      initialItems={data.items}
      initialPending={data.pending}
    />
  )
}

export default async function CheckNamePage({
  params,
  searchParams,
}: PageProps) {
  const { name } = await params
  const decoded = slugToName(name)
  if (!decoded) notFound()
  const query = await searchParams

  // Phase one: this browser just started the check, so stream it live.
  // A signed-in caller carries no sid — the session cookie resolves
  // their own search server-side — so the id alone is enough here;
  // without this, a fresh check fell through to the kickoff and ran a
  // second time under a second search.
  const liveId = Number.parseInt(query.s ?? "", 10)
  if (query.s && Number.isInteger(liveId)) {
    return (
      <section className="px-4 py-10">
        <div className="mx-auto max-w-7xl">
          <Suspense fallback={<TableSkeleton />}>
            <LiveCheckView searchId={liveId} sid={query.sid ?? null} />
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
    let report: CheckReport | null = null
    try {
      report = await getReport(star.check.public_id)
    } catch {
      report = null
    }
    const user = await getMeServer().catch(() => null)
    const others = checked.filter((candidate) => candidate.id !== star.id)

    return (
      <>
        <ResultHero
          eyebrow={`Checked ${formatDateTime(search.created_at)} · free to read`}
          title={
            <>
              Is <span className="text-primary">&ldquo;{decoded}&rdquo;</span>{" "}
              still free?
            </>
          }
          answer={
            report
              ? answerLine(report)
              : `It scored ${star.check.overall_score} out of 100 across domains, social usernames and chatbots.`
          }
          score={star.check.overall_score}
          tier={toTier(star.check.overall_risk_level)}
          actions={
            <>
              <Button size="lg" asChild>
                <Link href="#check-yours">Check your own name</Link>
              </Button>
              <span className="flex w-32">
                <CopyPermalink
                  name={decoded}
                  size="default"
                  variant="outline"
                />
              </span>
            </>
          }
        />

        {report ? (
          <>
            <NameStory
              story={storyFrom(star.name, star.check.overall_score, report)}
            />
            <FreeStrip report={report} />
          </>
        ) : null}

        <section className="px-4 pb-12 md:pb-16">
          <div className="mx-auto max-w-5xl space-y-10">
            <div className="flex flex-wrap items-center justify-between gap-4 border bg-card p-5">
              <div className="max-w-xl space-y-1">
                <p className="font-heading text-xl">
                  Want to know if {star.name} gets taken?
                </p>
                <p className="text-sm text-muted-foreground">
                  {user
                    ? `Add it to your watchlist. We recheck its domains and handles every few hours and email you the moment something changes. Watching is free.`
                    : `Sign in to watch it. We recheck its domains and handles every few hours and email you the moment something changes. Watching is free.`}
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href={user ? "/dashboard/playground/watchlist" : "/auth"}>
                  {user ? "Open your watchlist" : "Sign in to watch it"}
                </Link>
              </Button>
            </div>

            {others.length > 0 ? (
              <div className="space-y-4">
                <ReportLeaderboard
                  entries={checked}
                  uncheckedNames={uncheckedNames}
                  highlight={decoded}
                />
              </div>
            ) : null}
          </div>
        </section>

        <section
          id="check-yours"
          className="relative isolate scroll-mt-16 overflow-hidden border-t bg-primary/5 px-4 py-16 md:py-24"
        >
          <LetterField mode="claim" quiet fade="both" />
          <div className="mx-auto max-w-3xl space-y-5 text-center">
            <p className="text-[0.6875rem] font-semibold tracking-widest text-primary uppercase">
              Your turn
            </p>
            <h2 className="font-heading text-4xl text-balance sm:text-5xl">
              Check a name of your own.
            </h2>
            <p className="text-muted-foreground">
              Pick Name, type a candidate, and we&apos;ll run the same checks
              right here. No account needed.
            </p>
            <PrompterCta />
          </div>
        </section>
      </>
    )
  }

  // Phase three: nobody has checked this name, so run the free first check.
  return (
    <section className="px-4 py-16 md:py-24">
      <DirectCheckKickoff name={decoded} />
    </section>
  )
}

import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import ReportLeaderboard from "@/components/public/report-leaderboard"
import CopyPermalink from "@/components/public/copy-permalink"
import { Button } from "@/components/ui/button"
import { JsonLd } from "@/components/app/json-ld"
import PrompterCta from "@/components/public/prompter-cta"
import NameStory from "@/components/public/name-story"
import FreeStrip from "@/components/public/free-strip"
import { answerLine, storyFrom } from "@/lib/name-facts"
import ResultHero, { toTier } from "@/components/public/result-hero"
import LetterField from "@/components/fields/letter-field"
import { ApiError, getReport, searchByQuery, type CheckReport } from "@/lib/api"
import { getMeServer } from "@/lib/api-server"
import { formatDateTime, slugToName } from "@/lib/utils"
import { OG_PATH, SITE_URL } from "@/lib/site"

// Not statically cacheable: the page reads the session cookie through
// getMeServer, so every request renders fresh. No revalidate here.

type PageProps = { params: Promise<{ query: string }> }

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { query } = await params
  const term = slugToName(query)
  return {
    title: `Name ideas for "${term}", scored and ranked`,
    description: `A real Unclaimed by AI report: name candidates for "${term}", each scored on domain availability, open social handles, and AI associations.`,
    alternates: { canonical: `/searches/${query}` },
    openGraph: {
      title: `Name ideas for "${term}", scored`,
      description: `Domain, social handle, and AI association results for "${term}".`,
      url: `${SITE_URL}/searches/${query}`,
      type: "website",
      images: [OG_PATH],
    },
    twitter: {
      card: "summary_large_image",
      images: [OG_PATH],
    },
  }
}

export default async function PublicSearchPage({ params }: PageProps) {
  const { query } = await params
  const term = slugToName(query)

  let search
  try {
    search = await searchByQuery(term)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound()
    throw error
  }

  const checked = search.names
    .filter((name) => name.latest_check !== null)
    .map((name) => ({
      name,
      check: name.latest_check!,
    }))
    .sort((a, b) => b.check.overall_score - a.check.overall_score)
  const unchecked = search.names.filter((name) => name.latest_check === null)
  const average = checked.length
    ? Math.round(
        checked.reduce((sum, entry) => sum + entry.check.overall_score, 0) /
          checked.length
      )
    : null
  const topPick = checked[0] ?? null
  let topReport: CheckReport | null = null
  if (topPick) {
    try {
      topReport = await getReport(topPick.check.public_id)
    } catch {
      topReport = null
    }
  }
  const user = await getMeServer().catch(() => null)

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `Name check results for "${term}"`,
          url: `${SITE_URL}/searches/${query}`,
          numberOfItems: search.names.length,
        }}
      />
      <ResultHero
        eyebrow={`Public report · checked ${formatDateTime(search.created_at)}`}
        title={
          <>
            {search.names.length} name ideas for{" "}
            <span className="text-primary">&ldquo;{term}&rdquo;</span>
          </>
        }
        answer={
          topPick && topReport
            ? `${topPick.name.name} came out on top with ${topPick.check.overall_score} out of 100. ${answerLine(topReport)}`
            : "Names were generated for this idea, but none have been scored yet."
        }
        score={topPick?.check.overall_score ?? null}
        tier={topPick ? toTier(topPick.check.overall_risk_level) : undefined}
        actions={
          <>
            <Button size="lg" asChild>
              <Link href="#check-yours">Check your own name</Link>
            </Button>
            {topPick ? (
              <span className="flex w-32">
                <CopyPermalink
                  name={topPick.name.name}
                  size="default"
                  variant="outline"
                />
              </span>
            ) : null}
          </>
        }
      />

      {topPick && topReport ? (
        <>
          <div className="px-4 pt-12">
            <div className="mx-auto max-w-6xl space-y-2">
              <h2 className="font-heading text-3xl">
                The top pick, {topPick.name.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                {checked.length} of {search.names.length} names scored
                {average !== null ? `, average ${average} out of 100` : ""}.
                Here is what sits behind the leader&apos;s score.
              </p>
            </div>
          </div>
          <NameStory
            story={storyFrom(
              topPick.name.name,
              topPick.check.overall_score,
              topReport
            )}
          />
          <FreeStrip report={topReport} />
        </>
      ) : null}

      <section className="px-4 pb-12 md:pb-16">
        <div className="mx-auto max-w-5xl space-y-12">
          {topPick && topReport ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border bg-card p-5">
                <p className="max-w-xl text-sm text-muted-foreground">
                  {user
                    ? `Add ${topPick.name.name} to your watchlist. We recheck its domains and handles every few hours and email you the moment something changes. Watching is free.`
                    : `Sign in to watch ${topPick.name.name}. We recheck its domains and handles every few hours and email you the moment something changes. Watching is free.`}
                </p>
                <Button variant="outline" asChild>
                  <Link
                    href={user ? "/dashboard/playground/watchlist" : "/auth"}
                  >
                    {user ? "Open your watchlist" : "Sign in to watch it"}
                  </Link>
                </Button>
              </div>
            </div>
          ) : null}

          {checked.length > 0 ? (
            <ReportLeaderboard
              entries={checked.map((entry) => ({
                id: entry.name.id,
                name: entry.name.name,
                about: entry.name.about,
                check: entry.check,
              }))}
              uncheckedNames={unchecked.map((name) => name.name)}
            />
          ) : (
            <div className="border border-dashed p-10 text-center">
              <p className="font-heading text-2xl">
                No completed checks for this idea yet
              </p>
              <p className="mx-auto mt-2 max-w-prose text-sm text-muted-foreground">
                Names were generated for it, but none have been scored so far.
                Run your own check below to see live results in under a minute.
              </p>
            </div>
          )}
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
            Describe what you&apos;re building, or type a name you&apos;re
            considering. We&apos;ll check it right here, no account needed.
          </p>
          <PrompterCta defaultValue={term} />
        </div>
      </section>
    </>
  )
}

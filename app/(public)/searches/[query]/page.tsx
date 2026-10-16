import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import ReportLeaderboard from "@/components/public/report-leaderboard"
import CopyPermalink from "@/components/public/copy-permalink"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { JsonLd } from "@/components/app/json-ld"
import PrompterCta from "@/components/public/prompter-cta"
import FreeDomainChips from "@/components/public/free-domain-chips"
import { ApiError, getReport, searchByQuery, type CheckReport } from "@/lib/api"
import { getMeServer } from "@/lib/api-server"
import { formatDateTime } from "@/lib/utils"
import { OG_PATH, SITE_URL } from "@/lib/site"

export const revalidate = 3600

type PageProps = { params: Promise<{ query: string }> }

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { query } = await params
  const term = decodeURIComponent(query).replace(/-/g, " ")
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
  const term = decodeURIComponent(query).replace(/-/g, " ")

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
  const freeDomains =
    topReport?.domains.filter((domain) => domain.status === "available") ?? []
  const claimedHandles =
    topReport?.socials.filter((social) => social.status !== "available") ?? []
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
      <section className="space-y-5 border-b px-4 py-10 sm:text-center">
        <Badge
          className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground"
          asChild
        >
          <p className="px-2 py-1 sm:px-3">
            Public report, checked {formatDateTime(search.created_at)}
          </p>
        </Badge>
        <div className="space-y-3">
          <h1 className="font-heading text-4xl font-semibold md:text-5xl">
            {search.names.length} name ideas for{" "}
            <span className="text-primary">&ldquo;{term}&rdquo;</span>, scored
          </h1>
          <p className="mx-auto max-w-prose text-muted-foreground md:text-lg">
            Someone ran this brief through Unclaimed by AI. Every candidate
            below was scored from 0 to 100 across three checks: how many domain
            extensions are still free, how many social handles are still open,
            and whether AI models already know the name. Higher scores are safer
            bets.
            {checked.length > 0 && average !== null
              ? ` The top pick scored ${
                  checked[0].check.overall_score
                }, and the average across all checked names is ${average}.`
              : ""}
          </p>
        </div>
        <div className="flex items-center gap-2 mx-auto max-w-3xl justify-center">
          <Button size="lg" asChild className="flex-1">
            <Link href="#check-yours">Check your own name</Link>
          </Button>
          {checked.length > 0 ? (
            <CopyPermalink
              name={checked[0].name.name}
              size="default"
              variant="outline"
            />
          ) : null}
        </div>
      </section>

      <section className="border-b px-4 py-6">
        <div className="mx-auto grid max-w-7xl gap-px border bg-border sm:grid-cols-3">
          <div className="bg-background p-4">
            <p className="text-sm font-medium">Domains</p>
            <p className="mt-1 text-sm text-muted-foreground">
              How many of the checked domain extensions are still free to
              register.
            </p>
          </div>
          <div className="bg-background p-4">
            <p className="text-sm font-medium">Handles</p>
            <p className="mt-1 text-sm text-muted-foreground">
              How many checked social platforms still have the handle open.
            </p>
          </div>
          <div className="bg-background p-4">
            <p className="text-sm font-medium">AI association</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Whether AI models already connect this name to something that
              exists.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 py-10">
        <div className="mx-auto max-w-7xl space-y-6">
          {topPick && topReport ? (
            <div className="space-y-3">
              <div className="space-y-1">
                <h2 className="font-heading text-2xl font-semibold md:text-3xl">
                  A closer look at the top pick, {topPick.name.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  The details behind its {topPick.check.overall_score} out of
                  100, from the same check.
                </p>
              </div>
              <div className="grid gap-px border bg-border md:grid-cols-2">
                <div className="space-y-2 bg-background p-4">
                  <p className="text-sm font-medium">
                    Free to register right now
                  </p>
                  <FreeDomainChips domains={freeDomains} />
                </div>
                <div className="space-y-2 bg-background p-4">
                  <p className="text-sm font-medium">Handles already claimed</p>
                  {claimedHandles.length ? (
                    <ul className="space-y-1">
                      {claimedHandles.slice(0, 6).map((social) => (
                        <li
                          key={social.platform}
                          className="font-mono text-xs text-muted-foreground line-through decoration-border"
                        >
                          @{social.handle} on {social.platform}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Every checked handle is still open.
                    </p>
                  )}
                  {claimedHandles.length > 6 ? (
                    <p className="text-xs text-muted-foreground">
                      {claimedHandles.length - 6} more claimed across the
                      checked platforms.
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border p-4">
                <p className="max-w-prose text-sm text-muted-foreground">
                  {user
                    ? `Star ${topPick.name.name} on your watchlist and we recheck its domains and handles every few hours, emailing you the moment something changes. Watching is free.`
                    : `Sign in to star ${topPick.name.name}: we recheck its domains and handles every few hours and email you the moment something changes. Watching is free.`}
                </p>
                <Button asChild>
                  <Link href={user ? "/dashboard/watch" : "/auth"}>
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
                No completed checks for this brief yet
              </p>
              <p className="mx-auto mt-2 max-w-prose text-sm text-muted-foreground">
                Names were generated for it, but none have been scored so far.
                Run your own check below to see live results in under a minute.
              </p>
            </div>
          )}

          <div
            id="check-yours"
            className="space-y-3 border-t pt-8 sm:mx-auto sm:max-w-prose sm:text-center"
          >
            <p className="font-heading text-2xl">Check a name of your own</p>
            <p className="text-sm text-muted-foreground">
              Describe what you&apos;re building, or type a name you&apos;re
              considering. We&apos;ll check it right here, no account needed.
            </p>
            <PrompterCta defaultValue={term} />
          </div>
        </div>
      </section>
    </>
  )
}

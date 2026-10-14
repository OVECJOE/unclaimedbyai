import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { TierBadge, type Tier } from "@/components/tier-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { JsonLd } from "@/components/app/json-ld"
import PrompterCta from "@/components/public/prompter-cta"
import { ApiError, searchByQuery } from "@/lib/api"
import { formatDateTime } from "@/lib/utils"
import { OG_PATH, SITE_URL } from "@/lib/site"

export const revalidate = 3600

type PageProps = { params: Promise<{ query: string }> }

function toTier(level: "excellent" | "good" | "okay" | "poor"): Tier {
  return (level.charAt(0).toUpperCase() + level.slice(1)) as Tier
}

const AI_VERDICT_LABEL: Record<string, string> = {
  excellent: "AI clean",
  good: "AI light overlap",
  okay: "AI overlap",
  poor: "AI collision",
}

const AI_VERDICT_TONE: Record<string, string> = {
  excellent:
    "border-green-600/30 text-green-700 dark:border-green-400/30 dark:text-green-400",
  good: "border-primary/40 text-primary",
  okay: "border-amber-500/40 text-amber-700 dark:text-amber-500",
  poor: "border-destructive/40 text-destructive",
}

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
            below was scored from 0 to 100 across three checks: how many
            domain extensions are still free, how many social handles are
            still open, and whether AI models already know the name. Higher
            scores are safer bets.
            {checked.length > 0 && average !== null
              ? ` The top pick scored ${
                  checked[0].check.overall_score
                }, and the average across all checked names is ${average}.`
              : ""}
          </p>
        </div>
        <Button size="lg" asChild>
          <Link href="#check-yours">Check your own name</Link>
        </Button>
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
          {checked.length > 0 ? (
            <>
              <div className="space-y-1">
                <h2 className="font-heading text-2xl font-semibold md:text-3xl">
                  The names, ranked
                </h2>
                <p className="text-sm text-muted-foreground">
                  Safest to build on first. Each row shows the score, the
                  verdict behind it, and what the three checks found.
                </p>
              </div>
              <ol className="divide-y divide-border border">
                {checked.map((entry, index) => {
                  const pillars = Object.fromEntries(
                    (entry.check.pillars ?? []).map((pillar) => [
                      pillar.pillar_type,
                      pillar,
                    ])
                  )
                  const domains = pillars.domain
                  const handles = pillars.social
                  const ai = pillars.ai_association
                  return (
                    <li
                      key={entry.name.id}
                      className="flex items-center gap-4 p-4 sm:p-5"
                    >
                      <span
                        aria-hidden="true"
                        className="w-6 shrink-0 text-end font-mono text-sm text-muted-foreground tabular-nums"
                      >
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <span className="flex flex-wrap items-center gap-2">
                          <h3 className="font-heading text-xl">
                            {entry.name.name}
                          </h3>
                          <TierBadge
                            tier={toTier(entry.check.overall_risk_level)}
                          />
                        </span>
                        <p className="max-w-prose text-sm text-muted-foreground">
                          {entry.check.judgment}
                        </p>
                        {entry.name.about ? (
                          <p className="max-w-prose text-sm italic text-muted-foreground">
                            {entry.name.about}
                          </p>
                        ) : null}
                        <span className="flex flex-wrap gap-1.5">
                          {domains ? (
                            <Badge
                              variant="outline"
                              className="text-xs font-normal"
                            >
                              Domains {domains.items_passed}/
                              {domains.items_checked} free
                            </Badge>
                          ) : null}
                          {handles ? (
                            <Badge
                              variant="outline"
                              className="text-xs font-normal"
                            >
                              Handles {handles.items_passed}/
                              {handles.items_checked} open
                            </Badge>
                          ) : null}
                          {ai ? (
                            <Badge
                              className={`text-xs font-normal ${
                                AI_VERDICT_TONE[ai.verdict] ?? ""
                              }`}
                            >
                              {AI_VERDICT_LABEL[ai.verdict] ?? "AI checked"}
                            </Badge>
                          ) : null}
                        </span>
                      </div>
                      <div className="shrink-0 text-end">
                        <p className="font-heading text-3xl leading-none font-semibold tabular-nums">
                          {entry.check.overall_score}
                        </p>
                        <p className="text-xs text-muted-foreground">/100</p>
                      </div>
                    </li>
                  )
                })}
              </ol>
            </>
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

          {unchecked.length > 0 ? (
            <p className="text-sm text-muted-foreground">
              Also generated but not checked yet:{" "}
              {unchecked.map((name, index) => (
                <span key={name.id}>
                  {index > 0 ? ", " : ""}
                  {name.name}
                </span>
              ))}
              .
            </p>
          ) : null}

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

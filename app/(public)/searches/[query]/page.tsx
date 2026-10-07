import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ScoreGauge } from "@/components/app/score-gauge"
import { TierBadge, type Tier } from "@/components/tier-badge"
import ScoreSummary from "@/components/dashboard/score-summary"
import GradingDistribution from "@/components/dashboard/grading-distribution"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { JsonLd } from "@/components/app/json-ld"
import { ApiError, getReport, searchByQuery, type CheckReport } from "@/lib/api"
import { toNameResult } from "@/lib/dashboard-data"
import { SITE_URL } from "@/lib/site"

export const revalidate = 3600

type PageProps = { params: Promise<{ query: string }> }

function toTier(level: "excellent" | "good" | "okay" | "poor"): Tier {
  return (level.charAt(0).toUpperCase() + level.slice(1)) as Tier
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { query } = await params
  const term = decodeURIComponent(query).replace(/-/g, " ")
  return {
    title: `Is "${term}" taken? Domain, handle & AI check results`,
    description: `Live availability results for "${term}": domain registrations, social handle checks, and AI association screening.`,
    alternates: { canonical: `/searches/${query}` },
    openGraph: {
      title: `Is "${term}" taken?`,
      description: `Domain, social handle, and AI association results for "${term}".`,
      url: `${SITE_URL}/searches/${query}`,
    },
  }
}

async function latestReport(
  publicId: string | null
): Promise<CheckReport | null> {
  if (!publicId) return null
  try {
    return await getReport(publicId)
  } catch {
    return null
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

  const checked = await Promise.all(
    search.names.map(async (name) => ({
      name,
      report: await latestReport(name.latest_check?.public_id ?? null),
    }))
  )
  const withReports = checked.filter(
    (entry): entry is typeof entry & { report: CheckReport } =>
      entry.report !== null
  )
  const results = withReports.flatMap((entry) => {
    const mapped = toNameResult(entry.name, entry.report)
    return mapped ? [mapped] : []
  })
  const topPick = results[0]
    ? {
        name: results[0].name,
        logo: results[0].logo,
      }
    : undefined
  const average = results.length
    ? Math.round(
        results.reduce((sum, result) => sum + result.score, 0) / results.length
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
          <p className="px-2 py-1 sm:px-3">Live availability results</p>
        </Badge>
        <div className="space-y-3">
          <h1 className="font-heading text-4xl font-semibold md:text-5xl">
            Is <span className="text-primary">&ldquo;{term}&rdquo;</span>{" "}
            actually free?
          </h1>
          <p className="mx-auto max-w-prose text-muted-foreground md:text-lg">
            {search.names.length} names checked
            {average !== null ? ` · average score ${average}/100` : ""} across
            domains, social handles, and AI associations.
          </p>
        </div>
        <Button size="lg" asChild>
          <Link href="/auth">Check your own name</Link>
        </Button>
      </section>

      <section className="px-4 py-10">
        <div className="mx-auto max-w-7xl space-y-4">
          <div className="flex w-full flex-col gap-6 md:flex-row">
            <div className="min-w-0 flex-1">
              <ScoreSummary results={results} topPick={topPick} />
            </div>
            <div className="min-w-0 flex-1">
              <GradingDistribution results={results} />
            </div>
          </div>
          {withReports.map(({ name, report }) => (
            <article key={name.id} className="space-y-4 border p-4 sm:p-6">
              <div className="flex flex-wrap items-center gap-4">
                <ScoreGauge
                  score={report.overall_score}
                  tier={toTier(report.overall_risk_level)}
                />
                <div className="space-y-1">
                  <h2 className="font-heading text-2xl">{name.name}</h2>
                  <TierBadge tier={toTier(report.overall_risk_level)} />
                  <p className="max-w-prose text-sm text-muted-foreground">
                    {report.judgment}
                  </p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {report.pillars.map((pillar) => (
                  <div key={pillar.pillar_type} className="border p-3">
                    <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                      {pillar.pillar_type.replace("_", " ")}
                    </p>
                    <p className="font-heading text-2xl">
                      {pillar.score}
                      <span className="text-sm text-muted-foreground">
                        /100
                      </span>
                    </p>
                  </div>
                ))}
              </div>
              <details className="border">
                <summary className="cursor-pointer px-4 py-3 text-sm font-medium">
                  Full check details
                </summary>
                <div className="space-y-4 border-t px-4 py-4">
                  <div>
                    <h3 className="font-heading text-lg">Domains</h3>
                    <ul className="divide-y divide-border">
                      {report.domains.map((domain) => (
                        <li
                          key={domain.domain}
                          className="flex items-center justify-between py-1.5 font-mono text-sm"
                        >
                          <span>{domain.domain}</span>
                          <span>{domain.status.replace("_", " ")}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-heading text-lg">Handles</h3>
                    <ul className="divide-y divide-border">
                      {report.socials.map((social) => (
                        <li
                          key={social.platform}
                          className="flex items-center justify-between py-1.5 text-sm"
                        >
                          <span>
                            {social.platform}{" "}
                            <span className="text-muted-foreground">
                              @{social.handle}
                            </span>
                          </span>
                          <span>{social.status.replace("_", " ")}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-heading text-lg">AI associations</h3>
                    <ul className="space-y-2">
                      {report.ai.map((row, index) => (
                        <li
                          key={`${row.model ?? "unknown"}-${index}`}
                          className="border p-3 text-sm"
                        >
                          <p className="font-mono text-xs text-muted-foreground">
                            {row.model ?? "unknown model"}
                          </p>
                          <p>
                            {row.error ??
                              row.association ??
                              "No strong association"}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </details>
            </article>
          ))}
          {search.names
            .filter(
              (name) => !withReports.some((entry) => entry.name.id === name.id)
            )
            .map((name) => (
              <article key={name.id} className="border p-4 sm:p-6">
                <h2 className="font-heading text-2xl">{name.name}</h2>
                <p className="text-sm text-muted-foreground">
                  No completed checks for this name yet.
                </p>
              </article>
            ))}
          <p className="text-center">
            <Button size="lg" asChild>
              <Link href="/auth">Check your own name</Link>
            </Button>
          </p>
        </div>
      </section>
    </>
  )
}

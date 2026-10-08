import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { formatDateTime } from "@/lib/utils"
import { DotIcon, ArrowAllDirectionIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { notFound, redirect } from "next/navigation"
import { Suspense } from "react"
import GradingDistribution from "@/components/dashboard/grading-distribution"
import ScoreSummary from "@/components/dashboard/score-summary"
import ResultsTable from "@/components/dashboard/results-table"
import SearchResultsToolbar from "@/components/dashboard/search-results-toolbar"
import NameCheckPanel from "@/components/dashboard/name-check-panel"
import {
  SummarySkeleton,
  TableSkeleton,
} from "@/components/dashboard/skeletons"
import { getMeServer, apiServer } from "@/lib/api-server"
import { ApiError, type SearchDetail } from "@/lib/api"
import { getSearchResults } from "@/lib/dashboard-data"

export const dynamic = "force-dynamic"

async function SearchHeader({ searchId }: { searchId: number }) {
  let search: SearchDetail
  try {
    search = await apiServer<SearchDetail>(`/api/v1/searches/${searchId}`)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound()
    if (error instanceof ApiError && error.status === 401) redirect("/auth")
    throw error
  }

  return (
    <>
      <Breadcrumb>
        <BreadcrumbList className="flex-nowrap">
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard" className="text-primary">
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <HugeiconsIcon icon={ArrowAllDirectionIcon} />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/history" className="text-primary">
              History
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <HugeiconsIcon icon={ArrowAllDirectionIcon} />
          </BreadcrumbSeparator>
          <BreadcrumbItem className="min-w-0">
            <BreadcrumbPage className="truncate">{search.query}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="space-y-1">
        <h1 className="font-heading text-4xl font-semibold md:text-5xl">
          Results for &apos;
          <span className="text-primary">{search.query}</span>&apos;
        </h1>
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-xs text-muted-foreground">
            {search.names.length} names generated
          </span>
          <HugeiconsIcon icon={DotIcon} />
          <span className="text-xs text-muted-foreground">
            {formatDateTime(search.created_at)}
          </span>
        </div>
      </div>
    </>
  )
}

async function SearchResults({ searchId }: { searchId: number }) {
  const { results } = await getSearchResults(searchId).catch((error) => {
    if (error instanceof ApiError && error.status === 404) notFound()
    if (error instanceof ApiError && error.status === 401) redirect("/auth")
    throw error
  })
  const topPick = results[0]
    ? { name: results[0].name, logo: results[0].logo }
    : undefined

  return (
    <div className="flex w-full flex-col gap-6 md:flex-row">
      <div className="min-w-0 flex-1">
        <ScoreSummary results={results} topPick={topPick} />
      </div>
      <div className="min-w-0 flex-1">
        <GradingDistribution results={results} />
      </div>
    </div>
  )
}

async function UncheckedNames({ searchId }: { searchId: number }) {
  const { search, results } = await getSearchResults(searchId).catch(
    (error) => {
      if (error instanceof ApiError && error.status === 404) notFound()
      if (error instanceof ApiError && error.status === 401) redirect("/auth")
      throw error
    }
  )
  const checkedIds = new Set(results.map((result) => result.name.toLowerCase()))
  const unchecked = search.names.filter(
    (name) => !checkedIds.has(name.name.toLowerCase())
  )

  if (!unchecked.length) return null

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-2xl font-semibold">
        Awaiting first check
      </h2>
      {unchecked.map((name) => (
        <NameCheckPanel
          key={name.id}
          searchId={search.id}
          nameId={name.id}
          name={name.name}
        />
      ))}
    </div>
  )
}

async function SearchTable({ searchId }: { searchId: number }) {
  const { results } = await getSearchResults(searchId).catch((error) => {
    if (error instanceof ApiError && error.status === 404) notFound()
    if (error instanceof ApiError && error.status === 401) redirect("/auth")
    throw error
  })

  return (
    <>
      <SearchResultsToolbar />
      <ResultsTable results={results} searchId={String(searchId)} />
    </>
  )
}

export default async function HistorySearchPage({
  params,
}: {
  params: Promise<{ searchId: string }>
}) {
  const user = await getMeServer().catch(() => null)
  if (!user) redirect("/auth")

  const { searchId } = await params
  const id = Number.parseInt(searchId, 10)
  if (!Number.isInteger(id)) notFound()

  return (
    <>
      <section className="px-4 pt-10 pb-5">
        <div className="mx-auto max-w-7xl space-y-8">
          <Suspense
            fallback={
              <div className="space-y-3" aria-label="Loading">
                <div className="h-9 w-2/3 animate-pulse bg-muted" />
                <div className="h-4 w-1/3 animate-pulse bg-muted" />
              </div>
            }
          >
            <SearchHeader searchId={id} />
          </Suspense>
          <Suspense fallback={<SummarySkeleton />}>
            <SearchResults searchId={id} />
          </Suspense>
        </div>
      </section>
      <section className="px-4 py-10">
        <div className="mx-auto max-w-7xl space-y-5">
          <Suspense fallback={<TableSkeleton />}>
            <SearchTable searchId={id} />
          </Suspense>
          <Suspense fallback={null}>
            <UncheckedNames searchId={id} />
          </Suspense>
        </div>
      </section>
    </>
  )
}

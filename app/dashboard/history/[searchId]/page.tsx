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
import {
  SummarySkeleton,
  TableSkeleton,
} from "@/components/dashboard/skeletons"
import { ApiError, type SearchDetail } from "@/lib/api"
import {
  getCachedSearchDetail,
  getCachedSearchResults,
} from "@/lib/dashboard-data"

export const dynamic = "force-dynamic"

async function SearchContent({ searchId }: { searchId: number }) {
  let search: SearchDetail
  try {
    search = await getCachedSearchDetail(searchId)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound()
    if (error instanceof ApiError && error.status === 401) redirect("/auth")
    throw error
  }
  const { results } = await getCachedSearchResults(searchId).catch((error) => {
    if (error instanceof ApiError && error.status === 404) notFound()
    if (error instanceof ApiError && error.status === 401) redirect("/auth")
    throw error
  })
  const topPick = results[0]
    ? { name: results[0].name, logo: results[0].logo }
    : undefined

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
      <div className="flex w-full flex-col gap-6 md:flex-row">
        <div className="min-w-0 flex-1">
          <ScoreSummary results={results} topPick={topPick} />
        </div>
        <div className="min-w-0 flex-1">
          <GradingDistribution results={results} />
        </div>
      </div>
    </>
  )
}

async function SearchTableBlock({ searchId }: { searchId: number }) {
  const { search, results } = await getCachedSearchResults(searchId).catch(
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

  return (
    <>
      <SearchResultsToolbar />
      <ResultsTable
        results={results}
        searchId={String(searchId)}
        pending={unchecked.map((name) => ({ id: name.id, name: name.name }))}
      />
    </>
  )
}

export default async function HistorySearchPage({
  params,
}: {
  params: Promise<{ searchId: string }>
}) {
  const { searchId } = await params
  const id = Number.parseInt(searchId, 10)
  if (!Number.isInteger(id)) notFound()

  return (
    <>
      <section className="px-4 pt-10 pb-5">
        <div className="mx-auto max-w-7xl space-y-8">
          <Suspense
            fallback={
              <div className="space-y-8">
                <div className="space-y-3" aria-label="Loading">
                  <div className="h-9 w-2/3 animate-pulse bg-muted" />
                  <div className="h-4 w-1/3 animate-pulse bg-muted" />
                </div>
                <SummarySkeleton />
              </div>
            }
          >
            <SearchContent searchId={id} />
          </Suspense>
        </div>
      </section>
      <section className="px-4 py-10">
        <div className="mx-auto max-w-7xl space-y-5">
          <Suspense fallback={<TableSkeleton />}>
            <SearchTableBlock searchId={id} />
          </Suspense>
        </div>
      </section>
    </>
  )
}

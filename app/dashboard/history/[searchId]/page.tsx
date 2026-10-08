import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { formatDateTime } from "@/lib/utils"
import { DotIcon, ChevronRightIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { notFound, redirect } from "next/navigation"
import { Suspense } from "react"
import GradingDistribution from "@/components/dashboard/grading-distribution"
import ScoreSummary from "@/components/dashboard/score-summary"
import ResultsTable from "@/components/dashboard/results-table"
import RateLimited from "@/components/dashboard/rate-limited"
import SearchResultsToolbar from "@/components/dashboard/search-results-toolbar"
import {
  SummarySkeleton,
  TableSkeleton,
} from "@/components/dashboard/skeletons"
import { ApiError } from "@/lib/api"
import {
  getCachedSearchHeader,
  getCachedSearchResultsPage,
  getCachedSearchSummary,
  toNameResultFromPayload,
} from "@/lib/dashboard-data"

export const dynamic = "force-dynamic"

async function SearchHeaderBlock({ searchId }: { searchId: number }) {
  let header
  try {
    header = await getCachedSearchHeader(searchId)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound()
    if (error instanceof ApiError && error.status === 401) redirect("/auth")
    if (error instanceof ApiError && error.status === 429)
      return <RateLimited />
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
            <HugeiconsIcon icon={ChevronRightIcon} />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/history" className="text-primary">
              History
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <HugeiconsIcon icon={ChevronRightIcon} />
          </BreadcrumbSeparator>
          <BreadcrumbItem className="min-w-0">
            <BreadcrumbPage className="truncate">{header.query}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="space-y-1">
        <h1 className="font-heading text-4xl font-semibold md:text-5xl">
          Results for &apos;
          <span className="text-primary">{header.query}</span>&apos;
        </h1>
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-xs text-muted-foreground">
            {header.name_count} names generated
          </span>
          <HugeiconsIcon icon={DotIcon} />
          <span className="text-xs text-muted-foreground">
            {formatDateTime(header.created_at)}
          </span>
        </div>
      </div>
    </>
  )
}

async function SearchSummaryBlock({ searchId }: { searchId: number }) {
  let summary
  try {
    summary = await getCachedSearchSummary(searchId)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound()
    if (error instanceof ApiError && error.status === 401) redirect("/auth")
    if (error instanceof ApiError && error.status === 429)
      return <RateLimited />
    throw error
  }

  return (
    <div className="flex w-full flex-col gap-6 md:flex-row">
      <div className="min-w-0 flex-1">
        <ScoreSummary summary={summary} />
      </div>
      <div className="min-w-0 flex-1">
        <GradingDistribution summary={summary} />
      </div>
    </div>
  )
}

async function SearchTableBlock({
  searchId,
  availableOnly,
  sort,
  q,
}: {
  searchId: number
  availableOnly: boolean
  sort: string
  q?: string
}) {
  let data
  try {
    data = await getCachedSearchResultsPage(
      searchId,
      availableOnly,
      sort,
      undefined,
      q
    )
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound()
    if (error instanceof ApiError && error.status === 401) redirect("/auth")
    if (error instanceof ApiError && error.status === 429)
      return <RateLimited />
    throw error
  }
  const results = data.items.map(toNameResultFromPayload)

  return (
    <>
      <SearchResultsToolbar />
      <ResultsTable
        results={results}
        searchId={String(searchId)}
        pending={data.pending}
      />
    </>
  )
}

export default async function HistorySearchPage({
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
  const availableOnly = query.available === "1"
  const sort = query.sort || "overall-score-high-to-low"
  const q = query.q || undefined

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
            <SearchHeaderBlock searchId={id} />
          </Suspense>
          <Suspense fallback={<SummarySkeleton />}>
            <SearchSummaryBlock searchId={id} />
          </Suspense>
        </div>
      </section>
      <section className="px-4 py-10">
        <div className="mx-auto max-w-7xl space-y-5">
          <Suspense fallback={<TableSkeleton />}>
            <SearchTableBlock
              searchId={id}
              availableOnly={availableOnly}
              sort={sort}
              q={q}
            />
          </Suspense>
        </div>
      </section>
    </>
  )
}

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ITEMS_PER_PAGE } from "@/lib/constants"
import { clampPage } from "@/lib/pagination"
import { SearchResultCard } from "@/components/dashboard/search-result-card"
import { PaginationWindow } from "@/components/ui/pagination-window"
import SearchHistoryToolbar from "@/components/dashboard/search-history-toolbar"
import { HugeiconsIcon } from "@hugeicons/react"
import { ChevronRightIcon } from "@hugeicons/core-free-icons"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { toCardProps } from "@/lib/dashboard-data"
import RateLimited from "@/components/dashboard/rate-limited"
import { ApiError, type SearchList } from "@/lib/api"
import { ListSkeleton } from "@/components/dashboard/skeletons"
import { apiServer } from "@/lib/api-server"

export const dynamic = "force-dynamic"

export type HistoryFilters = {
  q?: string
  sort?: string
  from?: string
  to?: string
  quality?: string
}

function historyQuery(
  page: number,
  pageSize: number,
  filters: HistoryFilters
): string {
  const params = new URLSearchParams()
  params.set("page", String(page))
  params.set("page_size", String(pageSize))
  if (filters.q) params.set("q", filters.q)
  if (filters.sort) params.set("sort", filters.sort)
  if (filters.from) params.set("from", filters.from)
  if (filters.to) params.set("to", filters.to)
  if (filters.quality) params.set("quality", filters.quality)
  return `/api/v1/searches?${params.toString()}`
}

function pageHref(page: number, filters: HistoryFilters): string {
  const params = new URLSearchParams()
  if (page > 1) params.set("page", String(page))
  if (filters.q) params.set("q", filters.q)
  if (filters.sort) params.set("sort", filters.sort)
  if (filters.from) params.set("from", filters.from)
  if (filters.to) params.set("to", filters.to)
  if (filters.quality) params.set("quality", filters.quality)
  const query = params.toString()
  return query ? `/dashboard/history?${query}` : "/dashboard/history"
}

async function HistoryList({
  page,
  pageSize,
  filters,
}: {
  page: number
  pageSize: number
  filters: HistoryFilters
}) {
  let data: SearchList
  try {
    data = await apiServer<SearchList>(historyQuery(page, pageSize, filters))
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/auth")
    if (error instanceof ApiError && error.status === 429) {
      return <RateLimited />
    }
    throw error
  }
  const pageCount = Math.max(1, Math.ceil(data.total / pageSize))
  const currentPage = clampPage(page, pageCount)
  const items =
    currentPage === page
      ? data.items
      : ((
          await apiServer<SearchList>(
            historyQuery(currentPage, pageSize, filters)
          ).catch((error) => {
            if (error instanceof ApiError && error.status === 401)
              redirect("/auth")
            if (error instanceof ApiError && error.status === 429) return null
            throw error
          })
        )?.items ?? [])
  const cards = items.map((item) => toCardProps(item))

  return (
    <div className="space-y-5">
      {cards.length ? (
        <div className="grid grid-cols-1 gap-3 divide-y divide-border">
          {cards.map((card) => (
            <SearchResultCard key={card.id} {...card} />
          ))}
        </div>
      ) : (
        <div className="space-y-3 border border-dashed p-6 text-center">
          <p className="text-muted-foreground">
            No searches match. Describe what you&apos;re building and we&apos;ll
            generate names for it.
          </p>
          <Button asChild>
            <Link href="/dashboard">Run your first check</Link>
          </Button>
        </div>
      )}
      <PaginationWindow
        currentPage={currentPage}
        pageCount={pageCount}
        getHref={(target) => pageHref(target, filters)}
      />
    </div>
  )
}

export default async function SearchHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>
}) {
  const params = await searchParams
  const requested = Number.parseInt(params.page ?? "", 10)
  const parsed = Number.isNaN(requested) ? 1 : requested
  const filters: HistoryFilters = {
    q: params.q || undefined,
    sort: params.sort || undefined,
    from: params.from || undefined,
    to: params.to || undefined,
    quality: params.quality || undefined,
  }

  const totalParams = new URLSearchParams()
  totalParams.set("page", "1")
  totalParams.set("page_size", "1")
  if (filters.q) totalParams.set("q", filters.q)
  if (filters.sort) totalParams.set("sort", filters.sort)
  if (filters.from) totalParams.set("from", filters.from)
  if (filters.to) totalParams.set("to", filters.to)
  if (filters.quality) totalParams.set("quality", filters.quality)
  const total = await apiServer<SearchList>(
    `/api/v1/searches?${totalParams.toString()}`
  )
    .then((data) => data.total)
    .catch(() => null)

  return (
    <>
      <section className="px-4 py-10">
        <div className="mx-auto max-w-7xl space-y-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard" className="text-primary">
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <HugeiconsIcon icon={ChevronRightIcon} />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>History</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center justify-between gap-5 md:items-end">
            <h1 className="font-heading text-4xl leading-5 font-semibold md:text-5xl">
              Search history
            </h1>
            {total !== null ? (
              <span className="text-sm font-semibold text-muted-foreground">
                {total} searches
              </span>
            ) : null}
          </div>
          <SearchHistoryToolbar />
          <Suspense fallback={<ListSkeleton rows={ITEMS_PER_PAGE} />}>
            <HistoryList
              page={parsed}
              pageSize={ITEMS_PER_PAGE}
              filters={filters}
            />
          </Suspense>
        </div>
      </section>
    </>
  )
}

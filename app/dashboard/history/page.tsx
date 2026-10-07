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
import { ArrowAllDirectionIcon } from "@hugeicons/core-free-icons"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getMeServer, apiServer } from "@/lib/api-server"
import { toCardProps } from "@/lib/dashboard-data"
import type { SearchList } from "@/lib/api"
import { ListSkeleton } from "@/components/dashboard/skeletons"

export const dynamic = "force-dynamic"

async function HistoryList({
  page,
  pageSize,
}: {
  page: number
  pageSize: number
}) {
  const data = await apiServer<SearchList>(
    `/api/v1/searches?page=${page}&page_size=${pageSize}`
  )
  const pageCount = Math.max(1, Math.ceil(data.total / pageSize))
  const currentPage = clampPage(page, pageCount)
  const items =
    currentPage === page
      ? data.items
      : (
          await apiServer<SearchList>(
            `/api/v1/searches?page=${currentPage}&page_size=${pageSize}`
          )
        ).items
  const cards = await Promise.all(items.map((item) => toCardProps(item)))

  return (
    <div className="space-y-5">
      {cards.length ? (
        <div className="grid grid-cols-1 gap-3 divide-y divide-border">
          {cards.map((card) => (
            <SearchResultCard key={card.id} {...card} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">
          No searches yet. Run your first check from the dashboard.
        </p>
      )}
      <PaginationWindow
        currentPage={currentPage}
        pageCount={pageCount}
        basePath="/dashboard/history"
      />
    </div>
  )
}

export default async function SearchHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>
}) {
  const user = await getMeServer().catch(() => null)
  if (!user) redirect("/auth")

  const { page } = await searchParams
  const requested = Number.parseInt(page ?? "", 10)
  const parsed = Number.isNaN(requested) ? 1 : requested

  const total = await apiServer<SearchList>(
    `/api/v1/searches?page=1&page_size=1`
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
                <HugeiconsIcon icon={ArrowAllDirectionIcon} />
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
            <HistoryList page={parsed} pageSize={ITEMS_PER_PAGE} />
          </Suspense>
        </div>
      </section>
    </>
  )
}

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { RECENT_SEARCHES } from "@/lib/constants"
import { clampPage } from "@/lib/pagination"
import { SearchResultCard } from "@/components/dashboard/search-result-card"
import { PaginationWindow } from "@/components/ui/pagination-window"
import SearchHistoryToolbar from "@/components/dashboard/search-history-toolbar"

const ITEMS_PER_PAGE = 10

export default async function SearchHistoryPage({ searchParams }: { searchParams: Promise<{ [key: string]: string }> }) {
  const { page } = await searchParams

  const pageCount = Math.ceil(RECENT_SEARCHES.length / ITEMS_PER_PAGE)
  const currentPage = clampPage(Number.parseInt(page ?? "", 10), pageCount)
  const offset = (currentPage - 1) * ITEMS_PER_PAGE
  const searchHistory = RECENT_SEARCHES.slice(offset, offset + ITEMS_PER_PAGE)

  return (
    <>
      <section className="px-4 py-10">
        <div className="mx-auto max-w-7xl space-y-10">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard" className="text-primary">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>History</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center md:items-end justify-between gap-5">
            <h1 className="font-heading text-4xl font-semibold md:text-5xl leading-5">Search history</h1>
            <span className="text-sm text-muted-foreground font-semibold">{RECENT_SEARCHES.length} searches</span>
          </div>
          <SearchHistoryToolbar />
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-3 divide-y divide-border">
              {searchHistory.map((search) => (
                <SearchResultCard key={search.id} {...search} />
              ))}
            </div>
            <PaginationWindow currentPage={currentPage} pageCount={pageCount} basePath="/dashboard/history" />
          </div>
        </div>
      </section>
    </>
  )
}

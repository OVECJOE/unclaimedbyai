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
import { PaginationWindow } from "@/components/ui/pagination-window"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowAllDirectionIcon } from "@hugeicons/core-free-icons"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getMeServer, apiServer } from "@/lib/api-server"
import { ApiError, type SearchList } from "@/lib/api"
import { formatDateTime } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function SearchHistoryPage({ searchParams }: { searchParams: Promise<{ [key: string]: string }> }) {
  const user = await getMeServer()
  if (!user) redirect("/auth")

  const { page } = await searchParams
  const requested = Number.parseInt(page ?? "", 10)
  const parsed = Number.isNaN(requested) ? 1 : requested

  let data: SearchList
  try {
    data = await apiServer<SearchList>(`/api/v1/searches?page=${parsed}&page_size=${ITEMS_PER_PAGE}`)
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/auth")
    throw error
  }
  const pageCount = Math.max(1, Math.ceil(data.total / ITEMS_PER_PAGE))
  const currentPage = clampPage(parsed, pageCount)
  const items = currentPage === parsed
    ? data.items
    : (await apiServer<SearchList>(`/api/v1/searches?page=${currentPage}&page_size=${ITEMS_PER_PAGE}`)).items

  return (
    <>
      <section className="px-4 py-10">
        <div className="mx-auto max-w-7xl space-y-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard" className="text-primary">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <HugeiconsIcon icon={ArrowAllDirectionIcon} />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>History</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center md:items-end justify-between gap-5">
            <h1 className="font-heading text-4xl font-semibold md:text-5xl leading-5">Search history</h1>
            <span className="text-sm text-muted-foreground font-semibold">{data.total} searches</span>
          </div>
          <div className="space-y-5">
            {items.length ? (
              <div className="grid grid-cols-1 gap-3 divide-y divide-border">
                {items.map((search) => (
                  <div key={search.id} className="flex items-center justify-between gap-3 py-2">
                    <div className="min-w-0">
                      <Link
                        href={`/dashboard/history/${search.id}`}
                        className="truncate font-medium underline-offset-4 hover:underline"
                      >
                        {search.query}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {search.name_count} names · {formatDateTime(search.created_at)}
                      </p>
                    </div>
                    <Link href={`/dashboard/history/${search.id}`}>
                      <Button variant="outline" size="sm">Open</Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No searches yet. Run your first check from the dashboard.</p>
            )}
            <PaginationWindow currentPage={currentPage} pageCount={pageCount} basePath="/dashboard/history" />
          </div>
        </div>
      </section>
    </>
  )
}

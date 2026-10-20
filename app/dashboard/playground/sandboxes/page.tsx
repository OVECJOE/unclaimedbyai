import Link from "next/link"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { PaginationWindow } from "@/components/ui/pagination-window"
import { SandboxListSkeleton } from "@/components/skeletons/sandbox-list"
import SandboxListToolbar from "@/components/dashboard/sandbox-list-toolbar"
import SandboxListCard from "@/components/dashboard/sandbox-list-card"
import NewSandboxButton from "@/components/dashboard/new-sandbox-button"
import { ApiError, type SandboxList } from "@/lib/api"
import { apiServer } from "@/lib/api-server"
import { clampPage } from "@/lib/pagination"

export const dynamic = "force-dynamic"

const PAGE_SIZE = 12

type ListParams = {
  q?: string
  filter?: string
  sort?: string
  page: number
}

function listQuery({ page, ...filters }: ListParams): string {
  const params = new URLSearchParams()
  params.set("page", String(page))
  params.set("page_size", String(PAGE_SIZE))
  if (filters.q) params.set("q", filters.q)
  if (filters.filter && filters.filter !== "all") {
    params.set("filter", filters.filter)
  }
  if (filters.sort) params.set("sort", filters.sort)
  return `/api/v1/sandboxes?${params.toString()}`
}

function pageHref(target: number, filters: ListParams): string {
  const params = new URLSearchParams()
  if (target > 1) params.set("page", String(target))
  if (filters.q) params.set("q", filters.q)
  if (filters.filter && filters.filter !== "all") {
    params.set("filter", filters.filter)
  }
  if (filters.sort) params.set("sort", filters.sort)
  const query = params.toString()
  return query
    ? `/dashboard/playground/sandboxes?${query}`
    : "/dashboard/playground/sandboxes"
}

async function SandboxList({ filters }: { filters: ListParams }) {
  let data: SandboxList
  try {
    data = await apiServer<SandboxList>(listQuery(filters))
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/auth")
    throw error
  }
  const pageCount = Math.max(1, Math.ceil(data.total / PAGE_SIZE))
  const currentPage = clampPage(filters.page, pageCount)

  return (
    <div className="space-y-5">
      <SandboxListToolbar total={data.total} />
      {data.items.length ? (
        <ul className="divide-y divide-border border">
          {data.items.map((sandbox) => (
            <SandboxListCard key={sandbox.public_id} sandbox={sandbox} />
          ))}
        </ul>
      ) : (
        <div className="space-y-3 border border-dashed p-6 text-center">
          <p className="text-muted-foreground">
            {filters.q || (filters.filter && filters.filter !== "all")
              ? "No sandboxes match. Widen the filters to see the rest."
              : "No sandboxes yet. Start one, answer three questions, and generate your first batch of ideas."}
          </p>
          {!filters.q ? <NewSandboxButton /> : null}
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

/**
 * The sandboxes list, powered by the server: the query lives in the
 * address bar, so every filtered view is a link and a refresh keeps it.
 */
export default async function SandboxesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>
}) {
  const params = await searchParams
  const requested = Number.parseInt(params.page ?? "", 10)
  const filters: ListParams = {
    q: params.q || undefined,
    filter: params.filter || undefined,
    sort: params.sort || undefined,
    page: Number.isNaN(requested) ? 1 : requested,
  }

  return (
    <section className="px-4 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <h1 className="font-heading text-4xl font-semibold md:text-5xl">
              Sandboxes
            </h1>
            <p className="max-w-prose text-sm text-muted-foreground md:text-base">
              A sandbox holds ideas. Generate a batch, research the ones that
              catch you, then turn one into names. Each sandbox carries its own
              steer, so a weekend idea and a serious one can differ.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/playground/watchlist">Watchlist</Link>
            </Button>
            <NewSandboxButton />
          </div>
        </div>
        <Suspense fallback={<SandboxListSkeleton />}>
          <SandboxList filters={filters} />
        </Suspense>
      </div>
    </section>
  )
}

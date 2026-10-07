import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowAllDirectionIcon } from "@hugeicons/core-free-icons"
import { redirect } from "next/navigation"
import { notFound } from "next/navigation"
import NameCheckPanel from "@/components/dashboard/name-check-panel"
import { getMeServer, apiServer } from "@/lib/api-server"
import { ApiError, type SearchDetail } from "@/lib/api"
import { formatDateTime } from "@/lib/utils"

export const dynamic = "force-dynamic"

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

  let search: SearchDetail
  try {
    search = await apiServer<SearchDetail>(`/api/v1/searches/${id}`)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound()
    if (error instanceof ApiError && error.status === 401) redirect("/auth")
    throw error
  }

  return (
    <>
      <section className="px-4 pt-10 pb-5">
        <div className="mx-auto max-w-7xl space-y-8">
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
                <BreadcrumbLink
                  href="/dashboard/history"
                  className="text-primary"
                >
                  History
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <HugeiconsIcon icon={ArrowAllDirectionIcon} />
              </BreadcrumbSeparator>
              <BreadcrumbItem className="min-w-0">
                <BreadcrumbPage className="truncate">
                  {search.query}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="space-y-1">
            <h1 className="font-heading text-4xl font-semibold md:text-5xl">
              Results for &apos;
              <span className="text-primary">{search.query}</span>&apos;
            </h1>
            <p className="text-sm text-muted-foreground">
              {search.names.length} names · {formatDateTime(search.created_at)}
            </p>
          </div>
        </div>
      </section>
      <section className="px-4 pb-10">
        <div className="mx-auto max-w-7xl space-y-4">
          {search.names.length ? (
            search.names.map((name) => (
              <NameCheckPanel
                key={name.id}
                searchId={search.id}
                nameId={name.id}
                name={name.name}
              />
            ))
          ) : (
            <p className="text-muted-foreground">
              No names in this search yet.
            </p>
          )}
        </div>
      </section>
    </>
  )
}

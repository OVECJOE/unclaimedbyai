import Link from "next/link"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import SearchConsole from "@/components/dashboard/search-console"
import { getMeServer, apiServer } from "@/lib/api-server"
import type { SearchList } from "@/lib/api"
import { formatDateTime } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const user = await getMeServer()
  if (!user) redirect("/auth")
  let recent: SearchList | null = null
  try {
    recent = await apiServer<SearchList>("/api/v1/searches?page=1&page_size=5")
  } catch {
    recent = null
  }

  return (
    <>
      <section className="space-y-5 border-b px-4 py-10 sm:text-center">
        <div className="space-y-3">
          <h1 className="font-heading text-4xl font-semibold md:text-5xl">
            What are you building?
          </h1>
          <p className="mx-auto max-w-prose md:text-lg">
            Describe it and we&apos;ll generate names, then check them for you.
          </p>
        </div>
        <SearchConsole user={user} />
      </section>

      <section className="px-4 py-10">
        <div className="mx-auto space-y-4 max-w-7xl">
          <div className="flex items-center justify-between gap-5">
            <h3 className="font-heading text-2xl md:text-3xl font-semibold">Recent searches</h3>
            <Link href="/dashboard/history">
              <Button variant="link" className="p-0">View all</Button>
            </Link>
          </div>
          {recent && recent.items.length ? (
            <div className="grid grid-cols-1 gap-3 divide-y divide-border">
              {recent.items.map((search) => (
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
            <p className="text-muted-foreground">
              No searches yet — run your first check above.
            </p>
          )}
        </div>
      </section>
    </>
  )
}

import GenerateAndGo from "@/components/dashboard/generate-and-go"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { SearchResultCard } from "@/components/dashboard/search-result-card"
import { getMeServer, apiServer } from "@/lib/api-server"
import { toCardProps } from "@/lib/dashboard-data"
import type { SearchList } from "@/lib/api"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { ListSkeleton } from "@/components/dashboard/skeletons"

export const dynamic = "force-dynamic"

async function RecentSearches() {
  const data = await apiServer<SearchList>(
    "/api/v1/searches?page=1&page_size=5"
  ).catch(() => null)
  const cards = data
    ? await Promise.all(data.items.map((item) => toCardProps(item)))
    : []
  if (!cards.length) {
    return (
      <p className="text-muted-foreground">
        No searches yet — run your first check above.
      </p>
    )
  }
  return (
    <div className="grid grid-cols-1 gap-3 divide-y divide-border">
      {cards.map((card) => (
        <SearchResultCard key={card.id} {...card} />
      ))}
    </div>
  )
}

export default async function DashboardPage() {
  const user = await getMeServer().catch(() => null)
  if (!user) redirect("/auth")

  return (
    <>
      {/* Hero (What are you building?) */}
      <section className="space-y-5 border-b px-4 py-10 sm:text-center">
        <div className="space-y-3">
          <h1 className="font-heading text-4xl font-semibold md:text-5xl">
            What are you building?
          </h1>
          <p className="mx-auto max-w-prose md:text-lg">
            Describe it and we&apos;ll generate names, then check them for you.
          </p>
        </div>
        <GenerateAndGo />
      </section>

      {/* Recent searches */}
      <section className="px-4 py-10">
        <div className="mx-auto max-w-7xl space-y-4">
          <div className="flex items-center justify-between gap-5">
            <h3 className="font-heading text-2xl font-semibold md:text-3xl">
              Recent searches
            </h3>
            <Link href="/dashboard/history">
              <Button variant="link" className="p-0">
                View all
              </Button>
            </Link>
          </div>
          <Suspense fallback={<ListSkeleton rows={5} />}>
            <RecentSearches />
          </Suspense>
        </div>
      </section>
    </>
  )
}

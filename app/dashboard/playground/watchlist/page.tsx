import DashboardPageHeader from "@/components/dashboard/page-header"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import WatchlistTabs from "@/components/dashboard/watchlist-tabs"
import { WatchlistSkeleton } from "@/components/skeletons/watchlist"
import { ApiError, type CheckedList } from "@/lib/api"
import { apiServer } from "@/lib/api-server"

export const dynamic = "force-dynamic"

async function InitialChecked({ tab }: { tab: "watching" | "browse" }) {
  let data: CheckedList
  try {
    data = await apiServer<CheckedList>("/api/v1/names/checked?watched=0")
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/auth")
    throw error
  }
  return <WatchlistTabs initialChecked={data} initialTab={tab} />
}

export default async function WatchlistPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams
  return (
    <section className="px-4 py-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <DashboardPageHeader
          title="Watchlist"
          description="Pick the names you are considering, then let us guard them. We recheck their domains and handles every few hours and email you the moment something changes, so you hear it here before you read it anywhere else."
        />
        <Suspense fallback={<WatchlistSkeleton />}>
          <InitialChecked tab={tab === "browse" ? "browse" : "watching"} />
        </Suspense>
      </div>
    </section>
  )
}

import { redirect } from "next/navigation"
import { Suspense } from "react"
import WatchlistTabs from "@/components/dashboard/watchlist-tabs"
import { WatchlistSkeleton } from "@/components/skeletons/watchlist"
import { ApiError, type CheckedList } from "@/lib/api"
import { apiServer } from "@/lib/api-server"

export const dynamic = "force-dynamic"

async function InitialChecked() {
  let data: CheckedList
  try {
    data = await apiServer<CheckedList>("/api/v1/names/checked?watched=0")
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/auth")
    throw error
  }
  return <WatchlistTabs initialChecked={data} />
}

export default function WatchlistPage() {
  return (
    <section className="px-4 py-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="space-y-2">
          <h1 className="font-heading text-4xl font-semibold md:text-5xl">
            Watchlist
          </h1>
          <p className="max-w-prose text-sm text-muted-foreground md:text-base">
            Pick the names you are considering, then let us guard them. We
            recheck their domains and handles every few hours and email you the
            moment something changes, so you hear it here before you read it
            anywhere else.
          </p>
        </div>
        <Suspense fallback={<WatchlistSkeleton />}>
          <InitialChecked />
        </Suspense>
      </div>
    </section>
  )
}

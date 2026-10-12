import { redirect } from "next/navigation"
import Watchlist from "@/components/dashboard/watchlist"
import { ApiError, type WatchList } from "@/lib/api"
import { apiServer, getMeServer } from "@/lib/api-server"

export const dynamic = "force-dynamic"

export default async function WatchPage() {
  const user = await getMeServer().catch(() => null)
  if (!user) redirect("/auth")

  let data: WatchList
  try {
    data = await apiServer<WatchList>("/api/v1/watches")
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/auth")
    throw error
  }

  return (
    <section className="px-4 py-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="space-y-2">
          <h1 className="font-heading text-4xl font-semibold md:text-5xl">
            Watch
          </h1>
          <p className="max-w-prose text-sm text-muted-foreground md:text-base">
            The names you care about, guarded. We recheck their domains and
            handles every few hours and email you the moment something changes,
            so you hear it here before you read it anywhere else.
          </p>
        </div>
        <Watchlist initial={data} />
      </div>
    </section>
  )
}

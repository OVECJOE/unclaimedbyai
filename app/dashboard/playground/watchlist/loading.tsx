import { WatchlistSkeleton } from "@/components/skeletons/watchlist"

export default function WatchlistLoading() {
  return (
    <section className="px-4 py-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="space-y-2">
          <div className="h-10 w-40 skeleton md:h-12" />
          <div className="h-4 w-80 max-w-full skeleton" />
        </div>
        <WatchlistSkeleton />
      </div>
    </section>
  )
}

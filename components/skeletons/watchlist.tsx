export function WatchlistSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-6" aria-label="Loading the watchlist">
      <div className="inline-flex h-10 w-fit items-center gap-1 bg-muted p-1">
        <div className="skeleton skeleton-soft h-8 w-24" />
        <div className="skeleton skeleton-soft h-8 w-28" />
      </div>

      <div className="space-y-4 pt-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="skeleton skeleton-faint h-9 flex-1" />
          <div className="flex gap-1">
            <div className="skeleton skeleton-faint h-8 w-14" />
            <div className="skeleton skeleton-faint h-8 w-16" />
            <div className="skeleton skeleton-faint h-8 w-24" />
          </div>
        </div>

        <div className="skeleton h-3 w-40" />

        <ul className="space-y-4">
          {Array.from({ length: rows }).map((_, index) => (
            <li key={index} className="border">
              <div className="space-y-4 p-5 sm:p-6">
                <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="skeleton h-8 w-44" />
                      <div className="skeleton skeleton-soft h-5 w-16" />
                    </div>
                    <div className="skeleton h-3 w-72 max-w-full" />
                  </div>
                  <div className="skeleton skeleton-soft h-8 w-20" />
                </div>
                <ul className="divide-y divide-border border-y">
                  {Array.from({ length: 2 }).map((_, event) => (
                    <li
                      key={event}
                      className="flex items-center justify-between gap-4 py-2"
                    >
                      <div className="skeleton h-3 w-40" />
                      <div className="skeleton h-3 w-16" />
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

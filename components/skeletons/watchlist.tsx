export function WatchlistSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-6" aria-label="Loading the watchlist">
      <div className="inline-flex h-10 w-fit items-center gap-1 bg-muted p-1">
        <div className="h-8 w-24 animate-pulse bg-background/60" />
        <div className="h-8 w-28 animate-pulse bg-background/60" />
      </div>

      <div className="space-y-4 pt-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="h-9 flex-1 animate-pulse bg-muted/40" />
          <div className="flex gap-1">
            <div className="h-8 w-14 animate-pulse bg-muted/40" />
            <div className="h-8 w-16 animate-pulse bg-muted/40" />
            <div className="h-8 w-24 animate-pulse bg-muted/40" />
          </div>
        </div>

        <div className="h-3 w-40 animate-pulse bg-muted" />

        <ul className="space-y-4">
          {Array.from({ length: rows }).map((_, index) => (
            <li key={index} className="border">
              <div className="space-y-4 p-5 sm:p-6">
                <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-44 animate-pulse bg-muted" />
                      <div className="h-5 w-16 animate-pulse bg-muted/60" />
                    </div>
                    <div className="h-3 w-72 max-w-full animate-pulse bg-muted" />
                  </div>
                  <div className="h-8 w-20 animate-pulse bg-muted/60" />
                </div>
                <ul className="divide-y divide-border border-y">
                  {Array.from({ length: 2 }).map((_, event) => (
                    <li
                      key={event}
                      className="flex items-center justify-between gap-4 py-2"
                    >
                      <div className="h-3 w-40 animate-pulse bg-muted" />
                      <div className="h-3 w-16 animate-pulse bg-muted" />
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

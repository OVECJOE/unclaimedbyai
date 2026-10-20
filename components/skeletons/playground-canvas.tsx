export function PlaygroundCanvasSkeleton() {
  return (
    <div className="space-y-5" aria-label="Loading the playground">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="h-9 min-w-0 flex-1 animate-pulse bg-muted/40 sm:max-w-80" />
        <div className="flex items-center gap-2">
          <div className="h-9 w-28 animate-pulse bg-muted/40" />
          <div className="h-9 w-24 animate-pulse bg-muted/40" />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-baseline">
              <div className="h-7 w-52 animate-pulse bg-muted" />
              <div className="h-4 w-32 animate-pulse bg-muted" />
            </div>
            <div className="h-8 w-24 animate-pulse bg-muted/40" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="border bg-card p-4">
                <div className="h-5 w-2/3 animate-pulse bg-muted" />
                <div className="mt-2 h-3 w-full animate-pulse bg-muted" />
                <div className="mt-2 h-3 w-4/5 animate-pulse bg-muted" />
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-center border border-dashed px-4 py-3">
            <div className="h-4 w-1/2 animate-pulse bg-muted" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="border p-5">
            <div className="h-5 w-32 animate-pulse bg-muted" />
            <div className="mt-2 h-3 w-full animate-pulse bg-muted" />
            <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]">
              <div className="space-y-1.5">
                <div className="h-4 w-24 animate-pulse bg-muted" />
                <div className="h-9 w-full animate-pulse bg-muted/40" />
              </div>
              <div className="space-y-1.5">
                <div className="h-4 w-14 animate-pulse bg-muted" />
                <div className="h-9 w-full animate-pulse bg-muted/40 sm:w-24" />
              </div>
            </div>
            <div className="mt-4 h-9 w-32 animate-pulse bg-muted/40" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function PlaygroundCanvasSkeleton() {
  return (
    <div className="space-y-5" aria-label="Loading the playground">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="skeleton skeleton-faint h-9 min-w-0 flex-1 sm:max-w-80" />
        <div className="flex items-center gap-2">
          <div className="skeleton skeleton-faint h-9 w-28" />
          <div className="skeleton skeleton-faint h-9 w-24" />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-col gap-3">
              <div className="skeleton h-7 w-52" />
              <div className="skeleton h-4 w-32" />
            </div>
            <div className="skeleton skeleton-faint h-8 w-24" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="border bg-card p-4">
                <div className="skeleton h-5 w-2/3" />
                <div className="skeleton mt-2 h-3 w-full" />
                <div className="skeleton mt-2 h-3 w-4/5" />
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-center border border-dashed px-4 py-3">
            <div className="skeleton h-4 w-1/2" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="border p-5">
            <div className="skeleton h-5 w-32" />
            <div className="skeleton mt-2 h-3 w-full" />
            <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]">
              <div className="space-y-1.5">
                <div className="skeleton h-4 w-24" />
                <div className="skeleton skeleton-faint h-9 w-full" />
              </div>
              <div className="space-y-1.5">
                <div className="skeleton h-4 w-14" />
                <div className="skeleton skeleton-faint h-9 w-full sm:w-24" />
              </div>
            </div>
            <div className="skeleton skeleton-faint mt-4 h-9 w-32" />
          </div>
        </div>
      </div>
    </div>
  )
}

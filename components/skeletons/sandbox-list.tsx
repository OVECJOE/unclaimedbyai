export function SandboxListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-5" aria-label="Loading sandboxes">
      <div className="space-y-3">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="flex flex-1 items-center gap-2">
            <div className="skeleton h-4 w-4 shrink-0" />
            <div className="skeleton skeleton-faint h-9 w-full" />
          </div>
          <div className="flex gap-3">
            <div className="skeleton skeleton-faint h-9 w-full md:w-44" />
            <div className="skeleton skeleton-faint h-9 w-full md:w-44" />
          </div>
        </div>
        <div className="skeleton h-3 w-64" />
      </div>

      <ul className="divide-y divide-border border">
        {Array.from({ length: rows }).map((_, index) => (
          <li
            key={index}
            className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center"
          >
            <div className="min-w-0 flex-1">
              <div className="skeleton h-5 w-1/3" />
              <div className="skeleton mt-1 h-3 w-1/2" />
              <div className="skeleton mt-2 h-3 w-2/5" />
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <div className="skeleton skeleton-faint h-8 w-8" />
              <div className="skeleton skeleton-faint h-8 w-8" />
              <div className="skeleton skeleton-faint h-8 w-8" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

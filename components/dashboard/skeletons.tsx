export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div
      className="grid grid-cols-1 gap-3 divide-y divide-border"
      aria-label="Loading"
    >
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="space-y-2 px-2 py-4">
          <div className="h-5 w-2/3 animate-pulse bg-muted" />
          <div className="h-3 w-1/3 animate-pulse bg-muted" />
        </div>
      ))}
    </div>
  )
}

export function SummarySkeleton() {
  return (
    <div
      className="flex w-full flex-col gap-6 md:flex-row"
      aria-label="Loading"
    >
      <div className="h-48 min-w-0 flex-1 animate-pulse border bg-muted/40" />
      <div className="h-48 min-w-0 flex-1 animate-pulse border bg-muted/40" />
    </div>
  )
}

export function TableSkeleton() {
  return (
    <div className="space-y-2 border p-4" aria-label="Loading">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="h-8 animate-pulse bg-muted" />
      ))}
    </div>
  )
}

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

export function SearchDetailSkeleton() {
  return (
    <div className="space-y-8" aria-label="Loading search results">
      <div className="flex items-center gap-2">
        <div className="h-3 w-16 animate-pulse bg-muted" />
        <div className="h-3 w-3 animate-pulse bg-muted" />
        <div className="h-3 w-14 animate-pulse bg-muted" />
        <div className="h-3 w-3 animate-pulse bg-muted" />
        <div className="h-3 w-40 animate-pulse bg-muted" />
      </div>

      <div className="space-y-3">
        <div className="h-9 w-2/3 animate-pulse bg-muted md:h-11" />
        <div className="h-3 w-44 animate-pulse bg-muted" />
      </div>

      <div className="flex w-full flex-col gap-6 md:flex-row">
        <div className="min-w-0 flex-1 animate-pulse border bg-muted/40 p-6">
          <div className="h-4 w-28 bg-muted" />
          <div className="mt-5 flex items-end gap-3">
            <div className="h-10 w-16 bg-muted" />
            <div className="h-6 w-16 bg-muted" />
          </div>
          <div className="mt-5 h-3 w-full bg-muted" />
          <div className="mt-2 h-1.5 w-full bg-muted" />
          <div className="mt-5 h-14 w-full bg-muted" />
        </div>
        <div className="min-w-0 flex-1 animate-pulse border bg-muted/40 p-6">
          <div className="h-4 w-40 bg-muted" />
          <div className="mt-5 h-2 w-full bg-muted" />
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="mt-3 flex items-center justify-between">
              <div className="h-3 w-24 bg-muted" />
              <div className="h-3 w-10 bg-muted" />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-5">
        <div className="flex items-end gap-10">
          <div className="h-10 flex-1 animate-pulse bg-muted/40" />
          <div className="hidden h-8 w-28 animate-pulse bg-muted/40 md:block" />
        </div>
        <div className="border">
          <div className="flex items-center gap-4 border-b px-4 py-3">
            <div className="h-3 w-20 animate-pulse bg-muted" />
            <div className="h-3 w-16 animate-pulse bg-muted" />
            <div className="h-3 w-20 animate-pulse bg-muted" />
            <div className="h-3 w-16 animate-pulse bg-muted" />
            <div className="h-3 w-28 animate-pulse bg-muted" />
          </div>
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-4 border-b px-4 py-4 last:border-b-0"
            >
              <div className="h-4 w-28 animate-pulse bg-muted" />
              <div className="h-4 w-16 animate-pulse bg-muted" />
              <div className="h-4 w-24 animate-pulse bg-muted" />
              <div className="h-4 w-20 animate-pulse bg-muted" />
              <div className="h-4 w-24 animate-pulse bg-muted" />
            </div>
          ))}
          <div className="h-12 animate-pulse border-t bg-muted/40" />
        </div>
      </div>
    </div>
  )
}

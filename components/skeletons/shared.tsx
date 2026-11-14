export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div
      className="grid grid-cols-1 gap-3 divide-y divide-border"
      aria-label="Loading"
    >
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="space-y-2 px-2 py-4">
          <div className="skeleton h-5 w-2/3" />
          <div className="skeleton h-3 w-1/3" />
        </div>
      ))}
    </div>
  )
}

export function TableSkeleton() {
  return (
    <div className="space-y-2 border p-4" aria-label="Loading">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="skeleton h-8" />
      ))}
    </div>
  )
}

export function SearchDetailSkeleton() {
  return (
    <div className="space-y-8" aria-label="Loading search results">
      <div className="flex items-center gap-2">
        <div className="skeleton h-3 w-16" />
        <div className="skeleton h-3 w-3" />
        <div className="skeleton h-3 w-14" />
        <div className="skeleton h-3 w-3" />
        <div className="skeleton h-3 w-40" />
      </div>

      <div className="space-y-3">
        <div className="skeleton h-9 w-2/3 md:h-11" />
        <div className="skeleton h-3 w-44" />
      </div>

      <div className="flex w-full flex-col gap-6 md:flex-row">
        <div className="skeleton skeleton-faint min-w-0 flex-1 border p-6">
          <div className="h-4 w-28 bg-muted" />
          <div className="mt-5 flex items-end gap-3">
            <div className="h-10 w-16 bg-muted" />
            <div className="h-6 w-16 bg-muted" />
          </div>
          <div className="mt-5 h-3 w-full bg-muted" />
          <div className="mt-2 h-1.5 w-full bg-muted" />
          <div className="mt-5 h-14 w-full bg-muted" />
        </div>
        <div className="skeleton skeleton-faint min-w-0 flex-1 border p-6">
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
          <div className="skeleton skeleton-faint h-10 flex-1" />
          <div className="skeleton skeleton-faint hidden h-8 w-28 md:block" />
        </div>
        <div className="border">
          <div className="flex items-center gap-4 border-b px-4 py-3">
            <div className="skeleton h-3 w-20" />
            <div className="skeleton h-3 w-16" />
            <div className="skeleton h-3 w-20" />
            <div className="skeleton h-3 w-16" />
            <div className="skeleton h-3 w-28" />
          </div>
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-4 border-b px-4 py-4 last:border-b-0"
            >
              <div className="skeleton h-4 w-28" />
              <div className="skeleton h-4 w-16" />
              <div className="skeleton h-4 w-24" />
              <div className="skeleton h-4 w-20" />
              <div className="skeleton h-4 w-24" />
            </div>
          ))}
          <div className="skeleton skeleton-faint h-12 border-t" />
        </div>
      </div>
    </div>
  )
}

/** A ranked result card, as it will look: rank, name, verdict, three
 *  meters and the score ring. */
export function RankedCardSkeleton() {
  return (
    <div className="grid items-center gap-5 border bg-card p-5 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-7 sm:p-7">
      <div className="skeleton hidden h-12 w-12 sm:block" />
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="skeleton h-9 w-44" />
            <div className="skeleton h-5 w-14" />
          </div>
          <div className="skeleton h-4 w-3/4" />
        </div>
        <div className="grid max-w-xl grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="skeleton h-2 w-14" />
              <div className="skeleton h-1" />
              <div className="skeleton h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
      <div className="skeleton size-22" />
    </div>
  )
}

export function RankedCardsSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="grid gap-3" aria-label="Loading results">
      {Array.from({ length: rows }).map((_, index) => (
        <RankedCardSkeleton key={index} />
      ))}
    </div>
  )
}

/** The public name and search pages: hero with score ring, the three
 *  chapters' stage, then the ranked cards. */
export function ResultPageSkeleton() {
  return (
    <div aria-label="Loading the result">
      <section className="border-b px-4 pt-14 pb-12 md:pt-20">
        <div className="mx-auto grid max-w-5xl items-center gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:gap-14">
          <div className="space-y-5">
            <div className="skeleton h-3 w-52" />
            <div className="skeleton h-12 w-4/5 md:h-16" />
            <div className="skeleton h-5 w-2/3" />
            <div className="flex gap-2 pt-1">
              <div className="skeleton h-11 w-48" />
              <div className="skeleton skeleton-soft h-11 w-32" />
            </div>
          </div>
          <div className="skeleton size-33" />
        </div>
      </section>
      <section className="px-4 py-12">
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="space-y-4">
            <div className="skeleton h-3 w-44" />
            <div className="skeleton h-14 w-4/5" />
            <div className="skeleton h-4 w-3/5" />
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="skeleton skeleton-faint aspect-[4/3] border"
              />
            ))}
          </div>
        </div>
      </section>
      <section className="px-4 pb-12">
        <div className="mx-auto max-w-5xl space-y-4">
          <div className="skeleton h-9 w-56" />
          <RankedCardsSkeleton />
        </div>
      </section>
    </div>
  )
}

/** The idea gallery and a single idea page. */
export function IdeaGallerySkeleton() {
  return (
    <div
      className="mx-auto grid max-w-5xl gap-x-8 gap-y-10 px-4 py-12 sm:grid-cols-2"
      aria-label="Loading idea reports"
    >
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="space-y-3 border p-5">
          <div className="skeleton h-3 w-40" />
          <div className="skeleton h-8 w-4/5" />
          <div className="skeleton h-4 w-2/3" />
          <div className="flex gap-1.5">
            <div className="skeleton h-5 w-16" />
            <div className="skeleton h-5 w-20" />
            <div className="skeleton h-5 w-14" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function IdeaPageSkeleton() {
  return (
    <div aria-label="Loading idea report">
      <section className="border-b px-4 pt-10 pb-12 md:pt-16">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="skeleton h-3 w-56" />
          <div className="skeleton h-14 w-3/4 md:h-20" />
          <div className="flex items-center gap-3">
            <div className="skeleton size-11" />
            <div className="space-y-2">
              <div className="skeleton h-3 w-24" />
              <div className="skeleton h-3 w-56" />
            </div>
          </div>
          <div className="grid gap-8 border bg-card p-5 sm:p-8 lg:grid-cols-2 lg:gap-12">
            <div className="space-y-4">
              <div className="skeleton h-3 w-24" />
              <div className="skeleton h-10 w-4/5" />
              <div className="skeleton h-4 w-full" />
            </div>
            <div className="space-y-5">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="skeleton h-3 w-40" />
                  <div className="skeleton h-5 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

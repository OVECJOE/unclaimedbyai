export default function AccountLoading() {
  return (
    <section className="px-4 py-10">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="space-y-2">
          <div className="h-10 w-48 animate-pulse bg-muted md:h-12" />
          <div className="h-4 w-72 animate-pulse bg-muted" />
        </div>
        <div className="flex gap-2 border-b pb-2">
          <div className="h-9 w-24 animate-pulse bg-muted/60" />
          <div className="h-9 w-28 animate-pulse bg-muted/60" />
        </div>
        <div className="space-y-8">
          <div className="h-16 w-16 animate-pulse rounded-full bg-muted" />
          <div className="max-w-prose space-y-4">
            <div className="space-y-2">
              <div className="h-4 w-16 animate-pulse bg-muted" />
              <div className="h-9 w-full animate-pulse bg-muted/60" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-16 animate-pulse bg-muted" />
              <div className="h-9 w-full animate-pulse bg-muted/60" />
            </div>
            <div className="h-9 w-32 animate-pulse bg-muted/60" />
          </div>
        </div>
      </div>
    </section>
  )
}

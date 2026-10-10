export default function BillingLoading() {
  return (
    <section className="px-4">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="h-10 w-40 animate-pulse bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="border p-5">
            <div className="h-4 w-24 animate-pulse bg-muted" />
            <div className="mt-3 h-10 w-16 animate-pulse bg-muted" />
          </div>
          <div className="border p-5">
            <div className="h-4 w-28 animate-pulse bg-muted" />
            <div className="mt-3 h-10 w-16 animate-pulse bg-muted" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-80 animate-pulse border bg-muted/40" />
          ))}
        </div>
      </div>
    </section>
  )
}

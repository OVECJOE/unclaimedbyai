export default function BillingLoading() {
  return (
    <section className="px-4">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="h-10 w-40 skeleton" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="border p-5">
            <div className="h-4 w-24 skeleton" />
            <div className="mt-3 h-10 w-16 skeleton" />
          </div>
          <div className="border p-5">
            <div className="h-4 w-28 skeleton" />
            <div className="mt-3 h-10 w-16 skeleton" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-80 skeleton skeleton-faint border"
            />
          ))}
        </div>
      </div>
    </section>
  )
}

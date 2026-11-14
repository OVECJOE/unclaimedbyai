export default function AccountLoading() {
  return (
    <section className="px-4 py-10">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="space-y-2">
          <div className="h-10 w-48 skeleton md:h-12" />
          <div className="h-4 w-72 skeleton" />
        </div>
        <div className="flex gap-2 border-b pb-2">
          <div className="h-9 w-24 skeleton skeleton-soft" />
          <div className="h-9 w-28 skeleton skeleton-soft" />
        </div>
        <div className="space-y-8">
          <div className="skeleton h-16 w-16 rounded-full" />
          <div className="max-w-prose space-y-4">
            <div className="space-y-2">
              <div className="h-4 w-16 skeleton" />
              <div className="h-9 w-full skeleton skeleton-soft" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-16 skeleton" />
              <div className="h-9 w-full skeleton skeleton-soft" />
            </div>
            <div className="h-9 w-32 skeleton skeleton-soft" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default function PlaygroundLoading() {
  return (
    <section className="px-4 py-10">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-10 animate-pulse border bg-muted/40"
            />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse border bg-muted/40"
            />
          ))}
        </div>
      </div>
    </section>
  )
}

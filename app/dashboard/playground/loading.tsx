import { PlaygroundCanvasSkeleton } from "@/components/skeletons/playground-canvas"

export default function PlaygroundLoading() {
  return (
    <section className="px-4 py-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="h-10 w-44 animate-pulse bg-muted md:h-12" />
            <div className="h-4 w-80 max-w-full animate-pulse bg-muted" />
          </div>
          <div className="h-9 w-32 animate-pulse bg-muted/40" />
        </div>
        <PlaygroundCanvasSkeleton />
      </div>
    </section>
  )
}

import { ListSkeleton } from "@/components/dashboard/skeletons"

export default function HistoryLoading() {
  return (
    <section className="px-4 py-10">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="space-y-2">
          <div className="h-10 w-40 animate-pulse bg-muted md:h-12" />
          <div className="h-4 w-64 animate-pulse bg-muted" />
        </div>
        <div className="h-9 w-full max-w-md animate-pulse bg-muted/60" />
        <ListSkeleton rows={6} />
      </div>
    </section>
  )
}

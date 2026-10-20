import { SandboxListSkeleton } from "@/components/skeletons/sandbox-list"

export default function SandboxesLoading() {
  return (
    <section className="px-4 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="h-10 w-40 animate-pulse bg-muted md:h-12" />
            <div className="h-4 w-80 max-w-full animate-pulse bg-muted" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-24 animate-pulse bg-muted/40" />
            <div className="h-9 w-28 animate-pulse bg-muted/40" />
          </div>
        </div>
        <SandboxListSkeleton />
      </div>
    </section>
  )
}

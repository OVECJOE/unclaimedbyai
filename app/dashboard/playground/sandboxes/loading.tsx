import { SandboxListSkeleton } from "@/components/skeletons/sandbox-list"

export default function SandboxesLoading() {
  return (
    <section className="px-4 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="h-10 w-40 skeleton md:h-12" />
            <div className="h-4 w-80 max-w-full skeleton" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-24 skeleton skeleton-faint" />
            <div className="h-9 w-28 skeleton skeleton-faint" />
          </div>
        </div>
        <SandboxListSkeleton />
      </div>
    </section>
  )
}

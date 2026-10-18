import { SearchDetailSkeleton } from "@/components/dashboard/skeletons"

export default function DashboardLoading() {
  return (
    <section className="px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <SearchDetailSkeleton />
      </div>
    </section>
  )
}

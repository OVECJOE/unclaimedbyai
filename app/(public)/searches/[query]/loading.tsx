import { TableSkeleton } from "@/components/skeletons/shared"

export default function SearchReportLoading() {
  return (
    <section className="px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <TableSkeleton />
      </div>
    </section>
  )
}

import { TableSkeleton } from "@/components/dashboard/skeletons"

export default function BillingHistoryLoading() {
  return (
    <section className="px-4">
      <div className="mx-auto max-w-7xl space-y-4">
        <TableSkeleton />
      </div>
    </section>
  )
}

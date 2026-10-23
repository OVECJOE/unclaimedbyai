import { TableSkeleton } from "@/components/skeletons/shared"

/** The report streams in behind this: skeleton first, results the
 *  moment the server resolves, so the navigation never shows white. */
export default function ResultsLoading() {
  return (
    <section className="px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <TableSkeleton />
      </div>
    </section>
  )
}

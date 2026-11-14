import { ResultPageSkeleton } from "@/components/skeletons/shared"

/** The report streams in behind this: skeleton first, results the
 *  moment the server resolves, so the navigation never shows white. */
export default function ResultsLoading() {
  return <ResultPageSkeleton />
}

"use client"

import { useState } from "react"
import { toast } from "sonner"
import { ApiError, addWatch, removeWatch } from "@/lib/api"
import { toastApiError } from "@/lib/api-errors"
import WatchStar from "@/components/dashboard/watch-star"

/**
 * Self-contained star for pages outside the results table, such as the
 * full report header. Owns its watched state and the watch id needed to
 * unwatch.
 */
export default function WatchToggle({
  name,
  searchId,
  initialWatching,
  initialWatchId,
}: {
  name: string
  searchId: number
  initialWatching: boolean
  initialWatchId?: number
}) {
  const [watching, setWatching] = useState(initialWatching)
  const [watchId, setWatchId] = useState<number | undefined>(initialWatchId)
  const [pending, setPending] = useState(false)

  async function toggle() {
    setPending(true)
    const wasWatching = watching
    setWatching(!wasWatching)
    try {
      if (wasWatching && watchId !== undefined) {
        await removeWatch(watchId)
        setWatchId(undefined)
        toast.success(`No longer watching ${name}.`)
      } else {
        const watch = await addWatch({ search_id: searchId, name })
        setWatchId(watch.id)
        toast.success(
          `Now watching ${name}. We will email you if any of its domains or handles get claimed.`
        )
      }
    } catch (error) {
      setWatching(wasWatching)
      if (error instanceof ApiError && error.status === 402) {
        toast.error(error.message)
      } else {
        toastApiError(error, "Could not update your watchlist.")
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <WatchStar
      name={name}
      watching={watching}
      pending={pending}
      onToggle={() => void toggle()}
    />
  )
}

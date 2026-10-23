"use client"

import { useCallback, useEffect, useState, useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"

/**
 * The connection, said out loud. Polling surfaces otherwise freeze
 * silently when the network drops, and a frozen live page reads as a
 * broken product. The banner names the state, promises the page is a
 * snapshot, and refreshes the server-rendered surfaces the moment the
 * network returns.
 */
export default function OfflineBanner() {
  const router = useRouter()
  const [back, setBack] = useState(false)

  // The transition handlers run in event context, so state updates
  // and the refresh both live here rather than in an effect.
  const subscribe = useCallback(
    (notify: () => void) => {
      const handleOnline = () => {
        setBack(true)
        notify()
        router.refresh()
      }
      const handleOffline = () => notify()
      window.addEventListener("online", handleOnline)
      window.addEventListener("offline", handleOffline)
      return () => {
        window.removeEventListener("online", handleOnline)
        window.removeEventListener("offline", handleOffline)
      }
    },
    [router]
  )

  const online = useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true
  )

  useEffect(() => {
    if (!back) return
    const timer = setTimeout(() => setBack(false), 4000)
    return () => clearTimeout(timer)
  }, [back])

  if (online && !back) return null
  return (
    <div
      role="status"
      className="fixed inset-x-0 top-0 z-[100] border-b border-amber-500/40 bg-amber-500/15 px-4 py-2 text-center text-xs font-semibold tracking-widest uppercase backdrop-blur-sm"
    >
      {online
        ? "Back online — refreshing."
        : "You're offline — this is the last snapshot. We reconnect on our own."}
    </div>
  )
}

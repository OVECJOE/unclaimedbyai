"use client"

import { useCallback, useSyncExternalStore } from "react"

/**
 * Whether the viewport currently matches a media query.
 *
 * Subscribed through useSyncExternalStore so the answer tracks resize
 * events without an effect ever calling setState, and the server
 * snapshot falls back to `defaultValue` so the first client paint
 * agrees with the server's. Panels that swap between side-by-side and
 * full-screen use it to pick the right shell.
 */
export function useMediaQuery(query: string, defaultValue = false): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query)
      list.addEventListener("change", onChange)
      return () => list.removeEventListener("change", onChange)
    },
    [query]
  )

  const getSnapshot = useCallback(
    () => window.matchMedia(query).matches,
    [query]
  )

  const getServerSnapshot = useCallback(() => defaultValue, [defaultValue])

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

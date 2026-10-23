"use client"

import { useEffect } from "react"
import { track } from "@/lib/analytics"

/**
 * Fire one funnel event when a server-rendered view arrives — the
 * "check your email" screen, a fresh report. Renders nothing.
 */
export default function TrackOnce({
  name,
  detail,
}: {
  name: string
  detail?: string
}) {
  useEffect(() => {
    track(name, detail)
  }, [name, detail])
  return null
}

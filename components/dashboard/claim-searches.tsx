"use client"

import { useEffect } from "react"
import { ANON_SESSION_KEY, clearAnonSessionId } from "@/lib/anon"
import { claimSearches } from "@/lib/api"

export default function ClaimSearches() {
  useEffect(() => {
    let sessionId: string | null = null
    try {
      sessionId = localStorage.getItem(ANON_SESSION_KEY)
    } catch {
      return
    }
    if (!sessionId) return
    claimSearches(sessionId)
      .then(() => clearAnonSessionId())
      .catch(() => {
        // Claiming is best-effort; anonymous searches stay visible
        // on their public results links until the next sign-in.
      })
  }, [])

  return null
}

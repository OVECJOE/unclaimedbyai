"use client"

import { useEffect } from "react"
import {
  clearAnonSessionId,
  clearClaimIntent,
  readClaimIntent,
} from "@/lib/anon"
import { claimSearches } from "@/lib/api"

/**
 * Moves an anonymous session's searches onto the account — but only
 * when the user armed it by clicking a sign-in button on the anon
 * results page. A sign-in from anywhere else adopts nothing: a search
 * made while signed out stays on its shareable link until its owner
 * explicitly chooses to keep it. (The previous unconditional claim was
 * how a sign-out-then-search-then-sign-in round trip silently glued
 * anonymous searches onto the account and burned the monthly count.)
 */
export default function ClaimSearches() {
  useEffect(() => {
    const sessionId = readClaimIntent()
    if (!sessionId) return
    claimSearches(sessionId)
      .then(() => {
        clearClaimIntent()
        clearAnonSessionId()
      })
      .catch(() => {
        // Best-effort: the intent survives so the next signed-in mount
        // retries — the claim can 401 across tabs when the session
        // cookie has not landed yet.
      })
  }, [])

  return null
}

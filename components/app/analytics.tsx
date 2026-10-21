"use client"

import { Analytics as VercelAnalytics } from "@vercel/analytics/next"
import { useConsent } from "@/lib/consent"

/**
 * Analytics only runs once the visitor has allowed it via the cookie
 * banner. Declined (or undecided) visitors get no script at all, which
 * is the gate this component has always enforced — the vendor behind it
 * is interchangeable, the consent is not.
 */
export default function Analytics() {
  const consent = useConsent()
  if (consent !== "accepted") return null

  return <VercelAnalytics />
}

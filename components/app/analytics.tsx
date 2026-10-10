"use client"

import Script from "next/script"
import { useConsent } from "@/lib/consent"

/**
 * Sabilytics only loads once the visitor has allowed analytics via the
 * cookie banner. Declined (or undecided) visitors get no script at all.
 */
export default function Analytics() {
  const consent = useConsent()
  if (consent !== "accepted") return null

  return (
    <Script
      async
      src="https://www.sabilytics.com/script.js"
      data-site="tl6y296p08at"
      data-domain="unclaimedbyai.com"
      strategy="afterInteractive"
    />
  )
}

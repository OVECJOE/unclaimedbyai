"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ApiError, createCheckout, getMe, listPacks } from "@/lib/api"
import { toastApiError } from "@/lib/api-errors"

/**
 * Direct path from a report to a real checkout for the single-report
 * pack, keeping the visitor on this page through the purchase. Signed
 * out, it goes through auth, where the plan handoff picks them up.
 */
export default function BuyReportButton() {
  const [pending, setPending] = useState(false)

  async function buy() {
    setPending(true)
    try {
      const user = await getMe(5000).catch(() => null)
      if (!user) {
        window.location.href = "/auth?plan=single"
        return
      }
      const packs = await listPacks()
      // The smallest pack is the right default for someone who just
      // wants enough credits to unblock this one action.
      const pack = [...packs].sort(
        (a, b) => a.price_minor - b.price_minor
      )[0]
      if (!pack) throw new ApiError(0, "Packs are unavailable right now")
      const { checkout_url } = await createCheckout(
        pack.slug,
        `${window.location.pathname}${window.location.search}`
      )
      window.location.href = checkout_url
    } catch (error) {
      setPending(false)
      toastApiError(error, "Checkout could not start. Try again.")
    }
  }

  return (
    <Button size="lg" disabled={pending} onClick={() => void buy()}>
      {pending ? "Redirecting…" : "Buy the full report"}
    </Button>
  )
}

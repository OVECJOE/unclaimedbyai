"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createProCheckout } from "@/lib/api"
import { toastApiError } from "@/lib/api-errors"

/**
 * Starts a Pro subscription checkout. Recurring rather than one-shot, so
 * the return path lands back on billing where the subscription shows up
 * once the webhook has recorded it. Width comes from the call site: a
 * full-width block on billing, inline wherever it sits in a row.
 */
export default function UpgradeButton({
  label = "Upgrade to Pro",
  ...props
}: {
  label?: string
} & React.ComponentProps<typeof Button>) {
  const [pending, setPending] = useState(false)

  async function upgrade() {
    setPending(true)
    try {
      const { checkout_url } = await createProCheckout(
        `${window.location.pathname}${window.location.search}`
      )
      window.location.href = checkout_url
    } catch (err) {
      setPending(false)
      toastApiError(err, "Checkout failed. Try again.")
    }
  }

  return (
    <Button
      size="lg"
      {...props}
      disabled={pending}
      onClick={() => void upgrade()}
    >
      {pending ? "Redirecting…" : label}
    </Button>
  )
}

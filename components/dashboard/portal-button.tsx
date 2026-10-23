"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createPortalSession } from "@/lib/api"
import { toastApiError } from "@/lib/api-errors"

/**
 * Self-service billing: Stripe's hosted portal is where a subscriber
 * pauses, cancels, or swaps a card. Without this the only exit from a
 * paid plan is deleting the account — a resentment engine dressed up
 * as a control panel.
 */
export default function PortalButton({ className }: { className?: string }) {
  const [pending, setPending] = useState(false)
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      className={className}
      onClick={() => {
        setPending(true)
        createPortalSession()
          .then(({ url }) => {
            window.location.href = url
          })
          .catch((error: unknown) => {
            toastApiError(error, "Could not open billing settings.")
            setPending(false)
          })
      }}
    >
      {pending ? "Opening…" : "Manage subscription"}
    </Button>
  )
}

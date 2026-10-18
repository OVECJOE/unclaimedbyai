"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"

/**
 * Checkout result banner on the billing page. It stays until the visitor
 * navigates away — a payment confirmation (or a cancellation) should not
 * evaporate mid-read, and the refresh replay is honest on a page whose
 * whole job is the billing state.
 */
export default function CheckoutBanner({
  kind,
}: {
  kind: "success" | "canceled"
}) {
  if (kind === "canceled") {
    return (
      <Alert className="border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400">
        <AlertDescription>
          Checkout was canceled. No charge was made.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="bg-secondary">
      <AlertDescription>
        Payment received. Your credits are on the account.
      </AlertDescription>
    </Alert>
  )
}

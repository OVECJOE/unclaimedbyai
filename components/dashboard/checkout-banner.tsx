"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
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
  const router = useRouter()

  // Fulfillment arrives by webhook after this page has already rendered,
  // so the balance below the banner starts stale. Refresh twice on a
  // delay so the numbers catch up with the confirmation.
  useEffect(() => {
    if (kind !== "success") return
    const timers = [
      setTimeout(() => router.refresh(), 3000),
      setTimeout(() => router.refresh(), 8000),
    ]
    return () => timers.forEach((timer) => clearTimeout(timer))
  }, [kind, router])

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

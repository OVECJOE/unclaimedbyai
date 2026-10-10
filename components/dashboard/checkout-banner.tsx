"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"

const DISMISS_AFTER_MS = 8000

/**
 * One-shot checkout result banner. Strips the success/canceled query
 * params shortly after mount so a refresh or back-navigation doesn't
 * replay the same message forever.
 */
export default function CheckoutBanner({
  kind,
}: {
  kind: "success" | "canceled"
}) {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/dashboard/billing")
    }, DISMISS_AFTER_MS)
    return () => clearTimeout(timer)
  }, [router])

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
        Payment received — your credits are on the account.
      </AlertDescription>
    </Alert>
  )
}

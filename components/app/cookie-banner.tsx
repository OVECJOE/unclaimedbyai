"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useConsent, writeConsent, type ConsentChoice } from "@/lib/consent"

export default function CookieBanner() {
  const stored = useConsent()
  const [dismissed, setDismissed] = useState<ConsentChoice | null>(null)
  const choice = dismissed ?? stored

  function decide(value: ConsentChoice) {
    writeConsent(value)
    setDismissed(value)
  }

  // Nothing on the server, nothing once a choice exists.
  if (choice) return null

  return (
    <div
      role="region"
      aria-label="Cookie notice"
      className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-lg border bg-background p-4 md:inset-x-auto md:right-4"
    >
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          We use a few strictly necessary cookies (to keep you signed in and
          remember this choice), Cloudflare&apos;s bot check, and — only if you
          allow it — privacy-friendly analytics. No ads, no cross-site
          tracking. Details live in the{" "}
          <Link href="/privacy#cookies" className="text-primary underline">
            privacy policy
          </Link>
          .
        </p>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => decide("accepted")}>
            Allow analytics
          </Button>
          <Button size="sm" variant="outline" onClick={() => decide("declined")}>
            Decline
          </Button>
        </div>
      </div>
    </div>
  )
}

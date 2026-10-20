"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useConsent, writeConsent, type ConsentChoice } from "@/lib/consent"

const EMPTY_SUBSCRIBE = () => () => {}

export default function CookieBanner() {
  const stored = useConsent()
  const [dismissed, setDismissed] = useState<ConsentChoice | null>(null)
  const mounted = useSyncExternalStore(
    EMPTY_SUBSCRIBE,
    () => true,
    () => false
  )
  const bannerRef = useRef<HTMLDivElement>(null)
  const choice = dismissed ?? stored

  useEffect(() => {
    if (!mounted || choice) {
      document.body.style.paddingBottom = ""
      return
    }
    const banner = bannerRef.current
    if (!banner) return
    const observer = new ResizeObserver(() => {
      document.body.style.paddingBottom = `${banner.offsetHeight + 24}px`
    })
    observer.observe(banner)
    return () => {
      observer.disconnect()
      document.body.style.paddingBottom = ""
    }
  }, [mounted, choice])

  function decide(value: ConsentChoice) {
    writeConsent(value)
    setDismissed(value)
  }

  if (!mounted || choice) return null

  return (
    <div
      ref={bannerRef}
      role="region"
      aria-label="Cookie notice"
      className="fixed inset-x-4 bottom-4 z-60 mx-auto max-w-lg border bg-background p-4 shadow-lg md:inset-x-auto md:right-4"
    >
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          We use a few strictly necessary cookies (to keep you signed in and
          remember this choice), Cloudflare&apos;s bot check, and
          privacy-friendly analytics only if you allow it. No ads, no cross-site
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
          <Button
            size="sm"
            variant="outline"
            onClick={() => decide("declined")}
          >
            Decline
          </Button>
        </div>
      </div>
    </div>
  )
}

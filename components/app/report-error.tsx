"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert02Icon, Refresh01Icon } from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

/**
 * The report pages' own error boundary. The root error page exists,
 * but a crash inside the results table would otherwise take the whole
 * app down to it; a segment boundary keeps the shell — header, nav,
 * footer — and offers the retry where the failure happened. Copy is
 * written for a report mid-read, not for a generic404.
 */
export default function ReportError({
  error,
  reset,
  backHref = "/",
  backLabel = "Go home",
}: {
  error: Error & { digest?: string }
  reset: () => void
  backHref?: string
  backLabel?: string
}) {
  const [retrying, setRetrying] = useState(false)

  useEffect(() => {
    console.error(error)
  }, [error])

  useEffect(() => {
    if (!retrying) return
    const timer = setTimeout(() => setRetrying(false), 4000)
    return () => clearTimeout(timer)
  }, [retrying])

  return (
    <section className="px-4 py-10">
      <div className="mx-auto max-w-xl space-y-6 text-center">
        <Badge
          className="bg-primary/10 p-4 text-primary dark:bg-primary/20 dark:text-primary-foreground"
          asChild
        >
          <HugeiconsIcon icon={Alert02Icon} className="size-12" />
        </Badge>
        <div className="space-y-3">
          <p className="font-mono text-sm text-muted-foreground">
            {error.digest ? `Error ${error.digest}` : "Something broke"}
          </p>
          <h1 className="font-heading text-3xl font-semibold md:text-4xl">
            The report hit <span className="text-primary">a snag.</span>
          </h1>
          <p className="mx-auto max-w-prose text-muted-foreground">
            Nothing was lost — checks and credits only move when something
            succeeds. Give it another shot.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
          <Button
            size="lg"
            disabled={retrying}
            onClick={() => {
              setRetrying(true)
              reset()
            }}
          >
            <HugeiconsIcon icon={Refresh01Icon} />
            {retrying ? "Retrying…" : "Try again"}
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href={backHref}>{backLabel}</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

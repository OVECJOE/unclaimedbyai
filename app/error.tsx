"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert02Icon, Refresh01Icon } from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [retrying, setRetrying] = useState(false)

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="flex min-h-screen items-center px-4 py-10">
      <div className="mx-auto w-full max-w-xl space-y-6 text-center">
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
          <h1 className="font-heading text-4xl font-semibold md:text-5xl">
            That name&apos;s taken.{" "}
            <span className="text-primary">This page isn&apos;t.</span>
          </h1>
          <p className="mx-auto max-w-prose text-muted-foreground md:text-lg">
            Something went wrong on our side. Your work is safe — give it
            another shot or head back home.
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
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}

"use client"

import Link from "next/link"
import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased">
        <main className="flex min-h-screen items-center px-4 py-10">
          <div className="mx-auto w-full max-w-xl space-y-6 text-center">
            <p className="font-mono text-sm text-muted-foreground">
              {error.digest ? `Error ${error.digest}` : "Something broke"}
            </p>
            <h1 className="font-heading text-4xl font-semibold md:text-5xl">
              That name&apos;s taken.{" "}
              <span className="text-primary">This page isn&apos;t.</span>
            </h1>
            <p className="mx-auto max-w-prose text-muted-foreground md:text-lg">
              Something went wrong at the very root of the site. Nothing you
              typed is lost — try again, or head back home.
            </p>
            <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => reset()}
                className="inline-flex h-11 items-center bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Try again
              </button>
              <Link
                href="/"
                className="inline-flex h-11 items-center border border-border px-6 text-sm font-medium transition-colors hover:bg-muted"
              >
                Go home
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  )
}

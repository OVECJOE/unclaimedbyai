"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useTurnstile } from "@/components/public/turnstile"
import { getAnonSessionId } from "@/lib/anon"
import { directCheck, getMe } from "@/lib/api"
import { toastApiError } from "@/lib/api-errors"

/**
 * First visit to a name nobody has checked: start the free check
 * immediately and swap to the live view on the same URL. Signed-in
 * visitors go to their own history instead, where the check is theirs.
 */
export default function DirectCheckKickoff({ name }: { name: string }) {
  const router = useRouter()
  const turnstile = useTurnstile("anonymous_check")
  const startedRef = useRef(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    let cancelled = false

    async function run() {
      try {
        const user = await getMe(5000).catch(() => null)
        if (user) {
          const result = await directCheck({ name })
          if (!cancelled) router.push(`/dashboard/history/${result.search_id}`)
          return
        }
        // `verify` sends with the pre-solved token when one exists and,
        // on a 403, waits for the human to actually clear the widget it
        // just surfaced before resending. No token means no request.
        const result = await turnstile.verify((token) =>
          directCheck({
            name,
            anon_session_id: getAnonSessionId(),
            cf_turnstile_token: token,
          })
        )
        if (!result) {
          // The visitor left before solving the check, or the widget
          // could not load at all.
          setFailed(true)
          return
        }
        if (!cancelled) {
          router.replace(
            `/check/${encodeURIComponent(name)}?s=${result.search_id}&sid=${encodeURIComponent(getAnonSessionId())}`
          )
        }
      } catch (error) {
        if (cancelled) return
        setFailed(true)
        toastApiError(error, "The check could not start. Try again.")
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [name, router, turnstile])

  return (
    <div className="mx-auto max-w-prose space-y-4 border p-8 text-center">
      <p className="font-heading text-3xl font-semibold">{name}</p>
      {failed ? (
        <>
          <p className="text-sm text-muted-foreground">
            The check did not finish. If the human check box below is
            still showing, tick it and try again. Nothing was charged.
          </p>
          <Button
            onClick={() => {
              setFailed(false)
              turnstile.reset()
              startedRef.current = false
              window.location.reload()
            }}
          >
            Try again
          </Button>
        </>
      ) : (
        <>
          <p className="text-sm text-muted-foreground" role="status">
            Running the checks now. Domains, social handles, and what AI
            models already associate with the name. The first check on a
            name is free and this usually takes under a minute.
          </p>
          <div
            className="mx-auto h-1.5 w-full max-w-xs overflow-hidden bg-muted"
            role="progressbar"
            aria-label={`Checking ${name}`}
          >
            <span className="block h-full w-1/3 animate-pulse bg-primary" />
          </div>
        </>
      )}
      {turnstile.widget}
    </div>
  )
}

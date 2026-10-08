"use client"

import { useActionState, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { MagicLinkState } from "@/app/(public)/auth/actions"

const COOLDOWN_SECONDS = 45

function secondsLeft(sentAt: number) {
  return Math.max(
    0,
    COOLDOWN_SECONDS - Math.floor((Date.now() - sentAt) / 1000)
  )
}

export function MagicLinkTimer({
  sentAt,
  email,
  plan,
  onResendAction,
}: {
  sentAt?: string
  email: string
  plan?: string
  onResendAction: (
    prevState: MagicLinkState,
    formData: FormData
  ) => Promise<MagicLinkState>
}) {
  const [sentAtMs] = useState(() => (sentAt ? Number(sentAt) : Date.now()))
  const [remaining, setRemaining] = useState(() => secondsLeft(sentAtMs))
  const [state, resend, isPending] = useActionState(onResendAction, {
    error: null,
  })

  useEffect(() => {
    if (remaining <= 0) return
    const id = setInterval(() => setRemaining(secondsLeft(sentAtMs)), 1000)
    return () => clearInterval(id)
  }, [remaining, sentAtMs])

  if (remaining > 0) {
    const m = Math.floor(remaining / 60)
    const s = String(remaining % 60).padStart(2, "0")
    return (
      <span className="text-muted-foreground">
        Resend in {m}:{s}
      </span>
    )
  }

  return (
    <span className="space-y-1">
      <form action={resend}>
        <Input type="hidden" name="email" value={email} />
        {plan ? <Input type="hidden" name="plan" value={plan} /> : null}
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0 text-primary"
          type="submit"
          disabled={isPending}
        >
          {isPending ? "Sending…" : "Resend"}
        </Button>
      </form>
      {state.error ? (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
    </span>
  )
}

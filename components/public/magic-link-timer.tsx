"use client"

import { useEffect, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const COOLDOWN_SECONDS = 45

function secondsLeft(sentAt: number) {
  return Math.max(0, COOLDOWN_SECONDS - Math.floor((Date.now() - sentAt) / 1000))
}

export function MagicLinkTimer({
  sentAt,
  email,
  onResendAction,
}: {
  sentAt?: string
  email: string
  onResendAction: (formData: FormData) => void | Promise<void>
  }) {
  const [sentAtMs] = useState(() => sentAt ? Number(sentAt) : Date.now())
  const [remaining, setRemaining] = useState(() => secondsLeft(sentAtMs))
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (remaining <= 0) return
    const id = setInterval(() => setRemaining(secondsLeft(sentAtMs)), 1000)
    return () => clearInterval(id)
  }, [remaining, sentAtMs])

  if (remaining > 0) {
    const m = Math.floor(remaining / 60)
    const s = String(remaining % 60).padStart(2, "0")
    return <span className="text-muted-foreground">Resend in {m}:{s}</span>
  }

  return (
    <form action={(formData) => startTransition(() => onResendAction(formData))}>
      <Input type="hidden" name="email" value={email} />
      <Button variant="link" size="sm" className="h-auto p-0 text-primary" type="submit" disabled={isPending}>
        {isPending ? "Sending…" : "Resend"}
      </Button>
    </form>
  )
}

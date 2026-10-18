"use client"

import { startTransition, useActionState } from "react"
import { useFormStatus } from "react-dom"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { sendMagicLink } from "@/app/(public)/auth/actions"
import { useTurnstile } from "@/components/public/turnstile"

function SubmitButton({ actionPending }: { actionPending: boolean }) {
  // The form's own pending covers the Turnstile wait; the dispatch's
  // pending covers the server action it hands off to. Both, or a fast
  // submitter gets the button back while the link is still sending.
  const { pending } = useFormStatus()
  const busy = pending || actionPending
  return (
    <Button size="lg" className="w-full" type="submit" disabled={busy}>
      <span className="font-semibold">
        {busy ? "Sending…" : "Continue with email"}
      </span>
    </Button>
  )
}

export default function MagicLinkForm({ plan }: { plan?: string }) {
  const [state, action, actionPending] = useActionState(sendMagicLink, {
    error: null,
  })
  const turnstile = useTurnstile("magic_link")

  return (
    <form
      className="mt-16 space-y-4 sm:mx-auto sm:max-w-lg"
      action={async (formData) => {
        // Wait for an in-flight solve so a fast submit does not fire
        // before the widget has delivered a token. The token is left in
        // place rather than reset: a token is only single-use once the
        // backend has consumed it, and resetting here would discard a
        // valid solve and force a fresh challenge on every submit.
        const token = await turnstile.waitForToken(2500)
        formData.set("cf_turnstile_token", token ?? "")
        // The await above resumes outside the form action's transition,
        // and React 19 refuses a bare useActionState dispatch there, so
        // the handoff starts a transition of its own.
        startTransition(() => {
          action(formData)
        })
      }}
    >
      <div className="space-y-2">
        <Label
          htmlFor="email"
          className="font-medium text-muted-foreground uppercase"
        >
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
        />
        {plan ? <input type="hidden" name="plan" value={plan} /> : null}
      </div>
      {state.error ? (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      <SubmitButton actionPending={actionPending} />
      {turnstile.widget}
      <p className="mt-4 text-sm text-muted-foreground">
        By continuing, you agree to our{" "}
        <Link href="/terms" className="text-primary">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-primary">
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  )
}

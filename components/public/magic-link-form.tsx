"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { sendMagicLink } from "@/app/(public)/auth/actions"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button size="lg" className="w-full" type="submit" disabled={pending}>
      <span className="font-semibold">
        {pending ? "Sending…" : "Continue with email"}
      </span>
    </Button>
  )
}

export default function MagicLinkForm({ plan }: { plan?: string }) {
  const [state, action] = useActionState(sendMagicLink, { error: null })

  return (
    <form className="mt-16 space-y-4 sm:mx-auto sm:max-w-lg" action={action}>
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
      <SubmitButton />
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

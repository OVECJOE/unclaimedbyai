"use client"

import { useActionState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { requestLoginLink } from "@/lib/blog/actions"
import type { LoginState } from "@/lib/blog/types"

const initialState: LoginState = { status: "idle" }

export default function LoginForm() {
  const [state, action, pending] = useActionState(
    requestLoginLink,
    initialState
  )

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>
      <Button type="submit" disabled={pending}>
        Email me a sign-in link
      </Button>
      {state.message ? (
        <Alert variant={state.status === "error" ? "destructive" : "default"}>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}
    </form>
  )
}

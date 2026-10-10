"use client"

import { useActionState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateProfile } from "@/app/dashboard/account/actions"

function SaveButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Save changes"}
    </Button>
  )
}

export default function ProfileForm({
  fullName,
  email,
}: {
  fullName: string | null
  email: string
}) {
  const [state, action] = useActionState(updateProfile, {
    error: null,
    saved: false,
  })

  useEffect(() => {
    if (state.saved) toast.success("Profile saved.")
  }, [state.saved])

  return (
    <form action={action} className="max-w-prose space-y-3">
      <div className="space-y-1">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="full_name"
          defaultValue={fullName ?? ""}
          placeholder="Enter your name"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} disabled aria-describedby="email-note" />
        <p id="email-note" className="text-xs text-muted-foreground">
          Email is tied to your sign-in and can&apos;t be changed here.
        </p>
      </div>
      {state.error ? (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      <SaveButton />
    </form>
  )
}

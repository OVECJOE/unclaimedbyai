"use client"

import { useEffect, useState, useActionState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkBadge02Icon } from "@hugeicons/core-free-icons"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addToWaitlist, type WaitlistState } from "@/app/(public)/actions"

const STORAGE_KEY = "unclaimedbyai/joined-waitlist"

const initialState: WaitlistState = { status: "idle" }

export function WaitlistDialog() {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(
    addToWaitlist,
    initialState
  )

  const joined = state.status === "success"

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return
    const timer = setTimeout(() => setOpen(true), 6000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!joined) return
    localStorage.setItem(STORAGE_KEY, "1")
    const timer = setTimeout(() => setOpen(false), 2000)
    return () => clearTimeout(timer)
  }, [joined])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join the waitlist</DialogTitle>
          <DialogDescription>
            Early access before the checker goes live. Domains, social handles,
            and AI associations — checked in one report.
          </DialogDescription>
        </DialogHeader>

        {joined ? (
          <div className="flex items-center gap-2 text-primary">
            <HugeiconsIcon icon={CheckmarkBadge02Icon} />
            <span className="font-medium">{state.message}</span>
          </div>
        ) : (
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="waitlist-email"
                className="font-medium text-muted-foreground uppercase"
              >
                Email
              </Label>
              <Input
                id="waitlist-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
                required
              />
            </div>

            {state.status === "error" && (
              <p className="text-sm text-destructive">{state.message}</p>
            )}

            <Button
              size="lg"
              className="w-full"
              type="submit"
              disabled={isPending}
            >
              {isPending ? "Adding you…" : "Notify me"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
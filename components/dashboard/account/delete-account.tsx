"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { deleteAccount } from "@/app/dashboard/account/actions"

export default function DeleteAccount() {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const router = useRouter()

  async function confirm() {
    setPending(true)
    try {
      const result = await deleteAccount()
      if (result.error) {
        toast.error(result.error)
        setPending(false)
        return
      }
      router.push("/")
      router.refresh()
    } catch {
      toast.error("We couldn't delete your account. Try again.")
      setPending(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-0.5">
        <h5 className="font-heading text-lg font-medium text-destructive md:text-xl">
          Delete account
        </h5>
        <p className="text-sm text-muted-foreground">
          Permanently deletes your account and search history. This can&apos;t
          be undone.
        </p>
      </div>
      <Button
        type="button"
        variant="destructive"
        disabled={pending}
        onClick={() => setOpen(true)}
      >
        Delete account
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              Your profile, searches, and keys go away immediately. Purchase
              records are kept for accounting. There is no undo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={pending}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              disabled={pending}
              onClick={() => void confirm()}
            >
              {pending ? "Deleting…" : "Yes, delete everything"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

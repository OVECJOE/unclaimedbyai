"use client"

import { useActionState, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { AudioWave02Icon } from "@hugeicons/core-free-icons"
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
import { boostSignal } from "@/lib/blog/actions"
import type { BoostState } from "@/lib/blog/types"
import { cn } from "@/lib/utils"

const initialState: BoostState = { ok: false, boosted: false, message: "" }

export default function BoostButton({
  postId,
  commentId = null,
  count,
  boosted,
}: {
  postId: number
  commentId?: number | null
  count: number
  boosted: boolean
}) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(
    boostSignal,
    initialState
  )
  const sent = state.boosted || boosted

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={sent ? "default" : "outline"}
          size="sm"
          disabled={sent || isPending}
          onClick={() => setConfirmOpen(true)}
          aria-label={
            sent
              ? "Signal boosted"
              : commentId !== null
                ? "Boost this comment"
                : "Boost this post"
          }
        >
          <HugeiconsIcon icon={AudioWave02Icon} />
          <span className="font-mono" aria-label={`${count} boosts`}>
            {count + (state.boosted && !boosted ? 1 : 0)}
          </span>
        </Button>
        {state.message ? (
          <span
            role="status"
            className={cn(
              "text-xs",
              state.ok ? "text-primary" : "text-destructive"
            )}
          >
            {state.message}
          </span>
        ) : null}
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Boost this one?</DialogTitle>
            <DialogDescription>
              Boosting tells the author this resonated and adds your mark to its
              public count. Every reader gets one boost per post and comment,
              and it cannot be taken back.
            </DialogDescription>
          </DialogHeader>
          <form action={formAction}>
            <input type="hidden" name="postId" value={postId} />
            {commentId !== null ? (
              <input type="hidden" name="commentId" value={commentId} />
            ) : null}
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={isPending}
                onClick={() => setConfirmOpen(false)}
              >
                <HugeiconsIcon icon={AudioWave02Icon} />
                {isPending ? "Sending…" : "Send boost"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

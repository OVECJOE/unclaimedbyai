"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
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
import { useBoostState } from "./boost-state"

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
  const { postBoosted, commentBoosted, refresh } = useBoostState()
  const contextBoosted =
    commentId !== null ? commentBoosted.has(commentId) : postBoosted
  const sent = state.boosted || boosted || contextBoosted
  const displayCount = count + (state.inserted ? 1 : 0)
  const toasted = useRef("")

  useEffect(() => {
    if (!state.message) return
    if (toasted.current !== state.message) {
      toasted.current = state.message
      if (state.ok) toast.success(state.message)
      else toast.error(state.message)
    }
    if (state.ok) refresh()
    // Close the confirm dialog only once the action actually resolved, so
    // failures aren't hidden behind an already-dismissed dialog.
    const id = setTimeout(() => setConfirmOpen(false), 0)
    return () => clearTimeout(id)
  }, [state, refresh])

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
              ? `Signal boosted, ${displayCount} boosts`
              : commentId !== null
                ? `Boost this comment, ${displayCount} boosts`
                : `Boost this post, ${displayCount} boosts`
          }
        >
          <HugeiconsIcon icon={AudioWave02Icon} className="size-5" />
          Boost
          <span className="font-mono">[{displayCount}]</span>
        </Button>
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
              <Button type="submit" disabled={isPending}>
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

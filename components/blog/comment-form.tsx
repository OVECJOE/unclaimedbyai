"use client"

import { useActionState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { submitComment } from "@/lib/blog/actions"
import type { CommentSubmitState } from "@/lib/blog/types"
import { cn } from "@/lib/utils"

const initialState: CommentSubmitState = { ok: false, message: "" }

export default function CommentForm({
  postId,
  parentId = null,
  compact = false,
}: {
  postId: number
  parentId?: number | null
  compact?: boolean
}) {
  const [state, formAction, isPending] = useActionState(
    submitComment,
    initialState
  )
  const formRef = useRef<HTMLFormElement>(null)
  const wasOk = useRef(false)

  useEffect(() => {
    if (state.ok && !wasOk.current) formRef.current?.reset()
    wasOk.current = state.ok
  }, [state])

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <input type="hidden" name="postId" value={postId} />
      {parentId !== null ? (
        <input type="hidden" name="parentId" value={parentId} />
      ) : null}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />
      <div
        className={cn(
          "grid gap-3",
          compact
            ? "grid-cols-1"
            : "grid-cols-1 md:grid-cols-[12rem_minmax(0,1fr)]"
        )}
      >
        <div className="space-y-2">
          <Label htmlFor={parentId ? `name-${parentId}` : "name"}>
            Codename
          </Label>
          <Input
            id={parentId ? `name-${parentId}` : "name"}
            name="authorName"
            placeholder="Ada, Turing, or something entirely"
            maxLength={60}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={parentId ? `body-${parentId}` : "body"}>
            Transmission
          </Label>
          <Textarea
            id={parentId ? `body-${parentId}` : "body"}
            name="body"
            placeholder="Tell me what you think, what I got wrong, or what you would like me to break down next."
            rows={compact ? 2 : 3}
            maxLength={2000}
            required
          />
        </div>
      </div>
      {state.message ? (
        <p
          role={state.ok ? "status" : "alert"}
          className={cn(
            "text-sm",
            state.ok ? "text-primary" : "text-destructive"
          )}
        >
          {state.message}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Transmitting…"
            : parentId !== null
              ? "Reply"
              : "Transmit"}
        </Button>
        {compact ? null : (
          <span className="text-sm text-muted-foreground">
            Try sending it empty first to see the error messages.
          </span>
        )}
      </div>
    </form>
  )
}

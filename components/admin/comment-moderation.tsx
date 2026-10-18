"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  approveComment,
  deleteCommentAction,
  rejectComment,
} from "@/lib/blog/actions"

type ModerationKind = "approve" | "reject" | "delete"

const MODERATION: Record<
  ModerationKind,
  { run: (formData: FormData) => Promise<void>; done: string }
> = {
  approve: { run: approveComment, done: "Comment approved." },
  reject: { run: rejectComment, done: "Comment rejected." },
  delete: { run: deleteCommentAction, done: "Comment deleted." },
}

function moderationFormData(id: number): FormData {
  const body = new FormData()
  body.append("id", String(id))
  return body
}

function useModeration() {
  const [active, setActive] = useState<ModerationKind | null>(null)
  const [pending, startTransition] = useTransition()

  function run(kind: ModerationKind, id: number) {
    if (pending) return
    setActive(kind)
    startTransition(async () => {
      try {
        await MODERATION[kind].run(moderationFormData(id))
        toast.success(MODERATION[kind].done)
      } catch {
        toast.error("That didn't go through. Try again.")
      } finally {
        setActive(null)
      }
    })
  }

  return { active, pending, run }
}

export function ModerationButtons({ id }: { id: number }) {
  const { active, pending, run } = useModeration()

  return (
    <div className="flex gap-2">
      <Button
        type="button"
        size="sm"
        disabled={pending}
        onClick={() => run("approve", id)}
      >
        {active === "approve" ? "Approving…" : "Approve"}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() => run("reject", id)}
      >
        {active === "reject" ? "Rejecting…" : "Reject"}
      </Button>
    </div>
  )
}

export function DeleteCommentButton({ id }: { id: number }) {
  const { active, pending, run } = useModeration()

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() => run("delete", id)}
    >
      {active === "delete" ? "Deleting…" : "Delete"}
    </Button>
  )
}

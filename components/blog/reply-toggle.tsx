"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import CommentForm from "./comment-form"

export default function ReplyToggle({
  postId,
  parentId,
  authorName,
}: {
  postId: number
  parentId: number
  authorName: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="pt-1">
      {open ? (
        <div className="border bg-muted/40 p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Replying to {authorName}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Close
            </Button>
          </div>
          <CommentForm postId={postId} parentId={parentId} compact />
        </div>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          Reply
        </Button>
      )}
    </div>
  )
}

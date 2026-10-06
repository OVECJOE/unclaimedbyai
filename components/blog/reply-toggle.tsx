"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import CommentForm from "./comment-form"

export default function ReplyToggle({
  postId,
  parentId,
}: {
  postId: number
  parentId: number
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="pt-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "Close" : "Reply"}
      </Button>
      {open ? (
        <div className="mt-2 border-l-2 border-primary/40 pl-4">
          <CommentForm postId={postId} parentId={parentId} compact />
        </div>
      ) : null}
    </div>
  )
}

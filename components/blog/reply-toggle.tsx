"use client"

import { useEffect, useRef, useState } from "react"
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
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      panelRef.current?.querySelector<HTMLTextAreaElement>("textarea")?.focus()
    }
  }, [open])

  function close() {
    setOpen(false)
    triggerRef.current?.focus()
  }

  const panelId = `reply-panel-${parentId}`

  return (
    <>
      <Button
        ref={triggerRef}
        type="button"
        variant="ghost"
        size="sm"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => (open ? close() : setOpen(true))}
      >
        {open ? "Close" : "Reply"}
      </Button>
      {open ? (
        <div
          ref={panelRef}
          id={panelId}
          className="w-full border bg-muted/40 p-3 sm:p-4"
        >
          <p className="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Replying to {authorName}
          </p>
          <CommentForm postId={postId} parentId={parentId} compact />
        </div>
      ) : null}
    </>
  )
}

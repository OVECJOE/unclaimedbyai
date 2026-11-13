"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const REASONS = [
  ["offensive", "It is offensive or hateful"],
  ["trademark", "It uses a brand or trademark unfairly"],
  ["private", "It shares something private"],
  ["spam", "It is spam or an ad"],
  ["other", "Something else"],
] as const

/** A small way to flag a page. Three separate people hide it for review. */
export default function ReportButton({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState<string>("other")
  const [detail, setDetail] = useState("")
  const [sending, setSending] = useState(false)

  async function send() {
    setSending(true)
    try {
      const res = await fetch(
        `/api/v1/public/ideas/${encodeURIComponent(slug)}/report`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ reason, detail: detail.trim() || null }),
        }
      )
      if (!res.ok) throw new Error("failed")
      toast.success("Thanks. We will look at this page.")
      setOpen(false)
      setDetail("")
    } catch {
      toast.error("Could not send that. Try again in a moment.")
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Report this page
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report this page</DialogTitle>
          <DialogDescription>
            Tell us what is wrong. We review every report.
          </DialogDescription>
        </DialogHeader>
        <fieldset className="space-y-2">
          <legend className="sr-only">Reason</legend>
          {REASONS.map(([value, label]) => (
            <label key={value} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="reason"
                value={value}
                checked={reason === value}
                onChange={() => setReason(value)}
                className="accent-primary"
              />
              {label}
            </label>
          ))}
        </fieldset>
        <textarea
          value={detail}
          onChange={(event) => setDetail(event.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Anything else we should know (optional)"
          className="w-full border bg-transparent p-2 text-sm"
        />
        <Button onClick={() => void send()} disabled={sending}>
          {sending ? "Sending…" : "Send report"}
        </Button>
      </DialogContent>
    </Dialog>
  )
}

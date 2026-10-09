"use client"

import { useActionState, useEffect, useRef } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { sendContactMessage, type ContactState } from "@/lib/contact"

const initialState: ContactState = { ok: false, message: "" }

const TOPICS = [
  { value: "support", label: "Support: something isn't working" },
  { value: "billing", label: "Billing: credits, receipts, refunds" },
  { value: "press", label: "Press & partnerships" },
  { value: "privacy", label: "Privacy request: access or deletion" },
  { value: "other", label: "Something else" },
]

export default function ContactForm() {
  const [state, formAction, isPending] = useActionState(
    sendContactMessage,
    initialState
  )
  const formRef = useRef<HTMLFormElement>(null)
  // Uncontrolled hidden field stamped with the render time, so the server
  // action can spot speed-submitting bots. Written imperatively because
  // Date.now() must not run during render.
  const startedRef = useRef<HTMLInputElement>(null)
  // Dedupe on state *identity*, not message text: React StrictMode re-runs
  // effects with the same state object, but a genuinely new submission
  // (even with an identical message) must always toast.
  const handled = useRef<ContactState | null>(null)

  const stamp = () => {
    if (startedRef.current) startedRef.current.value = String(Date.now())
  }

  useEffect(() => {
    stamp()
  }, [])

  useEffect(() => {
    if (handled.current === state) return
    handled.current = state
    if (state.ok) {
      formRef.current?.reset()
      stamp()
    }
    if (state.message) {
      if (state.ok) toast.success(state.message)
      else toast.error(state.message)
    }
  }, [state])

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {/* Honeypot: hidden from humans, tempting to bots */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />
      <input
        type="hidden"
        name="started"
        ref={startedRef}
        defaultValue=""
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-name">Name</Label>
          <Input
            id="contact-name"
            name="name"
            placeholder="What should we call you?"
            maxLength={120}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-email">Email</Label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            maxLength={254}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-topic">What&apos;s this about?</Label>
        <Select name="topic" defaultValue="support">
          <SelectTrigger id="contact-topic" className="w-full">
            <SelectValue placeholder="Pick a topic" />
          </SelectTrigger>
          <SelectContent>
            {TOPICS.map((topic) => (
              <SelectItem key={topic.value} value={topic.value}>
                {topic.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-message">Message</Label>
        <Textarea
          id="contact-message"
          name="message"
          placeholder="The details: what happened, what you expected, links, the name you checked. The more specific, the faster we can help."
          rows={6}
          maxLength={5000}
          required
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? "Sending..." : "Send message"}
        </Button>
        <p className="text-sm text-muted-foreground">
          Or just email{" "}
          <a
            href="mailto:hello@unclaimedbyai.com"
            className="text-primary hover:underline"
          >
            hello@unclaimedbyai.com
          </a>
        </p>
      </div>
    </form>
  )
}

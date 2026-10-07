"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowUpIcon } from "@hugeicons/core-free-icons"
import useTypewriter from "@/hooks/typewriter"

const EXAMPLES = [
  "A pay-per-report tool that checks if a name is taken",
  "An AI note-taking app for teams",
  "A project management tool for freelancers",
  "A workout tracker for climbers",
]

export default function Prompter({
  onSubmit,
  pending = false,
}: {
  onSubmit?: (value: string) => void
  pending?: boolean
}) {
  const [value, setValue] = useState("")
  const ghostText = useTypewriter(EXAMPLES, value.length === 0)

  return (
    <form
      className="mx-auto max-w-prose"
      onSubmit={(event) => {
        event.preventDefault()
        if (value.trim()) onSubmit?.(value.trim())
      }}
    >
      <div className="focus-within:border-primary focus-within:ring-primary/15 relative border border-border bg-card p-3 transition-colors focus-within:ring-4 dark:border-primary/30 dark:bg-secondary/40">
        <Textarea
          id="prompt"
          name="prompt"
          rows={2}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-label="Describe what you're building"
          placeholder={value.length === 0 ? ghostText : undefined}
          className="min-h-16 resize-none border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
        />

        <div className="mt-2 flex items-center justify-end">
          <Button type="submit" size="icon" disabled={!value.trim() || pending}>
            <HugeiconsIcon icon={ArrowUpIcon} className="size-4" />
            <span className="sr-only">Generate names</span>
          </Button>
        </div>
      </div>
    </form>
  )
}

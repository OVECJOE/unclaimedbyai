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
  "A budgeting app for creatives",
  "A marketplace where neighbors swap garden seeds",
  "A newsletter about building hardware",
  "A language exchange app for travelers",
]

export default function Prompter({
  onSubmit,
  pending = false,
  defaultValue = "",
}: {
  onSubmit?: (value: string) => void
  pending?: boolean
  defaultValue?: string
}) {
  const [value, setValue] = useState(defaultValue)
  const ghostText = useTypewriter(EXAMPLES, value.length === 0)

  function submit() {
    if (value.trim()) onSubmit?.(value.trim())
  }

  return (
    <form
      className="mx-auto max-w-prose space-y-3"
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
    >
      <div className="group relative overflow-hidden border border-border bg-card transition-colors focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15 dark:border-primary/30 dark:bg-secondary/40">
        <div
          aria-hidden="true"
          className="prompter-aura z-0 opacity-75 transition-opacity duration-500 group-focus-within:opacity-100"
        >
          <span className="prompter-blob prompter-blob-blue" />
          <span className="prompter-blob prompter-blob-violet" />
          <span className="prompter-blob prompter-blob-coral" />
          <span className="prompter-blob prompter-blob-amber" />
        </div>
        <div className="relative z-10 space-y-2 p-3">
          <label
            htmlFor="prompt"
            className="block text-xs font-semibold tracking-widest text-muted-foreground uppercase"
          >
            Describe what you&apos;re building
          </label>
          <Textarea
            id="prompt"
            name="prompt"
            rows={2}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                event.preventDefault()
                submit()
              }
            }}
            maxLength={400}
            aria-describedby="prompt-limit"
            placeholder={value.length === 0 ? ghostText : undefined}
            className="min-h-16 resize-none border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
          />

          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <span id="prompt-limit" className="tabular-nums">
                {value.length >= 360 ? `${value.length}/400` : null}
              </span>
              <span className="hidden items-center gap-1 sm:flex">
                <kbd className="border bg-muted px-1 font-mono text-[10px]">
                  Ctrl
                </kbd>
                <span>+</span>
                <kbd className="border bg-muted px-1 font-mono text-[10px]">
                  Enter
                </kbd>
              </span>
            </span>
            <Button
              type="submit"
              disabled={!value.trim() || pending}
              className="gap-2"
            >
              {pending ? "Starting…" : "Generate names"}
              <HugeiconsIcon icon={ArrowUpIcon} className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}

"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowUpIcon } from "@hugeicons/core-free-icons"
import useTypewriter from "@/hooks/typewriter"
import { cn } from "@/lib/utils"

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

export type PrompterMode = "idea" | "name"

function ModePill({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "border px-2.5 py-1 text-xs font-medium backdrop-blur-sm transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background/80 text-foreground hover:border-primary/50 hover:text-primary"
      )}
    >
      {label}
    </button>
  )
}

export default function Prompter({
  onSubmit,
  pending = false,
  defaultValue = "",
}: {
  onSubmit?: (value: string, mode: PrompterMode) => void
  pending?: boolean
  defaultValue?: string
}) {
  const [value, setValue] = useState(defaultValue)
  const [mode, setMode] = useState<PrompterMode>("idea")
  const ghostText = useTypewriter(EXAMPLES, mode === "idea" && value.length === 0)

  function submit() {
    if (value.trim()) onSubmit?.(value.trim(), mode)
  }

  function switchMode(next: PrompterMode) {
    if (next === mode) return
    setMode(next)
    setValue("")
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
        <div className="relative z-10 p-3">
          <div
            role="group"
            aria-label="What do you want to do"
            className="mb-2 flex items-center gap-1.5"
          >
            <ModePill
              label="Idea"
              active={mode === "idea"}
              onClick={() => switchMode("idea")}
            />
            <ModePill
              label="Name"
              active={mode === "name"}
              onClick={() => switchMode("name")}
            />
          </div>
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
            maxLength={mode === "name" ? 60 : 400}
            aria-label={
              mode === "name"
                ? "The exact name to check"
                : "Describe what you're building"
            }
            aria-describedby="prompt-limit"
            placeholder={
              mode === "name"
                ? "e.g. Nexuare"
                : value.length === 0
                  ? ghostText
                  : undefined
            }
            className="min-h-16 resize-none border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
          />

          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <span id="prompt-limit" className="tabular-nums">
                {mode === "name"
                  ? value.length >= 40
                    ? `${value.length}/60`
                    : null
                  : value.length >= 360
                    ? `${value.length}/400`
                    : null}
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
              {mode === "name"
                ? pending
                  ? "Checking…"
                  : "Check this name"
                : pending
                  ? "Starting…"
                  : "Generate names"}
              <HugeiconsIcon icon={ArrowUpIcon} className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}

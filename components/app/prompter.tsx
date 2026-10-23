"use client"

import { useEffect, useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowUpIcon } from "@hugeicons/core-free-icons"
import useTypewriter from "@/hooks/typewriter"
import { playSound } from "@/lib/sound/engine"
import { cn } from "@/lib/utils"
import type { SignalProfile } from "@/lib/api"
import SignalFields from "@/components/playground/signal-fields"

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

export type PrompterMode = "idea" | "studio" | "name"

export const PROMPTER_NAME_MODE_EVENT = "prompter:name-mode"

const MODES: { value: PrompterMode; label: string; hint: string }[] = [
  {
    value: "idea",
    label: "Idea",
    hint: "Turn a rough idea into a set of name candidates.",
  },
  {
    value: "studio",
    label: "Studio",
    hint: "Business ideas shaped by your skills, edge, and audience.",
  },
  {
    value: "name",
    label: "Name",
    hint: "Check one exact name across AI, domains and handles.",
  },
]

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
    <Button
      type="button"
      size="sm"
      variant="secondary"
      aria-pressed={active}
      onClick={onClick}
      className={cn({
        "bg-primary text-primary-foreground hover:text-primary": active,
        "bg-background/80 text-foreground hover:border-primary/50 hover:text-primary":
          !active,
      })}
    >
      {label}
    </Button>
  )
}

/**
 * The prompter: one box, three intentions. Idea runs the brief through
 * the naming pipeline and promises names. Studio builds a sandbox of
 * business ideas, collecting the steer inline for visitors who have no
 * account profile to copy it from. Name checks one exact name. The
 * mode pills sit inside the box so the choice is part of the typing,
 * not a setting above it.
 */
export default function Prompter({
  onSubmit,
  pending = false,
  defaultValue = "",
  showSignalFields = false,
}: {
  onSubmit?: (
    value: string,
    mode: PrompterMode,
    signals?: Partial<SignalProfile>
  ) => void
  pending?: boolean
  defaultValue?: string
  /** Studio mode collects the eight signals inline when true, which is
   *  only right for visitors without an account steer to inherit. */
  showSignalFields?: boolean
}) {
  const [value, setValue] = useState(defaultValue)
  const [mode, setMode] = useState<PrompterMode>("idea")
  const [signals, setSignals] = useState<Partial<SignalProfile>>({})
  const [signalsExpanded, setSignalsExpanded] = useState(false)
  const ghostText = useTypewriter(
    EXAMPLES,
    mode !== "name" && value.length === 0
  )

  useEffect(() => {
    function onNameMode() {
      setMode("name")
      const field = document.getElementById("prompt")
      if (field instanceof HTMLTextAreaElement) {
        field.focus({ preventScroll: true })
      }
    }
    window.addEventListener(PROMPTER_NAME_MODE_EVENT, onNameMode)
    return () =>
      window.removeEventListener(PROMPTER_NAME_MODE_EVENT, onNameMode)
  }, [])

  function submit() {
    if (!value.trim() || pending) return
    // The launch chord is seeded by the brief itself: every idea
    // sounds like the idea it was born from, and never twice the same.
    playSound("launch", `${mode}:${value.trim()}`)
    if (mode === "name" || !showSignalFields) {
      onSubmit?.(value.trim(), mode)
      return
    }
    onSubmit?.(value.trim(), mode, signals)
  }

  function switchMode(next: PrompterMode) {
    if (next === mode) return
    setMode(next)
    setValue("")
  }

  return (
    <form
      data-tour="prompter"
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
            className="mb-2 flex flex-wrap items-center gap-1.5"
          >
            {MODES.map((option) => (
              <ModePill
                key={option.value}
                label={option.label}
                active={mode === option.value}
                onClick={() => switchMode(option.value)}
              />
            ))}
          </div>
          <p className="mb-2 text-start text-xs text-muted-foreground">
            {MODES.find((option) => option.value === mode)?.hint}
          </p>
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

          {mode === "studio" && showSignalFields ? (
            <div className="mt-3 space-y-3 border-t pt-3">
              <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Steer the strategy studios
              </p>
              <SignalFields
                signals={signals}
                onChange={setSignals}
                expanded={signalsExpanded}
              />
              <button
                type="button"
                onClick={() => setSignalsExpanded((current) => !current)}
                className="text-xs text-primary underline"
              >
                {signalsExpanded
                  ? "Hide details"
                  : "Answer more for sharper ideas"}
              </button>
            </div>
          ) : null}
          {mode === "studio" && !showSignalFields ? (
            <p className="mt-3 border-t pt-3 text-xs text-muted-foreground">
              Your account steer shapes these ideas. Adjust it any time in
              Account.
            </p>
          ) : null}

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
                  : mode === "studio"
                    ? "Generate with steer"
                    : "Generate names"}
              <HugeiconsIcon icon={ArrowUpIcon} className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}

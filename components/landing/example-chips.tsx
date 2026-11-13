"use client"

import { fillPrompter, type PrompterMode } from "@/components/app/prompter"
import { cn } from "@/lib/utils"

const EXAMPLES: { label: string; value: string; mode: PrompterMode }[] = [
  { label: "Quillfern", value: "Quillfern", mode: "name" },
  { label: "Nexuare", value: "Nexuare", mode: "name" },
  {
    label: "A budgeting app for creatives",
    value: "A budgeting app for creatives",
    mode: "idea",
  },
  {
    label: "Coffee subscription for remote teams",
    value: "A coffee subscription for remote teams",
    mode: "idea",
  },
]

/**
 * One-tap starting points under the hero prompter. A visitor who came
 * to look can try the product without thinking of a name first: a tap
 * fills the box in the right mode, and the submit is still theirs.
 */
export default function ExampleChips({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "mx-auto flex max-w-2xl flex-wrap items-center gap-2 text-xs sm:justify-center",
        className
      )}
    >
      <span className="font-mono tracking-[0.12em] text-muted-foreground uppercase">
        Try
      </span>
      {EXAMPLES.map((example) => (
        <button
          key={example.label}
          type="button"
          onClick={() => fillPrompter({ value: example.value, mode: example.mode })}
          className="inline-flex min-h-8 items-center gap-1.5 border border-border bg-background px-2.5 py-1 transition-colors hover:border-primary/50 hover:text-primary"
        >
          <span
            aria-hidden
            className="font-mono text-[0.625rem] text-muted-foreground uppercase"
          >
            {example.mode === "name" ? "name" : "idea"}
          </span>
          {example.label}
        </button>
      ))}
    </div>
  )
}

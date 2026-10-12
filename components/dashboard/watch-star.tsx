"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { StarIcon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

export default function WatchStar({
  name,
  watching,
  pending,
  onToggle,
}: {
  name: string
  watching: boolean
  pending: boolean
  onToggle: (name: string) => void
}) {
  return (
    <button
      type="button"
      disabled={pending}
      aria-pressed={watching}
      aria-label={
        watching ? `Stop watching ${name}` : `Watch ${name} for changes`
      }
      title={watching ? "Watching this name" : "Watch this name"}
      onClick={() => onToggle(name)}
      className="relative z-10 shrink-0 rounded-sm p-0.5 transition-colors hover:text-primary"
    >
      <HugeiconsIcon
        icon={StarIcon}
        strokeWidth={watching ? 2.4 : 1.8}
        className={cn(
          "size-4",
          watching
            ? "fill-primary text-primary"
            : "text-muted-foreground group-hover:text-primary"
        )}
      />
      <span className="sr-only">
        {watching ? "Stop watching" : "Watch"} {name}
      </span>
    </button>
  )
}

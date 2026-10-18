"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  CheckmarkCircle02Icon,
  ChevronDownIcon,
  Watch01Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { Sandbox } from "@/lib/api"
import NewSandboxDialog from "@/components/playground/new-sandbox-dialog"

/**
 * Which sandbox the canvas is showing. A searchable dropdown rather than
 * a row of chips: the list is short by plan (ten at most) but grows past
 * what a single row can hold, and a filter keeps a long list reachable.
 * The panel is capped to the viewport so it works on a phone, where the
 * keyboard and a full-width list beat a wide popover.
 */
export default function SandboxSwitcher({
  sandboxes,
  activeId,
}: {
  sandboxes: Sandbox[]
  activeId: string | null
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)

  const active = sandboxes.find((sandbox) => sandbox.public_id === activeId)

  function pick(publicId: string) {
    setOpen(false)
    router.push(`/dashboard/playground?sandbox=${publicId}`)
  }

  return (
    <div
      data-tour="switcher"
      className="flex flex-wrap items-center justify-between gap-2"
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="min-w-0 flex-1 justify-between gap-2 font-normal sm:max-w-80"
            aria-label="Switch sandbox"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span className="truncate">
                {active ? active.name : "Pick a sandbox"}
              </span>
            </span>
            <HugeiconsIcon
              icon={ChevronDownIcon}
              className={cn(
                "size-4 shrink-0 transition-transform",
                open ? "rotate-180" : ""
              )}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={6}
          collisionPadding={16}
          className="w-[min(22rem,calc(100vw-2rem))] p-0"
        >
          <Command>
            <CommandInput placeholder="Search sandboxes…" />
            <CommandList>
              <CommandEmpty>
                {sandboxes.length
                  ? "No sandbox matches."
                  : "No sandboxes yet. Start one to generate ideas."}
              </CommandEmpty>
              {sandboxes.length ? (
                <CommandGroup heading="Sandboxes">
                  {sandboxes.map((sandbox) => (
                    <CommandItem
                      key={sandbox.public_id}
                      value={sandbox.name}
                      onSelect={() => pick(sandbox.public_id)}
                    >
                      <span className="flex w-full items-center gap-2">
                        <span className="flex-1 truncate">{sandbox.name}</span>
                        {sandbox.public_id === activeId ? (
                          <HugeiconsIcon
                            icon={CheckmarkCircle02Icon}
                            className="size-4 shrink-0 text-primary"
                          />
                        ) : null}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : null}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex items-center gap-1.5 border px-3 py-1.5 text-sm transition-colors hover:border-primary/50 hover:text-primary"
        >
          <HugeiconsIcon icon={Add01Icon} className="size-4" />
          New sandbox
        </button>
        <Link
          href="/dashboard/playground/watchlist"
          className="flex items-center gap-1.5 border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
        >
          <HugeiconsIcon icon={Watch01Icon} className="size-4" />
          Watchlist
        </Link>
      </div>

      <NewSandboxDialog open={creating} onOpenChange={setCreating} />
    </div>
  )
}

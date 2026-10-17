"use client"

import {
  useState,
  forwardRef,
  type ReactNode,
  type ButtonHTMLAttributes,
} from "react"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { StarIcon } from "@hugeicons/core-free-icons"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ApiError, addWatch, removeWatch, updateWatch } from "@/lib/api"
import { toastApiError } from "@/lib/api-errors"
import { cn } from "@/lib/utils"

export const TLD_OPTIONS = [
  "com",
  "ai",
  "io",
  "co",
  "app",
  "dev",
  "net",
  "org",
  "xyz",
  "me",
  "so",
  "sh",
]
export const PLATFORM_OPTIONS = [
  "github",
  "x",
  "instagram",
  "tiktok",
  "youtube",
  "linkedin",
  "reddit",
  "discord",
  "threads",
  "producthunt",
]
export const MAX_TLDS = 5
export const MAX_PLATFORMS = 3
const DEFAULT_TLDS = ["com", "ai"]
const DEFAULT_PLATFORMS = ["github", "x"]

function toggleValue(list: string[], value: string, max: number): string[] {
  if (list.includes(value)) {
    return list.filter((item) => item !== value)
  }
  if (list.length >= max) return list
  return [...list, value]
}

export function ChipGroup({
  label,
  unit,
  options,
  selected,
  max,
  onToggle,
}: {
  label: string
  unit: "tld" | "handle"
  options: string[]
  selected: string[]
  max: number
  onToggle: (value: string) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          {label}
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {selected.length} of {max}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const active = selected.includes(option)
          const disabled = !active && selected.length >= max
          return (
            <button
              key={option}
              type="button"
              aria-pressed={active}
              disabled={disabled}
              onClick={() => onToggle(option)}
              className={cn(
                "border px-2.5 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
                disabled && "cursor-not-allowed opacity-40"
              )}
            >
              {unit === "tld" ? `.${option}` : `@${option}`}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function WatchForm({
  name,
  searchId,
  watchId,
  initialTlds,
  initialPlatforms,
  onDone,
  onSaved,
}: {
  name: string
  searchId: number
  watchId?: number
  initialTlds?: string[]
  initialPlatforms?: string[]
  onDone: () => void
  onSaved?: (watchId: number, tlds: string[], platforms: string[]) => void
}) {
  const [tlds, setTlds] = useState<string[]>(initialTlds ?? DEFAULT_TLDS)
  const [platforms, setPlatforms] = useState<string[]>(
    initialPlatforms ?? DEFAULT_PLATFORMS
  )
  const [pending, setPending] = useState(false)

  async function submit() {
    setPending(true)
    try {
      if (watchId !== undefined) {
        await updateWatch(watchId, { tlds, platforms })
        toast.success(`Watch updated for ${name}.`)
        onSaved?.(watchId, tlds, platforms)
      } else {
        const watch = await addWatch({
          search_id: searchId,
          name,
          tlds,
          platforms,
        })
        toast.success(
          `Now watching ${name}. We will email you if any of its domains or handles get claimed.`
        )
        onSaved?.(watch.id, tlds, platforms)
      }
      onDone()
    } catch (error) {
      if (error instanceof ApiError && error.status === 402) {
        toast.error(error.message)
      } else {
        toastApiError(error, "Could not save your watch.")
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="space-y-4">
      <ChipGroup
        label="Domains"
        unit="tld"
        options={TLD_OPTIONS}
        selected={tlds}
        max={MAX_TLDS}
        onToggle={(value) =>
          setTlds((list) => toggleValue(list, value, MAX_TLDS))
        }
      />
      <ChipGroup
        label="Handles"
        unit="handle"
        options={PLATFORM_OPTIONS}
        selected={platforms}
        max={MAX_PLATFORMS}
        onToggle={(value) =>
          setPlatforms((list) => toggleValue(list, value, MAX_PLATFORMS))
        }
      />
      {tlds.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Pick at least one domain to keep an eye on.
        </p>
      ) : null}
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="outline" disabled={pending} onClick={onDone}>
          Cancel
        </Button>
        <Button
          size="sm"
          disabled={pending || tlds.length === 0}
          onClick={() => void submit()}
        >
          {pending
            ? "Saving…"
            : watchId !== undefined
              ? "Save changes"
              : "Start watching"}
        </Button>
      </div>
    </div>
  )
}

function RemoveWatchDialog({
  name,
  watchId,
  open,
  onOpenChange,
  onRemoved,
  children,
}: {
  name: string
  watchId: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onRemoved?: () => void
  children: ReactNode
}) {
  const [pending, setPending] = useState(false)

  async function confirm() {
    setPending(true)
    try {
      await removeWatch(watchId)
      toast.success(`No longer watching ${name}.`)
      onRemoved?.()
      onOpenChange(false)
    } catch (error) {
      toastApiError(error, "Could not update your watchlist.")
    } finally {
      setPending(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Stop watching {name}?</AlertDialogTitle>
          <AlertDialogDescription>
            You will stop getting alerts when its domains or handles get
            claimed, and the clean streak goes away. You can start watching
            again at any time.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>
            Keep watching
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              disabled={pending}
              onClick={() => void confirm()}
            >
              {pending ? "Stopping…" : "Stop watching"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Spreads incoming props so Radix asChild triggers can inject their
// ref and click handlers onto the underlying button element.
const StarTrigger = forwardRef<
  HTMLButtonElement,
  { name: string; watched: boolean } & ButtonHTMLAttributes<HTMLButtonElement>
>(function StarTrigger({ name, watched, className, ...props }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      aria-pressed={watched}
      aria-label={
        watched ? `Stop watching ${name}` : `Watch ${name} for changes`
      }
      title={watched ? "Watching this name" : "Watch this name"}
      className={cn(
        "relative z-10 shrink-0 rounded-sm p-0.5 transition-colors hover:text-primary",
        className
      )}
      {...props}
    >
      <HugeiconsIcon
        icon={StarIcon}
        strokeWidth={watched ? 2.4 : 1.8}
        className={cn(
          "size-4",
          watched
            ? "fill-primary text-primary"
            : "text-muted-foreground group-hover:text-primary"
        )}
      />
    </button>
  )
})

/**
 * Star toggle for name rows and report headers. Unwatched names open a
 * config popover, watched names open a confirmation dialog, so removal
 * is never a single stray click.
 */
export function WatchButton({
  name,
  searchId,
  watchId,
}: {
  name: string
  searchId: number
  watchId?: number | null
}) {
  const [currentId, setCurrentId] = useState<number | null>(watchId ?? null)
  const [configOpen, setConfigOpen] = useState(false)
  const [removeOpen, setRemoveOpen] = useState(false)

  if (currentId !== null) {
    return (
      <RemoveWatchDialog
        name={name}
        watchId={currentId}
        open={removeOpen}
        onOpenChange={setRemoveOpen}
        onRemoved={() => setCurrentId(null)}
      >
        <StarTrigger name={name} watched />
      </RemoveWatchDialog>
    )
  }

  return (
    <Popover open={configOpen} onOpenChange={setConfigOpen}>
      <PopoverTrigger asChild>
        <StarTrigger name={name} watched={false} />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        collisionPadding={16}
        className="w-[min(22rem,calc(100vw-2rem))] p-4"
      >
        <div className="space-y-1 pb-3">
          <p className="font-heading text-lg font-semibold">Watch {name}</p>
          <p className="text-xs text-muted-foreground">
            We recheck these every few hours and email you when something
            changes.
          </p>
        </div>
        <WatchForm
          name={name}
          searchId={searchId}
          onDone={() => setConfigOpen(false)}
          onSaved={(id) => setCurrentId(id)}
        />
      </PopoverContent>
    </Popover>
  )
}

/**
 * Text-button variant used on watchlist cards to edit an existing
 * watch's tracked domains and handles.
 */
export function WatchConfigButton({
  name,
  searchId,
  watchId,
  initialTlds,
  initialPlatforms,
  onSaved,
  children,
}: {
  name: string
  searchId: number
  watchId: number
  initialTlds: string[]
  initialPlatforms: string[]
  onSaved?: () => void
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        collisionPadding={16}
        className="w-[min(22rem,calc(100vw-2rem))] p-4"
      >
        <div className="space-y-1 pb-3">
          <p className="font-heading text-lg font-semibold">Edit watch</p>
          <p className="text-xs text-muted-foreground">
            Choose which domains and handles we keep checking for {name}.
          </p>
        </div>
        <WatchForm
          name={name}
          searchId={searchId}
          watchId={watchId}
          initialTlds={initialTlds}
          initialPlatforms={initialPlatforms}
          onDone={() => setOpen(false)}
          onSaved={() => onSaved?.()}
        />
      </PopoverContent>
    </Popover>
  )
}

/**
 * Confirmation dialog wrapper for removing a watch from anywhere.
 */
export function WatchRemoveButton({
  name,
  watchId,
  onRemoved,
  children,
}: {
  name: string
  watchId: number
  onRemoved?: () => void
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <RemoveWatchDialog
      name={name}
      watchId={watchId}
      open={open}
      onOpenChange={setOpen}
      onRemoved={onRemoved}
    >
      {children}
    </RemoveWatchDialog>
  )
}

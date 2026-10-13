"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDateTime } from "@/lib/utils"
import {
  listCheckedNames,
  listWatchNames,
  type CheckedNameItem,
  type WatchNameItem,
} from "@/lib/api"
import { WatchForm } from "@/components/dashboard/watch-button"

const TIER_LABEL: Record<string, string> = {
  excellent: "Excellent",
  good: "Good",
  okay: "Okay",
  poor: "Poor",
}

function TierDot({ tier }: { tier: string | null }) {
  const tone =
    tier === "excellent"
      ? "bg-green-500"
      : tier === "good"
        ? "bg-primary"
        : tier === "okay"
          ? "bg-amber-500"
          : tier === "poor"
            ? "bg-red-500"
            : "bg-muted-foreground/40"
  return (
    <span
      aria-hidden="true"
      className={`size-2 shrink-0 rounded-full ${tone}`}
    />
  )
}

/**
 * The shared typeahead used by both watchlist tabs. The "unwatched" mode
 * searches checked names you have not starred yet and offers to watch a
 * pick; the "watched" mode searches the watchlist and jumps to a report.
 * Search is debounced against a paginated endpoint so it stays instant
 * regardless of how many names exist.
 */
export default function NameSearch({
  mode,
  onWatched,
}: {
  mode: "unwatched" | "watched"
  onWatched?: () => void
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [items, setItems] = useState<CheckedNameItem[] | WatchNameItem[]>([])
  const [loading, setLoading] = useState(false)
  const [confirming, setConfirming] = useState<CheckedNameItem | null>(null)
  const seq = useRef(0)

  const placeholder = useMemo(
    () =>
      mode === "unwatched"
        ? "Search your checked names to watch…"
        : "Search what you are watching…",
    [mode]
  )

  useEffect(() => {
    if (!open) return
    const current = ++seq.current
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        if (mode === "unwatched") {
          const res = await listCheckedNames({
            q: query || undefined,
            watched: "0",
            pageSize: 12,
          })
          if (seq.current === current) setItems(res.items)
        } else {
          const res = await listWatchNames({ q: query.trim() || undefined })
          if (seq.current === current) setItems(res.items)
        }
      } catch {
        if (seq.current === current) setItems([])
      } finally {
        if (seq.current === current) setLoading(false)
      }
    }, 180)
    return () => clearTimeout(timer)
  }, [open, query, mode])

  function pick(name: string) {
    if (mode === "watched") {
      const item = items.find((entry) => entry.name === name)
      if (!item || !("search_id" in item)) return
      setOpen(false)
      router.push(
        `/dashboard/history/${item.search_id}/results/${encodeURIComponent(name)}`
      )
      return
    }
    const item = items.find((entry) => entry.name === name)
    if (!item || !("score" in item)) return
    setConfirming(item)
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between gap-2 font-normal text-muted-foreground sm:w-80"
          >
            <span className="flex items-center gap-2 truncate">
              <HugeiconsIcon icon={Search01Icon} className="size-4 shrink-0" />
              <span className="truncate">{placeholder}</span>
            </span>
            <kbd className="pointer-events-none hidden shrink-0 border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground sm:inline-block">
              /
            </kbd>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={6}
          collisionPadding={16}
          className="w-[min(30rem,calc(100vw-2rem))] p-0"
        >
          <Command shouldFilter={false}>
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder={placeholder}
            />
            <CommandList>
              <CommandEmpty>
                {loading
                  ? "Searching…"
                  : mode === "unwatched"
                    ? "No matching names to watch."
                    : "Nothing matches."}
              </CommandEmpty>
              <CommandGroup heading={mode === "unwatched" ? "Pick a name" : "Watching"}>
                {items.map((item) =>
                  "score" in item ? (
                    <CommandItem
                      key={item.name_id}
                      value={item.name}
                      onSelect={() => pick(item.name)}
                    >
                      <span className="flex w-full items-center gap-3">
                        <TierDot tier={item.tier} />
                        <span className="flex-1 truncate font-medium">
                          {item.name}
                        </span>
                        <span className="shrink-0 font-mono text-sm tabular-nums">
                          {item.score ?? "—"}
                        </span>
                        <Badge
                          variant="secondary"
                          className="hidden shrink-0 text-[10px] sm:inline-flex"
                        >
                          {item.tier
                            ? TIER_LABEL[item.tier]
                            : "Unchecked"}
                        </Badge>
                        <span className="hidden shrink-0 text-xs text-muted-foreground md:inline">
                          {formatDateTime(item.search_date)}
                        </span>
                        <span className="hidden max-w-24 shrink-0 truncate text-xs text-muted-foreground lg:inline">
                          {item.query}
                        </span>
                      </span>
                    </CommandItem>
                  ) : (
                    <CommandItem
                      key={item.id}
                      value={item.name}
                      onSelect={() => pick(item.name)}
                    >
                      <span className="flex w-full items-center gap-3">
                        <span className="flex-1 truncate font-medium">
                          {item.name}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          View report
                        </span>
                      </span>
                    </CommandItem>
                  )
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {confirming ? (
        <ConfirmWatchDialog
          item={confirming}
          open={confirming !== null}
          onOpenChange={(next) => {
            if (!next) setConfirming(null)
          }}
          onWatched={() => {
            setConfirming(null)
            onWatched?.()
          }}
        />
      ) : null}
    </>
  )
}

function ConfirmWatchDialog({
  item,
  open,
  onOpenChange,
  onWatched,
}: {
  item: CheckedNameItem
  open: boolean
  onOpenChange: (next: boolean) => void
  onWatched: () => void
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Watch {item.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            Scored {item.score ?? "none"}. We will email you the moment any
            of its domains or handles get claimed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <WatchForm
          name={item.name}
          searchId={item.search_id}
          onDone={() => onOpenChange(false)}
          onSaved={() => onWatched()}
        />
      </AlertDialogContent>
    </AlertDialog>
  )
}

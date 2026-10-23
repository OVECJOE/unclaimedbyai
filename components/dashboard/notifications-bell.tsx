"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { BellIcon } from "@hugeicons/core-free-icons"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { getNotifications, type NotificationItem } from "@/lib/api"
import { playSound } from "@/lib/sound/engine"
import { cn } from "@/lib/utils"

const SEEN_KEY = "uba-notif-seen"
const POLL_MS = 60_000

function readSeen(): number {
  if (typeof window === "undefined") return 0
  const raw = Number.parseInt(window.localStorage.getItem(SEEN_KEY) ?? "", 10)
  return Number.isFinite(raw) ? raw : 0
}

function writeSeen(id: number): void {
  try {
    window.localStorage.setItem(SEEN_KEY, String(id))
  } catch {
    // Private mode: the badge relearns next visit.
  }
}

/** The same sentences the watchlist uses, so the bell and the page
 *  speak with one voice about the same event. */
function sentence(item: NotificationItem): string {
  switch (item.kind) {
    case "domain_taken":
      return `${item.label} was registered by someone else`
    case "domain_released":
      return `${item.label} is available again`
    case "handle_taken":
      return `The handle ${item.label} was claimed`
    case "handle_released":
      return `The handle ${item.label} opened back up`
    default:
      return item.label
  }
}

function when(value: string): string {
  const then = new Date(value).getTime()
  if (Number.isNaN(then)) return ""
  const minutes = Math.max(1, Math.round((Date.now() - then) / 60000))
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

/**
 * The inbox, built from what the sweeps already record. The cursor is
 * the largest event id shown, stored per browser: fetches ask only
 * for what is newer, the badge counts it, and opening the bell files
 * it away. Arrivals newer than anything fetched before get the reveal
 * chord while the tab is open — news, not judgment. The badge stays
 * gated behind `loaded` so server and client paint the same thing.
 */
export default function NotificationsBell({
  className,
}: {
  className?: string
}) {
  const [items, setItems] = useState<NotificationItem[]>([])
  const [seen, setSeen] = useState(0)
  const [open, setOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const seenRef = useRef(0)
  /** The largest id ever fetched: everything below it is news we have
   *  already played for, so the chord sounds once per arrival. */
  const floorRef = useRef<number | null>(null)

  const refresh = useCallback(async () => {
    try {
      const fresh = await getNotifications(seenRef.current)
      if (!fresh.length) return
      if (floorRef.current !== null && fresh[0].id > floorRef.current) {
        playSound("reveal", `notifications:${fresh[0].id}`)
      }
      floorRef.current = Math.max(floorRef.current ?? 0, fresh[0].id)
      setItems((current) => {
        const known = new Set(current.map((item) => item.id))
        const merged = [
          ...fresh.filter((item) => !known.has(item.id)),
          ...current,
        ]
        return merged.sort((a, b) => b.id - a.id).slice(0, 30)
      })
    } catch {
      // A quiet inbox beats a loud error; the next tick tries again.
    }
  }, [])

  useEffect(() => {
    seenRef.current = readSeen()
    setSeen(seenRef.current)
    setLoaded(true)
    void refresh()
    const timer = setInterval(() => void refresh(), POLL_MS)
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh()
    }
    document.addEventListener("visibilitychange", onVisible)
    return () => {
      clearInterval(timer)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [refresh])

  const unseen = loaded ? items.filter((item) => item.id > seen).length : 0

  function markSeen() {
    const largest = items.reduce((max, item) => Math.max(max, item.id), seen)
    if (largest > seenRef.current) {
      seenRef.current = largest
      setSeen(largest)
      writeSeen(largest)
    }
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) markSeen()
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={
            unseen > 0 ? `Watch activity — ${unseen} new` : "Watch activity"
          }
          className={cn(
            "relative inline-flex size-9 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-primary focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none",
            className
          )}
        >
          <HugeiconsIcon icon={BellIcon} className="size-4" />
          {unseen > 0 ? (
            <span className="absolute top-1 right-1.5">
              <span className="absolute block size-2 animate-ping rounded-full bg-primary/60 motion-reduce:hidden" />
              <span className="relative block size-2 rounded-full bg-primary" />
            </span>
          ) : null}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b px-4 py-3">
          <p className="text-[0.625rem] font-semibold tracking-widest text-primary uppercase">
            Watch activity
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Sweeps recheck your names every few hours. Alerts also go by
            email.
          </p>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {items.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">
              Nothing yet. Star a name in any report and its sweeps show up
              here — and in your inbox the moment something gets claimed.
            </p>
          ) : (
            <ul className="divide-y">
              {items.map((item) => (
                <li key={item.id} className="px-4 py-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-semibold">
                      {item.name}
                    </p>
                    <span className="shrink-0 font-mono text-[0.625rem] text-muted-foreground">
                      {when(item.created_at)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {sentence(item)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="border-t p-2">
          <Link
            href="/dashboard/playground/watchlist"
            className="block px-2 py-1.5 text-xs text-primary underline-offset-4 hover:underline"
          >
            Open the watchlist
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}

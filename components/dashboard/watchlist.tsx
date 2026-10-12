"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDateTime } from "@/lib/utils"
import {
  listWatches,
  removeWatch,
  sweepWatch,
  type WatchEventItem,
  type WatchItem,
  type WatchList,
} from "@/lib/api"
import { toastApiError } from "@/lib/api-errors"

function eventSentence(event: WatchEventItem): string {
  switch (event.kind) {
    case "domain_taken":
      return `${event.label} was registered by someone else`
    case "domain_released":
      return `${event.label} is available again`
    case "handle_taken":
      return `The handle ${event.label} was claimed`
    case "handle_released":
      return `The handle ${event.label} opened back up`
  }
}

export default function Watchlist({ initial }: { initial: WatchList }) {
  const [items, setItems] = useState(initial.items)
  const [sweeping, setSweeping] = useState<number[]>([])

  async function refresh() {
    const fresh = await listWatches().catch(() => null)
    if (fresh) setItems(fresh.items)
  }

  async function sweep(item: WatchItem) {
    setSweeping((current) => [...current, item.id])
    try {
      const result = await sweepWatch(item.id)
      if (result.events > 0) {
        toast.warning(
          `${item.name}: the latest sweep found ${
            result.events === 1 ? "one change" : `${result.events} changes`
          }.`
        )
      } else {
        toast.success(`${item.name} came back all clear.`)
      }
      await refresh()
    } catch (error) {
      toastApiError(error, `Could not sweep ${item.name} right now.`)
    } finally {
      setSweeping((current) => current.filter((id) => id !== item.id))
    }
  }

  async function unwatch(item: WatchItem) {
    const previous = items
    setItems((current) => current.filter((entry) => entry.id !== item.id))
    try {
      await removeWatch(item.id)
      toast.success(`No longer watching ${item.name}.`)
    } catch (error) {
      setItems(previous)
      toastApiError(error, "Could not update your watchlist.")
    }
  }

  if (items.length === 0) {
    return (
      <div className="space-y-3 border border-dashed p-10 text-center">
        <p className="font-heading text-2xl">Nothing on watch yet</p>
        <p className="mx-auto max-w-prose text-sm text-muted-foreground">
          Open any search and star a name to keep it here. We recheck its
          domains and handles every few hours and email you the moment
          something changes.
        </p>
        <Button asChild>
          <Link href="/dashboard/history">Browse your searches</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Watching {items.length} of {initial.slots.total}{" "}
        {initial.slots.total === 1 ? "name" : "names"}.
      </p>
      <ul className="space-y-4">
        {items.map((item) => {
          const threatened = item.status === "threatened"
          const active = sweeping.includes(item.id)
          return (
            <li key={item.id} className="relative overflow-hidden border">
              <div className="watch-aura" aria-hidden="true" />
              <div className="relative space-y-4 bg-background/60 p-5 backdrop-blur-md sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <span className="flex items-center gap-3">
                      <Link
                        href={`/dashboard/history/${item.search_id}/results/${encodeURIComponent(item.name)}`}
                        className="font-heading text-3xl font-semibold transition-colors hover:text-primary"
                      >
                        {item.name}
                      </Link>
                      <Badge
                        className={
                          threatened
                            ? "bg-destructive/10 text-destructive"
                            : "bg-green-600/10 text-green-700 dark:bg-green-400/10 dark:text-green-400"
                        }
                      >
                        {threatened ? "Claimed" : "Clean"}
                      </Badge>
                    </span>
                    <p className="max-w-prose text-sm text-muted-foreground">
                      Rechecking {item.tlds.map((tld) => `.${tld}`).join(", ")}{" "}
                      and {item.platforms.length} handle
                      {item.platforms.length === 1 ? "" : "s"} every few hours.
                      Last sweep{" "}
                      {item.last_swept_at
                        ? formatDateTime(item.last_swept_at)
                        : "has not run yet"}
                      .
                    </p>
                  </div>
                  <div className="text-right">
                    {threatened ? (
                      <>
                        <p className="font-heading text-2xl font-semibold text-destructive">
                          Part of it is gone
                        </p>
                        <p className="text-xs text-muted-foreground">
                          The streak restarts once it opens back up
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-heading text-4xl font-semibold leading-none tabular-nums">
                          {item.days_clean ?? 0}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(item.days_clean ?? 0) === 1 ? "day clear" : "days clear"}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {item.events.length > 0 ? (
                  <ul className="divide-y divide-border border-y text-sm">
                    {item.events.slice(0, 8).map((event) => (
                      <li
                        key={event.id}
                        className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2"
                      >
                        <span className={event.kind.endsWith("_taken") ? undefined : "text-muted-foreground"}>
                          {eventSentence(event)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(event.created_at)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nothing has changed since the first sweep, which is
                    exactly what you want to keep seeing here.
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    disabled={active}
                    onClick={() => void sweep(item)}
                  >
                    {active ? "Sweeping…" : "Sweep now"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground"
                    onClick={() => void unwatch(item)}
                  >
                    Stop watching
                  </Button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatDateTime } from "@/lib/utils"
import {
  WatchConfigButton,
  WatchRemoveButton,
} from "@/components/dashboard/watch-button"
import {
  listWatches,
  sweepWatch,
  type WatchEventItem,
  type WatchItem,
} from "@/lib/api"
import { toastApiError } from "@/lib/api-errors"

const PAGE_SIZE = 12

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

export default function Watchlist({ onChanged }: { onChanged?: () => void }) {
  const [items, setItems] = useState<WatchItem[]>([])
  const [total, setTotal] = useState(0)
  const [slots, setSlots] = useState<{ used: number; total: number }>({
    used: 0,
    total: 0,
  })
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [sweeping, setSweeping] = useState<number[]>([])
  const [input, setInput] = useState("")
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<"all" | "clean" | "threatened">("all")
  const [page, setPage] = useState(1)
  const seq = useRef(0)

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))

  useEffect(() => {
    const id = setTimeout(() => setQuery(input.trim()), 180)
    return () => clearTimeout(id)
  }, [input])

  useEffect(() => {
    const current = ++seq.current
    listWatches({
      q: query || undefined,
      status: status === "all" ? undefined : status,
      page,
      pageSize: PAGE_SIZE,
    })
      .then((data) => {
        if (seq.current !== current) return
        setErrored(false)
        setItems(data.items)
        setTotal(data.total)
        if (data.slots) setSlots(data.slots)
        setLoaded(true)
      })
      .catch(() => {
        if (seq.current === current) {
          setErrored(true)
          setLoaded(true)
        }
      })
  }, [query, status, page, attempt])

  async function refresh() {
    const fresh = await listWatches({
      q: query || undefined,
      status: status === "all" ? undefined : status,
      page,
      pageSize: PAGE_SIZE,
    }).catch(() => null)
    if (fresh) {
      setItems(fresh.items)
      setTotal(fresh.total)
      if (fresh.slots) setSlots(fresh.slots)
    }
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

  if (!loaded) {
    return (
      <div className="space-y-4" aria-busy="true">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="h-32 animate-pulse border bg-muted/40" />
        ))}
      </div>
    )
  }

  if (errored) {
    return (
      <div className="space-y-4">
        <Toolbar
          query={input}
          status={status}
          onQuery={setInput}
          onStatus={(value) => {
            setStatus(value)
            setPage(1)
          }}
        />
        <div className="border border-dashed p-10 text-center" role="alert">
          <p className="font-heading text-2xl">Your watchlist could not load</p>
          <p className="mx-auto mt-2 max-w-prose text-sm text-muted-foreground">
            That is on our end, not yours — nothing you are watching has
            changed. Try again in a moment.
          </p>
          <Button
            className="mt-4"
            onClick={() => {
              setLoaded(false)
              setAttempt((current) => current + 1)
            }}
          >
            Try again
          </Button>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    const filtering = query !== "" || status !== "all"
    return (
      <div className="space-y-4">
        <Toolbar
          query={input}
          status={status}
          onQuery={setInput}
          onStatus={(value) => {
            setStatus(value)
            setPage(1)
          }}
        />
        <div className="border border-dashed p-10 text-center">
          <p className="font-heading text-2xl">
            {filtering ? "Nothing matches" : "Nothing on watch yet"}
          </p>
          <p className="mx-auto mt-2 max-w-prose text-sm text-muted-foreground">
            {filtering
              ? "Try a different search or clear the filters to see everything you are watching."
              : "Head to the Pick a name tab and star anything you want guarded. We recheck its domains and handles every few hours and email you the moment something changes."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Toolbar
        query={input}
        status={status}
        onQuery={setInput}
        onStatus={(value) => {
          setStatus(value)
          setPage(1)
        }}
      />
      <p className="text-sm text-muted-foreground">
        Watching {slots.used} of {slots.total}{" "}
        {slots.total === 1 ? "name" : "names"}.
      </p>
      <ul className="space-y-4">
        {items.map((item) => {
          const threatened = item.status === "threatened"
          const active = sweeping.includes(item.id)
          return (
            <li key={item.id} className="relative overflow-hidden border">
              <div className="watch-aura" aria-hidden="true" />
              <div className="relative space-y-4 bg-background/60 p-5 backdrop-blur-md sm:p-6">
                <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
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
                      among others and {item.platforms.length} handle
                      {item.platforms.length === 1 ? "" : "s"} every few hours.
                      Last sweep{" "}
                      <strong>
                        {item.last_swept_at
                          ? formatDateTime(item.last_swept_at)
                          : "has not run yet"}
                      </strong>
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
                        <p className="text-start font-heading text-4xl leading-none font-bold text-primary tabular-nums md:text-end">
                          {item.days_clean ?? 0}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(item.days_clean ?? 0) === 1
                            ? "day clear"
                            : "days clear"}
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
                        <span
                          className={
                            event.kind.endsWith("_taken")
                              ? undefined
                              : "text-muted-foreground"
                          }
                        >
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
                    Nothing has changed since the first sweep, which is exactly
                    what you want to keep seeing here.
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
                  <WatchConfigButton
                    name={item.name}
                    searchId={item.search_id}
                    watchId={item.id}
                    initialTlds={item.tlds}
                    initialPlatforms={item.platforms}
                    onSaved={() => void refresh()}
                  >
                    <Button size="sm" variant="outline">
                      Edit watch
                    </Button>
                  </WatchConfigButton>
                  <WatchRemoveButton
                    name={item.name}
                    watchId={item.id}
                    onRemoved={() => {
                      const remaining = items.filter(
                        (entry) => entry.id !== item.id
                      )
                      setItems(remaining)
                      setTotal((current) => Math.max(0, current - 1))
                      setSlots((current) => ({
                        ...current,
                        used: Math.max(0, current.used - 1),
                      }))
                      if (remaining.length === 0 && page > 1) {
                        setPage(page - 1)
                      } else {
                        void refresh()
                      }
                      onChanged?.()
                    }}
                  >
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground"
                    >
                      Stop watching
                    </Button>
                  </WatchRemoveButton>
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      {pageCount > 1 ? (
        <nav
          aria-label="Pagination"
          className="flex items-center justify-between pt-2"
        >
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground tabular-nums">
            Page {page} of {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pageCount}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
        </nav>
      ) : null}
    </div>
  )
}

function Toolbar({
  query,
  status,
  onQuery,
  onStatus,
}: {
  query: string
  status: "all" | "clean" | "threatened"
  onQuery: (value: string) => void
  onStatus: (value: "all" | "clean" | "threatened") => void
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <HugeiconsIcon
          icon={Search01Icon}
          className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder="Search watched names…"
          aria-label="Search watched names"
          className="pr-3 pl-9"
        />
      </div>
      <div className="flex gap-1" role="group" aria-label="Filter by status">
        {(
          [
            ["all", "All"],
            ["clean", "Clean"],
            ["threatened", "Threatened"],
          ] as const
        ).map(([value, label]) => (
          <Button
            key={value}
            size="sm"
            variant={status === value ? "default" : "outline"}
            onClick={() => onStatus(value)}
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  )
}

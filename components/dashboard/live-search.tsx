"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { formatDateTime } from "@/lib/utils"
import { DotIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@/components/ui/button"
import GradingDistribution from "@/components/dashboard/grading-distribution"
import ScoreSummary from "@/components/dashboard/score-summary"
import ResultsTable from "@/components/dashboard/results-table"
import QueryUnfurl from "@/components/dashboard/query-unfurl"
import ShortageDialog from "@/components/dashboard/shortage-dialog"
import SearchResultsToolbar from "@/components/dashboard/search-results-toolbar"
import {
  ApiError,
  getSearchHeader,
  getSearchResults,
  getSearchSummary,
  listWatches,
  type PendingName,
  type SearchHeader,
  type SearchResultsPayload,
  type SearchSummaryPayload,
} from "@/lib/api"
import { toastApiError } from "@/lib/api-errors"
import { toNameResultFromPayload } from "@/lib/result-mappers"

// Stage labels track the progress values the generation job writes:
// 5 sharpening, 15-45 studios finishing one by one, 55 screening plus
// judge scoring, 70+ top-up rounds, 95 wrapping up.
const POLL_MS = 1500

const GENERATION_STAGES: { at: number; label: string }[] = [
  { at: 0, label: "Reading your brief" },
  { at: 5, label: "Sharpening your brief" },
  { at: 15, label: "Naming studios at work" },
  { at: 55, label: "Screening live .com and handle lookups" },
  { at: 70, label: "Filling the shortlist" },
  { at: 95, label: "Wrapping up" },
]

function generationStage(progress: number): string {
  let label = GENERATION_STAGES[0].label
  for (const stage of GENERATION_STAGES) {
    if (progress >= stage.at) label = stage.label
  }
  return label
}

type LiveSearchProps = {
  searchId: number
  sid?: string
  availableOnly: boolean
  sort: string
  q?: string
  homeHref: string
  homeLabel: string
  historyHref?: string
  detailBase?: string | null
  banner?: React.ReactNode
  initialWatched?: Record<string, number>
  initialHeader: SearchHeader
  initialSummary: SearchSummaryPayload
  initialItems: SearchResultsPayload["items"]
  initialPending: PendingName[]
}

export default function LiveSearch({
  searchId,
  sid,
  availableOnly,
  sort,
  q,
  homeHref,
  homeLabel,
  historyHref,
  detailBase,
  banner,
  initialWatched,
  initialHeader,
  initialSummary,
  initialItems,
  initialPending,
}: LiveSearchProps) {
  const [header, setHeader] = useState(initialHeader)
  const [summary, setSummary] = useState(initialSummary)
  const [items, setItems] = useState(initialItems)
  const [pending, setPending] = useState(initialPending)
  const [filters, setFilters] = useState({
    availableOnly,
    sort,
    q: q ?? "",
  })
  const [paused, setPaused] = useState(false)
  const [creditShortage, setCreditShortage] = useState(false)
  const [watched, setWatched] = useState<Record<string, number>>(
    initialWatched ?? {}
  )
  const failuresRef = useRef(0)
  const refreshSeqRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [expired, setExpired] = useState(false)

  // Stars should reflect the account's current watches even when the
  // results component remounts on a filter change. Anonymous visitors
  // have no session to read, so the call is skipped entirely.
  useEffect(() => {
    if (sid) return
    let cancelled = false
    listWatches()
      .then((data) => {
        if (cancelled) return
        const map: Record<string, number> = {}
        for (const item of data.items) map[item.name] = item.id
        setWatched(map)
      })
      .catch(() => {
        // The server-rendered seed stays in place.
      })
    return () => {
      cancelled = true
    }
  }, [sid])

  const generating = header.generation.status === "generating"
  const active = generating || pending.length > 0

  function syncUrl(next: { availableOnly: boolean; sort: string; q: string }) {
    const params = new URLSearchParams(window.location.search)
    if (next.availableOnly) params.set("available", "1")
    else params.delete("available")
    if (next.sort && next.sort !== "overall-score-high-to-low")
      params.set("sort", next.sort)
    else params.delete("sort")
    if (next.q) params.set("q", next.q)
    else params.delete("q")
    const query = params.toString()
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}`
    )
  }

  function applyFilters(patch: {
    availableOnly?: boolean
    sort?: string
    q?: string
  }) {
    const next = { ...filters, ...patch }
    setFilters(next)
    syncUrl(next)
    refreshWith(next).catch((error) => {
      toastApiError(error, "Couldn't refresh the results. Try again.")
    })
  }

  async function refreshWith(
    f: { availableOnly: boolean; sort: string; q: string },
    signal?: AbortSignal
  ): Promise<boolean> {
    const seq = ++refreshSeqRef.current
    const [nextHeader, nextSummary, nextResults] = await Promise.all([
      getSearchHeader(searchId, sid, signal),
      getSearchSummary(searchId, sid, signal),
      getSearchResults(searchId, {
        availableOnly: f.availableOnly,
        sort: f.sort,
        q: f.q || undefined,
        anonSessionId: sid,
        signal,
      }),
    ])
    if (signal?.aborted || refreshSeqRef.current !== seq) return false
    failuresRef.current = 0
    setHeader(nextHeader)
    setSummary(nextSummary)
    setItems(nextResults.items)
    setPending(nextResults.pending)
    return true
  }

  async function refresh(signal?: AbortSignal): Promise<boolean> {
    return refreshWith(filters, signal)
  }

  useEffect(() => {
    if (!active || paused) return
    const controller = new AbortController()
    timerRef.current = setInterval(() => {
      refresh(controller.signal).catch((error) => {
        if (error instanceof ApiError && error.status === 429) return
        if (error instanceof ApiError && error.status === 401) {
          if (timerRef.current) clearInterval(timerRef.current)
          setExpired(true)
          setPaused(true)
          return
        }
        failuresRef.current += 1
        if (failuresRef.current >= 3) {
          if (timerRef.current) clearInterval(timerRef.current)
          setPaused(true)
          toastApiError(error, "Live updates paused. Refresh the page.")
        }
      })
    }, POLL_MS)
    return () => {
      controller.abort()
      if (timerRef.current) clearInterval(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, paused, searchId, sid, filters])

  const results = items.map(toNameResultFromPayload)
  const noNamesYet = header.name_count === 0

  return (
    <div className="space-y-8">
      <Breadcrumb>
        <BreadcrumbList className="flex-nowrap">
          <BreadcrumbItem>
            <BreadcrumbLink href={homeHref} className="text-primary">
              {homeLabel}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {historyHref ? (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink href={historyHref} className="text-primary">
                  History
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          ) : null}
          <BreadcrumbItem className="min-w-0">
            <BreadcrumbPage className="truncate">{header.query}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="space-y-1">
        {header.name_count === 1 && !header.brief_summary ? (
          <h1 className="font-heading text-4xl font-semibold md:text-5xl">
            Report for{" "}
            <span className="text-primary">&ldquo;{header.query}&rdquo;</span>
          </h1>
        ) : (
          <QueryUnfurl query={header.query} />
        )}
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-xs text-muted-foreground">
            {header.name_count === 1 && !header.brief_summary
              ? "One name, checked live"
              : `${header.name_count} names generated`}
          </span>
          <HugeiconsIcon icon={DotIcon} />
          <span className="text-xs text-muted-foreground">
            {formatDateTime(header.created_at)}
          </span>
        </div>
        {header.brief_summary || header.brief_attributes ? (
          <div className="space-y-1.5">
            {header.brief_summary ? (
              <p className="max-w-prose text-sm text-muted-foreground italic">
                &ldquo;{header.brief_summary}&rdquo;
              </p>
            ) : null}
            {(["audience", "tone", "category"] as const).map((key) =>
              header.brief_attributes?.[key] ? (
                <span
                  key={key}
                  className="border px-1.5 py-0.5 text-xs text-muted-foreground not-last:mr-2"
                >
                  <strong className="text-primary">[{key}]</strong>{" "}
                  {header.brief_attributes[key]}
                </span>
              ) : null
            )}
          </div>
        ) : null}
        {generating ? (
          <p className="text-sm text-muted-foreground" role="status">
            {generationStage(header.generation.progress)}… results appear below
            as they arrive.
          </p>
        ) : null}
        {header.generation.status === "failed" ? (
          <p className="text-sm text-destructive" role="alert">
            {header.generation.error ??
              "Name generation failed. Try a new search from "}
            {header.generation.error ? null : (
              <Link href={homeHref} className="underline">
                {homeLabel}
              </Link>
            )}
          </p>
        ) : null}
      </div>
      {generating && noNamesYet ? (
        <div
          role="status"
          className="space-y-4 border border-dashed p-8 text-center"
        >
          <p className="font-heading text-2xl">
            Generating names for &apos;{header.query}&apos;
          </p>
          <p className="text-sm text-muted-foreground">
            {generationStage(header.generation.progress)}… names land in the
            results below the moment they clear live screening, so the shortlist
            builds while you watch.
          </p>
          <div
            className="mx-auto h-2 w-full max-w-md bg-muted"
            role="progressbar"
            aria-valuenow={header.generation.progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Generation progress"
          >
            <div
              className="h-full bg-primary transition-all duration-700"
              style={{ width: `${Math.max(5, header.generation.progress)}%` }}
            />
          </div>
        </div>
      ) : (
        <>
          <div className="flex w-full flex-col gap-6 md:flex-row">
            <div className="min-w-0 flex-1">
              <ScoreSummary summary={summary} />
            </div>
            <div className="min-w-0 flex-1">
              <GradingDistribution summary={summary} />
            </div>
          </div>
          <div className="space-y-5">
            {paused ? (
              <div
                role="alert"
                className="flex flex-wrap items-center justify-between gap-3 border border-destructive/40 bg-destructive/5 p-3 text-sm"
              >
                <span>
                  {expired
                    ? "Your session ended. Sign in again to keep this search live — nothing below has changed."
                    : "Live updates paused — we lost the connection. What you see is the last loaded snapshot."}
                </span>
                {expired ? (
                  <Button size="sm" asChild>
                    <Link href="/auth">Sign in</Link>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      failuresRef.current = 0
                      setPaused(false)
                    }}
                  >
                    Resume updates
                  </Button>
                )}
              </div>
            ) : null}
            <SearchResultsToolbar
              q={filters.q}
              availableOnly={filters.availableOnly}
              sort={filters.sort}
              onFilter={(next) => applyFilters({ q: next })}
              onChange={(patch) => applyFilters(patch)}
            />
            <ResultsTable
              results={results}
              searchId={String(searchId)}
              pending={pending}
              anonSessionId={sid}
              detailBase={detailBase}
              watched={watched}
              onShortage={sid ? undefined : () => setCreditShortage(true)}
              onMutation={() => {
                refresh().catch(() => {
                  // Poll loop picks it up on the next tick.
                })
              }}
            />
            {banner}
          </div>
        </>
      )}
      <ShortageDialog
        open={creditShortage}
        kind="credits"
        onOpenChange={(next) => {
          if (!next) setCreditShortage(false)
        }}
      />
    </div>
  )
}

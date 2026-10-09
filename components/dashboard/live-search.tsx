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
import GradingDistribution from "@/components/dashboard/grading-distribution"
import ScoreSummary from "@/components/dashboard/score-summary"
import ResultsTable from "@/components/dashboard/results-table"
import SearchResultsToolbar from "@/components/dashboard/search-results-toolbar"
import {
  ApiError,
  getSearchHeader,
  getSearchResults,
  getSearchSummary,
  type PendingName,
  type SearchHeader,
  type SearchResultsPayload,
  type SearchSummaryPayload,
} from "@/lib/api"
import { toastApiError } from "@/lib/api-errors"
import { toNameResultFromPayload } from "@/lib/result-mappers"

const POLL_MS = 2500

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
  const failuresRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

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
    refreshWith(next).catch(() => {
      // Poll loop picks it up on the next tick.
    })
  }

  async function refreshWith(
    f: { availableOnly: boolean; sort: string; q: string },
    signal?: AbortSignal
  ): Promise<boolean> {
    const [nextHeader, nextSummary, nextResults] = await Promise.all([
      getSearchHeader(searchId, sid),
      getSearchSummary(searchId, sid),
      getSearchResults(searchId, {
        availableOnly: f.availableOnly,
        sort: f.sort,
        q: f.q || undefined,
        anonSessionId: sid,
      }),
    ])
    if (signal?.aborted) return false
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
    if (!active) return
    const controller = new AbortController()
    timerRef.current = setInterval(() => {
      refresh(controller.signal).catch((error) => {
        if (error instanceof ApiError && error.status === 429) return
        failuresRef.current += 1
        if (failuresRef.current >= 3) {
          if (timerRef.current) clearInterval(timerRef.current)
          toastApiError(error, "Live updates paused. Refresh the page.")
        }
      })
    }, POLL_MS)
    return () => {
      controller.abort()
      if (timerRef.current) clearInterval(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, searchId, sid, filters])

  const results = items.map(toNameResultFromPayload)

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
        <h1 className="font-heading text-4xl font-semibold md:text-5xl">
          Results for &apos;
          <span className="text-primary">{header.query}</span>&apos;
        </h1>
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-xs text-muted-foreground">
            {header.name_count} names generated
          </span>
          <HugeiconsIcon icon={DotIcon} />
          <span className="text-xs text-muted-foreground">
            {formatDateTime(header.created_at)}
          </span>
        </div>
        {generating ? (
          <p className="text-sm text-muted-foreground" role="status">
            Finding names… {header.generation.progress}%. New results appear
            below as they arrive.
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
      <div className="flex w-full flex-col gap-6 md:flex-row">
        <div className="min-w-0 flex-1">
          <ScoreSummary summary={summary} />
        </div>
        <div className="min-w-0 flex-1">
          <GradingDistribution summary={summary} />
        </div>
      </div>
      <div className="space-y-5">
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
          onMutation={() => {
            refresh().catch(() => {
              // Poll loop picks it up on the next tick.
            })
          }}
        />
        {banner}
      </div>
    </div>
  )
}

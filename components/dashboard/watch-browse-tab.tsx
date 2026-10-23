"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Toggle } from "@/components/ui/toggle"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDateTime } from "@/lib/utils"
import {
  addWatch,
  listCheckedNames,
  type CheckedNameItem,
  type CheckedList,
} from "@/lib/api"
import { toastApiError } from "@/lib/api-errors"
import NameSearch from "@/components/dashboard/name-search"
import { TierBadge } from "@/components/tier-badge"

const SORT_LABELS: Record<string, string> = {
  recent: "Recently checked",
  score: "Highest score",
  name: "Name, A-Z",
}

const PAGE_SIZE = 12

export default function BrowseTab({
  initial,
  onWatched,
}: {
  initial: CheckedList
  onWatched?: () => void
}) {
  const [query, setQuery] = useState("")
  const [tierOnly, setTierOnly] = useState(false)
  const [sort, setSort] = useState("recent")
  const [page, setPage] = useState(1)
  const [data, setData] = useState<CheckedList>(initial)
  const [loading, setLoading] = useState(false)
  const [pendingId, setPendingId] = useState<number | null>(null)
  const [refreshToken, setRefreshToken] = useState(0)
  const seq = useRef(0)

  useEffect(() => {
    const current = ++seq.current
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await listCheckedNames({
          q: query.trim() || undefined,
          watched: "0",
          tier: tierOnly ? "excellent" : undefined,
          sort: sort as "recent" | "score" | "name",
          page,
          pageSize: PAGE_SIZE,
        })
        if (seq.current === current) setData(res)
      } catch {
        if (seq.current === current) {
          toast.error("Could not load your names right now.")
        }
      } finally {
        if (seq.current === current) setLoading(false)
      }
    }, 180)
    return () => clearTimeout(timer)
  }, [query, tierOnly, sort, page, refreshToken])

  function refresh() {
    setRefreshToken((current) => current + 1)
  }

  async function watch(item: CheckedNameItem) {
    setPendingId(item.name_id)
    try {
      await addWatch({ search_id: item.search_id, name: item.name })
      toast.success(
        `Now watching ${item.name}. We will email you if any of its domains or handles get claimed.`
      )
      onWatched?.()
      refresh()
    } catch (error) {
      toastApiError(error, "Could not add that name to your watchlist.")
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <NameSearch
          mode="unwatched"
          onWatched={() => {
            onWatched?.()
            refresh()
          }}
        />
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Toggle
            variant="outline"
            size="sm"
            pressed={tierOnly}
            onPressedChange={(pressed) => {
              setTierOnly(pressed)
              setPage(1)
            }}
          >
            Excellent only
          </Toggle>
          <Select
            value={sort}
            onValueChange={(value) => {
              setSort(value)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-44 text-sm">
              <span>{SORT_LABELS[sort] ?? sort}</span>
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectGroup>
                {Object.entries(SORT_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <form
        onSubmit={(event) => event.preventDefault()}
        className="flex items-center gap-2"
      >
        <HugeiconsIcon icon={Search01Icon} className="shrink-0 text-primary" />
        <Input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setPage(1)
          }}
          placeholder="Filter by name…"
          aria-label="Filter your checked names"
          className="max-w-sm [&::-webkit-search-cancel-button]:appearance-none"
        />
      </form>

      {data.items.length === 0 && !loading ? (
        <div className="border border-dashed p-10 text-center">
          <p className="font-heading text-2xl">
            {query || tierOnly ? "Nothing matches" : "No checked names yet"}
          </p>
          <p className="mx-auto mt-2 max-w-prose text-sm text-muted-foreground">
            {query || tierOnly
              ? "Try a different filter, or clear the search to see everything."
              : "Run a check on a name and it shows up here, ready to watch."}
          </p>
        </div>
      ) : null}

      <div
        className={
          loading ? "opacity-60 transition-opacity" : "transition-opacity"
        }
      >
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Score</TableHead>
              <TableHead className="hidden sm:table-cell">Tier</TableHead>
              <TableHead className="hidden md:table-cell">From brief</TableHead>
              <TableHead className="hidden lg:table-cell">Checked</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((item) => (
              <TableRow key={item.name_id}>
                <TableCell>
                  <Link
                    href={`/dashboard/history/${item.search_id}/results/${encodeURIComponent(item.name)}`}
                    className="font-medium transition-colors hover:text-primary"
                  >
                    {item.name}
                  </Link>
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {item.score ?? "—"}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {item.tier ? (
                    <TierBadge tier={item.tier} />
                  ) : (
                    <span className="text-muted-foreground">None</span>
                  )}
                </TableCell>
                <TableCell className="hidden max-w-40 truncate text-muted-foreground md:table-cell">
                  {item.query}
                </TableCell>
                <TableCell className="hidden text-muted-foreground lg:table-cell">
                  {formatDateTime(item.checked_at ?? item.search_date)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pendingId === item.name_id}
                    onClick={() => void watch(item)}
                  >
                    {pendingId === item.name_id ? "Watching…" : "Watch"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {data.total > PAGE_SIZE ? (
        <nav
          aria-label="Pagination"
          className="mt-2 flex items-center justify-between"
        >
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || loading}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground tabular-nums">
            Page {data.page} of {Math.max(1, Math.ceil(data.total / PAGE_SIZE))}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= Math.ceil(data.total / PAGE_SIZE) || loading}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
        </nav>
      ) : null}
    </div>
  )
}

"use client"

import { useRouter, useSearchParams } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

type SearchHistoryFiltersProps = {
  show?: "mobile" | "desktop" | "both"
}

const SORT_UI_TO_API: Record<string, string> = {
  "most-recent": "newest",
  "oldest-first": "oldest",
  "most-names-generated": "most_names",
  "best-name-found": "best_score",
}

const SORT_API_TO_UI: Record<string, string> = Object.fromEntries(
  Object.entries(SORT_UI_TO_API).map(([ui, api]) => [api, ui])
)

const SORT_LABELS: Record<string, string> = {
  "most-recent": "Most recent",
  "oldest-first": "Oldest first",
  "most-names-generated": "Most names generated",
  "best-name-found": "Best name found",
}

const RANGE_LABELS: Record<string, string> = {
  "all-time": "All time",
  today: "Today",
  "last-7-days": "Last 7 days",
  "last-30-days": "Last 30 days",
  "last-3-months": "Last 3 months",
}

const QUALITY_LABELS: Record<string, string> = {
  "any-quality": "Any quality",
  "has-an-excellent-name": "Has an excellent name",
  "good-or-better": "Good or better",
  "needs-attention": "Needs attention",
}

function rangeToDates(value: string): { from?: string; to?: string } {
  if (value === "all-time") return {}
  const to = new Date()
  const from = new Date(to)
  if (value === "today") {
    const day = to.toISOString().slice(0, 10)
    return { from: day, to: day }
  }
  const days = value === "last-7-days" ? 6 : value === "last-30-days" ? 29 : 89
  from.setDate(to.getDate() - days)
  return { from: from.toISOString().slice(0, 10) }
}

function datesToRange(from: string | null): string {
  if (!from) return "all-time"
  const today = new Date().toISOString().slice(0, 10)
  if (from === today) return "today"
  const days = Math.round(
    (new Date(today).getTime() - new Date(from).getTime()) / 86400000
  )
  if (days <= 6) return "last-7-days"
  if (days <= 29) return "last-30-days"
  return "last-3-months"
}

export default function SearchHistoryFilters({
  show = "mobile",
}: SearchHistoryFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function setParams(patch: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(patch)) {
      if (value === undefined || value === "") params.delete(key)
      else params.set(key, value)
    }
    params.delete("page")
    const query = params.toString()
    router.push(query ? `/dashboard/history?${query}` : "/dashboard/history")
  }

  const sort = SORT_API_TO_UI[searchParams.get("sort") ?? ""] ?? "most-recent"
  const range = datesToRange(searchParams.get("from"))
  const quality = searchParams.get("quality") ?? "any-quality"

  return (
    <div
      className={cn("mt-2 items-center gap-5", {
        "flex md:hidden": show === "mobile",
        "hidden md:flex": show === "desktop",
        flex: show === "both",
      })}
    >
      <Select
        value={sort}
        onValueChange={(value) =>
          setParams({
            sort:
              SORT_UI_TO_API[value] === "newest"
                ? undefined
                : SORT_UI_TO_API[value],
          })
        }
      >
        <SelectTrigger className="text-base md:text-lg">
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

      <Select
        value={range}
        onValueChange={(value) => setParams(rangeToDates(value))}
      >
        <SelectTrigger className="text-base md:text-lg">
          <span>{RANGE_LABELS[range] ?? range}</span>
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectGroup>
            {Object.entries(RANGE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select
        value={quality}
        onValueChange={(value) =>
          setParams({ quality: value === "any-quality" ? undefined : value })
        }
      >
        <SelectTrigger className="text-base md:text-lg">
          <span>{QUALITY_LABELS[quality] ?? quality}</span>
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectGroup>
            {Object.entries(QUALITY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}

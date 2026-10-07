"use client"

import { useState } from "react"
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

const SORT_LABELS = {
  "most-recent": "Most recent",
  "oldest-first": "Oldest first",
  "most-names-generated": "Most names generated",
  "best-name-found": "Best name found",
} as const

const RANGE_LABELS = {
  "all-time": "All time",
  today: "Today",
  "last-7-days": "Last 7 days",
  "last-30-days": "Last 30 days",
  "last-3-months": "Last 3 months",
} as const

const QUALITY_LABELS = {
  "any-quality": "Any quality",
  "has-an-excellent-name": "Has an excellent name",
  "good-or-better": "Good or better",
  "needs-attention": "Needs attention",
} as const

export default function SearchHistoryFilters({
  show = "mobile",
}: SearchHistoryFiltersProps) {
  const [sort, setSort] = useState<keyof typeof SORT_LABELS>("most-recent")
  const [range, setRange] = useState<keyof typeof RANGE_LABELS>("all-time")
  const [quality, setQuality] =
    useState<keyof typeof QUALITY_LABELS>("any-quality")

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
        onValueChange={(value) => setSort(value as keyof typeof SORT_LABELS)}
      >
        <SelectTrigger className="text-base md:text-lg">
          <span>{SORT_LABELS[sort]}</span>
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
        onValueChange={(value) => setRange(value as keyof typeof RANGE_LABELS)}
      >
        <SelectTrigger className="text-base md:text-lg">
          <span>{RANGE_LABELS[range]}</span>
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
          setQuality(value as keyof typeof QUALITY_LABELS)
        }
      >
        <SelectTrigger className="text-base md:text-lg">
          <span>{QUALITY_LABELS[quality]}</span>
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

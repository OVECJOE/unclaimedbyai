"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Toggle } from "@/components/ui/toggle"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"

type SearchResultsFiltersProps = {
  show?: "mobile" | "desktop" | "both"
}

const SORT_LABELS = {
  "overall-score-high-to-low": "Overall score, high to low",
  "overall-score-low-to-high": "Overall score, low to high",
  "most-domains-available": "Most domains available",
  "lowest-ai-association": "Lowest AI association",
  "name-a-z": "Name, A-Z",
} as const

export default function SearchResultsFilters({
  show = "mobile",
}: SearchResultsFiltersProps) {
  const [sort, setSort] = useState<keyof typeof SORT_LABELS>(
    "overall-score-high-to-low"
  )

  return (
    <div
      className={cn("mt-2 items-center gap-5", {
        "flex md:hidden": show === "mobile",
        "hidden md:flex": show === "desktop",
        flex: show === "both",
      })}
    >
      <Toggle variant="outline" size="sm">
        Available only
      </Toggle>

      <Select
        value={sort}
        onValueChange={(value) => setSort(value as keyof typeof SORT_LABELS)}
      >
        <SelectTrigger className="text-sm md:text-base">
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
    </div>
  )
}

"use client"

import { cn } from "@/lib/utils"
import { Toggle } from "@/components/ui/toggle"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"

export type ResultsFilterPatch = {
  availableOnly?: boolean
  sort?: string
}

type SearchResultsFiltersProps = {
  show?: "mobile" | "desktop" | "both"
  availableOnly: boolean
  sort: string
  onChange: (patch: ResultsFilterPatch) => void
}

const SORT_LABELS: Record<string, string> = {
  "overall-score-high-to-low": "Overall score, high to low",
  "overall-score-low-to-high": "Overall score, low to high",
  "most-domains-available": "Most domains available",
  "lowest-ai-association": "Lowest AI association",
  "name-a-z": "Name, A-Z",
}

export default function SearchResultsFilters({
  show = "mobile",
  availableOnly,
  sort,
  onChange,
}: SearchResultsFiltersProps) {
  return (
    <div
      className={cn("mt-2 flex-wrap items-center gap-x-5 gap-y-2", {
        "flex md:hidden": show === "mobile",
        "hidden md:flex": show === "desktop",
        flex: show === "both",
      })}
    >
      <Toggle
        variant="outline"
        size="sm"
        pressed={availableOnly}
        onPressedChange={(pressed) => onChange({ availableOnly: pressed })}
      >
        Available only
      </Toggle>

      <Select value={sort} onValueChange={(value) => onChange({ sort: value })}>
        <SelectTrigger className="text-sm md:text-base">
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
  )
}

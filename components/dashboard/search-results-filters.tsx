"use client"

import { useRouter, useSearchParams } from "next/navigation"
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

const SORT_LABELS: Record<string, string> = {
  "overall-score-high-to-low": "Overall score, high to low",
  "overall-score-low-to-high": "Overall score, low to high",
  "most-domains-available": "Most domains available",
  "lowest-ai-association": "Lowest AI association",
  "name-a-z": "Name, A-Z",
}

export default function SearchResultsFilters({
  show = "mobile",
}: SearchResultsFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function setParams(patch: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(patch)) {
      if (value === undefined || value === "") params.delete(key)
      else params.set(key, value)
    }
    const query = params.toString()
    router.push(`${window.location.pathname}${query ? `?${query}` : ""}`, {
      scroll: false,
    })
  }

  const sort = searchParams.get("sort") ?? "overall-score-high-to-low"
  const availableOnly = searchParams.get("available") === "1"

  return (
    <div
      className={cn("mt-2 items-center gap-5", {
        "flex md:hidden": show === "mobile",
        "hidden md:flex": show === "desktop",
        flex: show === "both",
      })}
    >
      <Toggle
        variant="outline"
        size="sm"
        pressed={availableOnly}
        onPressedChange={(pressed) =>
          setParams({ available: pressed ? "1" : undefined })
        }
      >
        Available only
      </Toggle>

      <Select
        value={sort}
        onValueChange={(value) =>
          setParams({
            sort: value === "overall-score-high-to-low" ? undefined : value,
          })
        }
      >
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

"use client"

import { cn } from "@/lib/utils"
import { Toggle } from "@/components/ui/toggle"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type SearchResultsFiltersProps = {
  show?: "mobile" | "desktop" | "both"
}

export default function SearchResultsFilters({
  show = "mobile",
}: SearchResultsFiltersProps) {
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

      <Select defaultValue="overall-score-high-to-low">
        <SelectTrigger className="text-sm md:text-base">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectGroup>
            <SelectItem value="overall-score-high-to-low">
              Overall score, high to low
            </SelectItem>
            <SelectItem value="overall-score-low-to-high">
              Overall score, low to high
            </SelectItem>
            <SelectItem value="most-domains-available">
              Most domains available
            </SelectItem>
            <SelectItem value="lowest-ai-association">
              Lowest AI association
            </SelectItem>
            <SelectItem value="name-a-z">Name, A-Z</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
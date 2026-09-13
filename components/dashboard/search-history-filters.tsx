"use client"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {cn} from "@/lib/utils"

type SearchHistoryFiltersProps = {
  show?: "mobile" | "desktop" | "both"
}

export default function SearchHistoryFilters({ show = "mobile" }: SearchHistoryFiltersProps) {
  return (
    <div className={cn(
      "mt-2 items-center gap-5",
      {
        "flex md:hidden": show === "mobile",
        "hidden md:flex": show === "desktop",
        "flex": show === "both"
      }
    )} >
      {/* Sort filter */}
      <Select defaultValue="most-recent">
        <SelectTrigger className="text-base md:text-lg">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectGroup>
            <SelectItem value="most-recent">Most recent</SelectItem>
            <SelectItem value="oldest-first">Oldest first</SelectItem>
            <SelectItem value="most-names-generated">
              Most names generated
            </SelectItem>
            <SelectItem value="best-name-found">Best name found</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* Date range filter */}
      <Select defaultValue="all-time">
        <SelectTrigger className="text-base md:text-lg">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectGroup>
            <SelectItem value="all-time">All time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="last-7-days">Last 7 days</SelectItem>
            <SelectItem value="last-30-days">Last 30 days</SelectItem>
            <SelectItem value="last-3-months">Last 3 months</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* Batch quality filter */}
      <Select defaultValue="any-quality">
        <SelectTrigger className="text-base md:text-lg">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectGroup>
            <SelectItem value="any-quality">Any quality</SelectItem>
            <SelectItem value="has-an-excellent-name">
              Has an excellent name
            </SelectItem>
            <SelectItem value="good-or-better">Good or better</SelectItem>
            <SelectItem value="needs-attention">Needs attention</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}

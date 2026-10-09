"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"
import { Input } from "@/components/ui/input"
import SearchResultsFilters, {
  type ResultsFilterPatch,
} from "@/components/dashboard/search-results-filters"

type SearchResultsToolbarProps = {
  q: string
  availableOnly: boolean
  sort: string
  onFilter: (q: string) => void
  onChange: (patch: ResultsFilterPatch) => void
}

export default function SearchResultsToolbar({
  q,
  availableOnly,
  sort,
  onFilter,
  onChange,
}: SearchResultsToolbarProps) {
  const [value, setValue] = useState(q)

  function submit(event: React.FormEvent) {
    event.preventDefault()
    onFilter(value.trim())
  }

  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="flex items-end gap-3 md:gap-10">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <HugeiconsIcon
            icon={Search01Icon}
            className="shrink-0 text-primary"
          />
          <Input
            type="search"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Filter names"
            aria-label="Filter names in these results"
            className="text-lg placeholder:text-lg md:text-xl md:placeholder:text-xl [&::-webkit-search-cancel-button]:appearance-none"
          />
        </div>
        <SearchResultsFilters
          show="desktop"
          availableOnly={availableOnly}
          sort={sort}
          onChange={onChange}
        />
      </form>
      <SearchResultsFilters
        show="mobile"
        availableOnly={availableOnly}
        sort={sort}
        onChange={onChange}
      />
    </div>
  )
}

import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"
import { Input } from "@/components/ui/input"
import SearchResultsFilters from "@/components/dashboard/search-results-filters"

export default function SearchResultsToolbar() {
  return (
    <div className="space-y-4">
      <div className="flex items-end gap-10">
        <div className="flex items-center gap-2 flex-1">
          <HugeiconsIcon icon={Search01Icon} className="text-primary" />
          <Input
            type="search"
            placeholder="Filter names"
            className="text-lg md:text-xl placeholder:text-lg md:placeholder:text-xl [&::-webkit-search-cancel-button]:appearance-none"
          />
        </div>
        <SearchResultsFilters show="desktop" />
      </div>
      <SearchResultsFilters show="mobile" />
    </div>
  )
}
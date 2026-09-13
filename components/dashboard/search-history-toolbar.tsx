import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"
import { Input } from "@/components/ui/input"
import SearchHistoryFilters from "@/components/dashboard/search-history-filters"

export default function SearchHistoryToolbar() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-end gap-10">
          <div className="flex items-center gap-2 flex-1">
            <HugeiconsIcon icon={Search01Icon} className="text-primary" />
            <Input
              type="search"
              placeholder="Search by what you were building"
              className="text-lg md:text-xl placeholder:text-lg md:placeholder:text-xl [&::-webkit-search-cancel-button]:appearance-none"
            />
          </div>
          <SearchHistoryFilters show="desktop" />
        </div>
        <p className="text-xs text-muted-foreground">
          Matches by meaning, not just exact words &mdash; &apos;task app&apos; will find &apos;AI note-taking tool for teams.&apos;
        </p>
      </div>
      <SearchHistoryFilters show="mobile" />
    </div>
  )
}

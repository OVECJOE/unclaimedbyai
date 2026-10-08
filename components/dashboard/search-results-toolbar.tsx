"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"
import { Input } from "@/components/ui/input"
import SearchResultsFilters from "@/components/dashboard/search-results-filters"

export default function SearchResultsToolbar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get("q") ?? "")

  function submit(event: React.FormEvent) {
    event.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (value.trim()) params.set("q", value.trim())
    else params.delete("q")
    const query = params.toString()
    router.push(`${window.location.pathname}${query ? `?${query}` : ""}`, {
      scroll: false,
    })
  }

  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="flex items-end gap-10">
        <div className="flex flex-1 items-center gap-2">
          <HugeiconsIcon icon={Search01Icon} className="text-primary" />
          <Input
            type="search"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Filter names"
            aria-label="Filter names in these results"
            className="text-lg placeholder:text-lg md:text-xl md:placeholder:text-xl [&::-webkit-search-cancel-button]:appearance-none"
          />
        </div>
        <SearchResultsFilters show="desktop" />
      </form>
      <SearchResultsFilters show="mobile" />
    </div>
  )
}

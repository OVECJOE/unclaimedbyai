"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"
import { Input } from "@/components/ui/input"
import SearchHistoryFilters from "@/components/dashboard/search-history-filters"

export default function SearchHistoryToolbar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get("q") ?? "")

  function submit(event: React.FormEvent) {
    event.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (value.trim()) params.set("q", value.trim())
    else params.delete("q")
    params.delete("page")
    const query = params.toString()
    router.push(query ? `/dashboard/history?${query}` : "/dashboard/history")
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <form onSubmit={submit} className="flex items-end gap-10">
          <div className="flex flex-1 items-center gap-2">
            <HugeiconsIcon icon={Search01Icon} className="text-primary" />
            <Input
              type="search"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="Search by what you were building"
              aria-label="Search history"
              className="text-lg placeholder:text-lg md:text-xl md:placeholder:text-xl [&::-webkit-search-cancel-button]:appearance-none"
            />
          </div>
          <SearchHistoryFilters show="desktop" />
        </form>
        <p className="text-xs text-muted-foreground">
          Filters the briefs you have already run on this account.
        </p>
      </div>
      <SearchHistoryFilters show="mobile" />
    </div>
  )
}

"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const FILTERS = [
  { value: "all", label: "Every sandbox" },
  { value: "ideas", label: "Has ideas" },
  { value: "searches", label: "Has searches" },
  { value: "empty", label: "Empty" },
] as const

const SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name", label: "By name" },
] as const

/**
 * The list's controls, all URL-driven so every view is a link: the
 * server owns the query, this bar only writes the address bar.
 */
export default function SandboxListToolbar({ total }: { total: number }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get("q") ?? "")

  function write(next: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, entry] of Object.entries(next)) {
      if (entry === null || entry === "all") params.delete(key)
      else params.set(key, entry)
    }
    params.delete("page")
    const query = params.toString()
    router.push(
      query
        ? `/dashboard/playground/sandboxes?${query}`
        : "/dashboard/playground/sandboxes"
    )
  }

  function submit(event: React.FormEvent) {
    event.preventDefault()
    write({ q: value.trim() || null })
  }

  return (
    <div className="space-y-3">
      <form onSubmit={submit} className="flex flex-col gap-3 md:flex-row">
        <div className="flex flex-1 items-center gap-2">
          <HugeiconsIcon icon={Search01Icon} className="text-primary" />
          <Input
            type="search"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Search by sandbox name"
            aria-label="Search sandboxes"
            className="placeholder:text-base [&::-webkit-search-cancel-button]:appearance-none"
          />
        </div>
        <div className="flex gap-3">
          <Select
            value={searchParams.get("filter") ?? "all"}
            onValueChange={(next) => write({ filter: next })}
          >
            <SelectTrigger
              className="w-full md:w-44"
              aria-label="Filter sandboxes"
            >
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent position="popper">
              {FILTERS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={searchParams.get("sort") ?? "newest"}
            onValueChange={(next) => write({ sort: next })}
          >
            <SelectTrigger
              className="w-full md:w-44"
              aria-label="Sort sandboxes"
            >
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent position="popper">
              {SORTS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </form>
      <p className="text-xs text-muted-foreground">
        {total} sandbox{total === 1 ? "" : "es"} hold every idea you have
        generated or written. Open one to keep working.
      </p>
    </div>
  )
}

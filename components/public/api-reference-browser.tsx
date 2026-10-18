"use client"

import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import EndpointReference from "@/components/public/endpoint-reference"
import { cn } from "@/lib/utils"
import type { SpecEndpoint } from "@/lib/openapi"

export type ReferenceGroup = {
  tag: string
  label: string
  endpoints: SpecEndpoint[]
}

/**
 * The reference section, searchable and filterable.
 *
 * Forty-nine endpoints is too many to scroll when you already know what
 * you want, so this narrows by text and by group without a round trip.
 * The full list still server-renders underneath: this only hides rows
 * that do not match, so the page stays complete for search engines and
 * agents even before hydration.
 */
export default function ApiReferenceBrowser({
  groups,
}: {
  groups: ReferenceGroup[]
}) {
  const [query, setQuery] = useState("")
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const total = useMemo(
    () => groups.reduce((sum, group) => sum + group.endpoints.length, 0),
    [groups]
  )

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return groups
      .filter((group) => !activeTag || group.tag === activeTag)
      .map((group) => ({
        ...group,
        endpoints: group.endpoints.filter((endpoint) => {
          if (!needle) return true
          return (
            endpoint.method.includes(needle) ||
            endpoint.path.toLowerCase().includes(needle) ||
            endpoint.summary.toLowerCase().includes(needle)
          )
        }),
      }))
      .filter((group) => group.endpoints.length > 0)
  }, [groups, query, activeTag])

  const shown = visible.reduce((sum, group) => sum + group.endpoints.length, 0)

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="relative">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter by path, method, or what it does"
            aria-label="Filter endpoints"
            className="pr-16"
          />
          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 font-mono text-xs text-muted-foreground">
            {shown === total ? total : `${shown} / ${total}`}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <GroupChip
            label="All"
            count={total}
            active={activeTag === null}
            onClick={() => setActiveTag(null)}
          />
          {groups.map((group) => (
            <GroupChip
              key={group.tag}
              label={group.label}
              count={group.endpoints.length}
              active={activeTag === group.tag}
              onClick={() =>
                setActiveTag(activeTag === group.tag ? null : group.tag)
              }
            />
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="border py-8 text-center text-sm text-muted-foreground">
          No endpoint matches &quot;{query}&quot;. Try a path like{" "}
          <code className="font-mono text-xs">/watches</code>, a method like{" "}
          <code className="font-mono text-xs">POST</code>, or clear the filter.
        </p>
      ) : (
        visible.map((group) => (
          <div
            key={group.tag}
            id={`tag-${group.tag}`}
            className="scroll-mt-24 space-y-2"
          >
            <h3 className="font-heading text-xl font-semibold md:text-2xl">
              {group.label}
            </h3>
            <p className="font-mono text-xs text-muted-foreground">
              {group.endpoints.length}{" "}
              {group.endpoints.length === 1 ? "endpoint" : "endpoints"}
            </p>
            {group.endpoints.map((endpoint) => (
              <EndpointReference
                key={`${endpoint.method}-${endpoint.path}`}
                endpoint={endpoint}
              />
            ))}
          </div>
        ))
      )}
    </div>
  )
}

function GroupChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "min-h-9 border px-2.5 py-1 text-xs transition-colors",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "text-muted-foreground hover:border-primary/40 hover:text-foreground"
      )}
    >
      {label}
      <span className="ml-1.5 font-mono text-[11px] opacity-70">{count}</span>
    </button>
  )
}

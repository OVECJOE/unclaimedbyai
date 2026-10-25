import DomainChip from "@/components/domain-chip"
import type { AffiliatePlacement } from "@/lib/affiliate"

/**
 * A name's domains as compact chips — the results-table cell, the
 * extension panel, anywhere the list needs to stay inline.
 *
 * Split out of results-table.tsx so non-Next surfaces (the browser
 * extension) get the identical chips, including the affiliate
 * registrar links, instead of a lookalike.
 */
export function AvailabilityList({
  name,
  items,
  max = 3,
  placement = "results-table",
}: {
  name: string
  items: { tld: string; available: boolean | null }[]
  max?: number
  /** Affiliate placement tag this list's clicks are earning under. */
  placement?: AffiliatePlacement
}) {
  const shown = items.slice(0, max)
  const remaining = items.length - shown.length
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {shown.map((item) => (
        <DomainChip
          key={item.tld}
          name={name}
          tld={item.tld}
          status={
            item.available === null
              ? "unknown"
              : item.available
                ? "available"
                : "taken"
          }
          placement={placement}
          size="sm"
          suffixOnly
        />
      ))}
      {remaining > 0 ? (
        <span
          className="text-xs text-muted-foreground"
          title={items
            .slice(max)
            .map((i) => `.${i.tld}`)
            .join(", ")}
        >
          +{remaining}
        </span>
      ) : null}
    </span>
  )
}

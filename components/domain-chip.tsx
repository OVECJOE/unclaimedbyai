import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowUpRightStackIcon,
  Cancel01Icon,
  Globe02Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons"
import { registrarLink, type AffiliatePlacement } from "@/lib/affiliate"
import { cn } from "@/lib/utils"
import Link from "next/link"

export type DomainChipSize = "sm" | "md"

type DomainChipProps = {
  /** Second-level label, e.g. "Makiro". Ignored when `suffixOnly`. */
  name: string
  /** Extension without the dot, e.g. "com". */
  tld: string
  /** Anything other than "available" or "taken" renders as unknown. */
  status: string
  /** Affiliate placement tag this click is earning under. */
  placement: AffiliatePlacement
  size?: DomainChipSize
  /** Show only ".com" instead of the full domain, for compact lists
   *  where the name is already on the same row. The link still points
   *  at the full domain. */
  suffixOnly?: boolean
}

const SIZES: Record<DomainChipSize, string> = {
  sm: "gap-1 px-1.5 py-0.5 text-xs",
  md: "gap-1.5 px-2.5 py-1 text-sm",
}

/**
 * One domain, as an inline chip.
 *
 * The name sits in the text color, the TLD is emphasized, and status is
 * carried by color, icon, and motion together so it reads at a glance.
 * An available domain links to the first registrar that can deep-link a
 * search for this exact domain; taken and unknown domains render inert.
 * Inline-flex by design: it drops into table cells, prose, and card
 * headers without claiming a block of its own.
 */
export default function DomainChip({
  name,
  tld,
  status,
  placement,
  size = "md",
  suffixOnly = false,
}: DomainChipProps) {
  const domain = `${name.toLowerCase()}.${tld}`
  const label = suffixOnly ? `.${tld}` : domain
  const sizes = SIZES[size]

  if (status !== "available" && status !== "taken") {
    return (
      <span
        title={`${domain} availability is not confirmed yet`}
        className={cn(
          "inline-flex items-center border-dashed border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400",
          sizes
        )}
      >
        <HugeiconsIcon
          icon={InformationCircleIcon}
          className="size-3 shrink-0"
          strokeWidth={2}
        />
        <span className="font-mono">{label}</span>
      </span>
    )
  }

  if (status === "taken") {
    return (
      <span
        title={`${domain} is already registered`}
        className={cn(
          "inline-flex cursor-default items-center border-border bg-muted/40 text-muted-foreground",
          sizes
        )}
      >
        <HugeiconsIcon
          icon={Cancel01Icon}
          className="size-3 shrink-0"
          strokeWidth={2}
        />
        <span className="font-mono">
          {suffixOnly ? null : `${name}`}
          <span className="line-through decoration-current/60">.{tld}</span>
        </span>
      </span>
    )
  }

  const link = registrarLink(placement, domain)
  const body = (
    <div className="inline-flex items-center gap-1">
      <HugeiconsIcon
        icon={Globe02Icon}
        strokeWidth={2}
        data-icon="inline-end"
        className="size-3 shrink"
      />
      <span className="font-mono">
        {suffixOnly ? null : `${name}`}
        <span className="font-semibold">.{tld}</span>
      </span>
      {link ? (
        <HugeiconsIcon
          icon={ArrowUpRightStackIcon}
          strokeWidth={2}
          data-icon="inline-end"
          className="size-3 shrink"
        />
      ) : null}
    </div>
  )
  const chipClass = cn(
    "inline-flex items-center border-green-600/40 bg-green-600/10 text-green-800 dark:border-green-400/40 dark:bg-green-400/10 dark:text-green-400",
    sizes,
    link &&
      "group relative cursor-pointer transition-colors hover:bg-green-600/20 hover:text-green-900 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 dark:hover:bg-green-400/20 dark:hover:text-green-300"
  )

  if (!link) {
    return (
      <span
        title={`${domain} is free to register`}
        className={cn(chipClass, "relative")}
      >
        {body}
      </span>
    )
  }

  return (
    <Link
      href={link.href}
      target="_blank"
      rel="sponsored noopener noreferrer"
      title={`Register ${domain} at ${link.registrar === "namecheap" ? "Namecheap" : "GoDaddy"}`}
      aria-label={`Register ${domain} at ${link.registrar}`}
      className={chipClass}
    >
      {body}
    </Link>
  )
}

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

type DomainState = "available" | "taken" | "unknown"

type DomainChipProps = {
  /** Second-level label, e.g. "Makiro". Hidden visually when `suffixOnly`. */
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

const STATES: Record<
  DomainState,
  {
    icon: typeof Globe02Icon
    /** Read by screen readers; the visual state is color and icon only. */
    srLabel: string
    chip: string
    linkChip: string
    tld: string
    /** Verb for the link tooltip, e.g. "Register makiro.com at GoDaddy". */
    verb: string
    inertTitle: (domain: string) => string
  }
> = {
  available: {
    icon: Globe02Icon,
    srLabel: "Available",
    chip: "border-green-600/40 bg-green-600/10 text-green-800 dark:border-green-400/40 dark:bg-green-400/10 dark:text-green-400",
    linkChip:
      "hover:bg-green-600/20 hover:text-green-900 dark:hover:bg-green-400/20 dark:hover:text-green-300",
    tld: "font-semibold",
    verb: "Register",
    inertTitle: (d) => `${d} is free to register`,
  },
  taken: {
    icon: Cancel01Icon,
    srLabel: "Taken",
    chip: "border-border bg-muted/40 text-muted-foreground",
    linkChip: "hover:bg-muted hover:text-foreground",
    tld: "line-through decoration-current/60",
    verb: "See",
    inertTitle: (d) => `${d} is already registered`,
  },
  unknown: {
    icon: InformationCircleIcon,
    srLabel: "Availability not confirmed",
    chip: "border-dashed border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    linkChip: "hover:bg-amber-500/20",
    tld: "",
    verb: "Check",
    inertTitle: (d) => `${d} availability is not confirmed yet`,
  },
}

function registrarName(registrar: string) {
  if (registrar === "namecheap") return "Namecheap"
  if (registrar === "godaddy") return "GoDaddy"
  return registrar
}

/**
 * One domain, as an inline chip.
 *
 * The name sits in the text color, the TLD is emphasized, and status is
 * carried by color and icon, with a screen-reader label alongside.
 * Whatever the status, the chip links to the first registrar that can
 * deep-link a search for this exact domain, under the given affiliate
 * placement. If no registrar link is available it renders inert.
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
  const state: DomainState =
    status === "available" || status === "taken" ? status : "unknown"
  const config = STATES[state]
  const sld = name.toLowerCase()
  const domain = `${sld}.${tld}`
  const link = registrarLink(placement, domain)

  const body = (
    <>
      <HugeiconsIcon
        icon={config.icon}
        strokeWidth={2}
        aria-hidden="true"
        data-icon="inline-start"
        className="size-3 shrink-0"
      />
      <span className="sr-only">{config.srLabel}: </span>
      <span className="font-mono">
        {suffixOnly ? <span className="sr-only">{sld}</span> : sld}
        <span className={config.tld}>.{tld}</span>
      </span>
      {link ? (
        <HugeiconsIcon
          icon={ArrowUpRightStackIcon}
          strokeWidth={2}
          aria-hidden="true"
          data-icon="inline-end"
          className="size-3 shrink-0"
        />
      ) : null}
    </>
  )

  const base = cn(
    "inline-flex items-center border",
    SIZES[size],
    config.chip
  )

  if (!link) {
    return (
      <span title={config.inertTitle(domain)} className={cn(base, "cursor-default")}>
        {body}
      </span>
    )
  }

  return (
    <Link
      href={link.href}
      target="_blank"
      rel="sponsored noopener noreferrer"
      title={`${config.verb} ${domain} at ${registrarName(link.registrar)}`}
      className={cn(
        base,
        "cursor-pointer outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50",
        config.linkChip
      )}
    >
      {body}
    </Link>
  )
}

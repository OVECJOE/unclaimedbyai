import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { affiliateLink } from "@/lib/affiliate"
import { cn } from "@/lib/utils"

const chipClasses =
  "inline-flex items-center border-green-600/30 bg-green-600/10 px-2.5 py-1 font-mono text-xs text-green-700 dark:border-green-400/30 dark:bg-green-400/10 dark:text-green-400"

// A chip that links somewhere has to look like it does. These sit in a strip
// that read as inert text for the whole life of the product, so a link among
// them needs an explicit affordance rather than a hover state nobody discovers
// until they have already decided the strip is not clickable.
const linkedChipClasses = cn(
  chipClasses,
  "min-h-9 cursor-pointer gap-1 border-green-600/50 transition-colors hover:bg-green-600/20 hover:text-green-800 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 dark:hover:bg-green-400/20 dark:hover:text-green-300"
)

/**
 * The green "free to register" chips.
 *
 * Each chip carries its own link, built for the exact domain it names, so a
 * visitor clicking the `.io` chip lands on a registrar search for that `.io`
 * and not for the first extension in the list. That is the whole point: the
 * chip is useful because it is specific to a name this page just verified
 * free, and a link to the wrong extension is advertising rather than help.
 *
 * Until Namecheap's affiliate link is configured the chips render as plain
 * text, so nothing ships dead before the affiliate account is live.
 */
export default function FreeDomainChips({
  domains,
}: {
  domains: { domain: string; tld: string }[]
}) {
  if (!domains.length) {
    return (
      <p className="text-sm text-muted-foreground">
        None of the checked extensions are free right now.
      </p>
    )
  }

  const chips = domains.slice(0, 8).map((domain) => ({
    ...domain,
    href: affiliateLink("namecheap", "check-chips", domain.domain),
  }))
  // The strip is monetized only if every chip resolved a link, so the
  // disclosure never claims a commission the strip cannot earn.
  const monetized = chips.every((chip) => chip.href !== null)

  return (
    <div className="space-y-1.5">
      <p className="flex flex-wrap gap-1.5">
        {chips.map((chip) =>
          chip.href ? (
            <Badge key={chip.tld} asChild variant="outline">
              <a
                href={chip.href}
                target="_blank"
                rel="sponsored noopener noreferrer"
                title={`Register ${chip.domain} at Namecheap`}
                className={linkedChipClasses}
              >
                {chip.domain}
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  strokeWidth={2}
                  data-icon="inline-end"
                />
              </a>
            </Badge>
          ) : (
            <span key={chip.tld} className={chipClasses}>
              {chip.domain}
            </span>
          )
        )}
      </p>
      {monetized ? (
        <p className="text-xs text-muted-foreground">
          Click any extension to register it there. These were free when this
          check ran, and we may earn a commission if you register through them.
        </p>
      ) : null}
      {domains.length > 8 ? (
        <p className="text-xs text-muted-foreground">
          {domains.length - 8} more extensions are free as well.
        </p>
      ) : null}
    </div>
  )
}

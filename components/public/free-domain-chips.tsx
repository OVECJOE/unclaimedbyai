import { Badge } from "@/components/ui/badge"
import { affiliateLink } from "@/lib/affiliate"
import { cn } from "@/lib/utils"

const chipClasses =
  "border-green-600/30 bg-green-600/10 px-2 py-0.5 font-mono text-xs text-green-700 dark:border-green-400/30 dark:bg-green-400/10 dark:text-green-400"

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
                title={`Register ${chip.domain}`}
                className={cn(chipClasses, "hover:underline")}
              >
                {chip.domain}
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
          Verified free at the time of this check. We may earn a commission if
          you register through these links.
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

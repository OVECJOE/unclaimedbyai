import DomainChip from "@/components/domain-chip"
import { registrarLink } from "@/lib/affiliate"

/**
 * The green "free to register" strip.
 *
 * A wrapper over DomainChip that keeps the strip's own contract: a cap,
 * an overflow note, and a commission disclosure that only renders when
 * every chip resolves a link, so the strip never claims a commission it
 * cannot earn. Each chip deep-links the exact domain it names, so a
 * click lands on a registrar search for that extension and not the
 * first one in the list.
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

  const chips = domains.slice(0, 8)
  const monetized = chips.every(
    (chip) => registrarLink("check-chips", chip.domain) !== null
  )

  return (
    <div className="space-y-1.5">
      <p className="flex flex-wrap gap-1.5">
        {chips.map((chip) => {
          const name = chip.domain.slice(
            0,
            chip.domain.length - chip.tld.length - 1
          )
          return (
            <DomainChip
              key={chip.tld}
              name={name}
              tld={chip.tld}
              status="available"
              placement="check-chips"
            />
          )
        })}
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

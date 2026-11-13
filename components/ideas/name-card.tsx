import Link from "next/link"
import DomainChip from "@/components/domain-chip"
import { ScoreGauge } from "@/components/app/score-gauge"
import { TierBadge } from "@/components/tier-badge"
import { verdictLine, type NameFacts } from "@/lib/ideas"
import { nameToSlug } from "@/lib/utils"
import { cn } from "@/lib/utils"

/**
 * One name's write-up: what it scored, the one sentence on why it
 * passed or died, the domains that are actually free, and the real
 * words each chatbot used about it. The chatbot lines are the part
 * nobody else shows, so they get room.
 */
export default function NameCard({
  entry,
  rank,
}: {
  entry: NameFacts
  rank: number
}) {
  const { name } = entry
  const clean = entry.failures.length === 0
  const said = name.ai.filter((row) => !row.failed && row.association)

  return (
    <article
      id={`name-${name.id}`}
      className={cn(
        "scroll-mt-24 space-y-5 border p-5 sm:p-6",
        clean && "border-primary/50 bg-primary/[0.03]"
      )}
    >
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <p className="font-mono text-xs text-muted-foreground">
            #{rank}
            {clean ? (
              <span className="ml-2 font-sans font-semibold tracking-widest text-primary uppercase">
                Survived every check
              </span>
            ) : null}
          </p>
          <h3 className="font-heading text-3xl leading-tight break-words">
            {name.name}
          </h3>
          <TierBadge tier={name.tier} />
        </div>
        <ScoreGauge score={name.score} tier={name.tier} size={80} />
      </header>

      {name.about ? (
        <p className="text-muted-foreground">{name.about}</p>
      ) : null}

      <p
        className={cn(
          "border-l-2 pl-3 text-sm",
          clean ? "border-primary" : "border-amber-500"
        )}
      >
        {verdictLine(entry)}
      </p>

      {entry.freeDomains.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Free to register
          </p>
          <p className="flex flex-wrap gap-1.5">
            {entry.freeDomains.slice(0, 6).map((tld) => (
              <DomainChip
                key={tld}
                name={name.name.toLowerCase().replace(/[^a-z0-9-]/g, "")}
                tld={tld}
                status="available"
                placement="check-chips"
                size="sm"
              />
            ))}
          </p>
        </div>
      ) : null}

      {said.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            What the chatbots said
          </p>
          <ul className="space-y-2 text-sm">
            {said.slice(0, 3).map((row) => (
              <li key={row.model} className="flex gap-3">
                <span className="w-24 shrink-0 font-medium">{row.model}</span>
                <span className="text-muted-foreground">
                  {row.association}
                  {row.confidence !== null && row.confidence >= 30 ? (
                    <span className="ml-1.5 text-amber-700 dark:text-amber-400">
                      ({row.confidence}/100 overlap)
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <Link
        href={`/check/${nameToSlug(name.name)}`}
        className="inline-block text-sm text-primary underline underline-offset-4"
      >
        Run a fresh check on {name.name}
      </Link>
    </article>
  )
}

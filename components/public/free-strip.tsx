import FreeDomainChips from "@/components/public/free-domain-chips"
import type { CheckReport } from "@/lib/api"
import { factsOf } from "@/lib/name-facts"

/** The extensions that are free right now, with the register links. */
export default function FreeStrip({ report }: { report: CheckReport }) {
  const { freeDomains } = factsOf(report)
  if (freeDomains.length === 0) return null
  return (
    <section className="px-4 pb-12">
      <div className="mx-auto max-w-6xl space-y-3 border bg-card p-5 sm:p-6">
        <p className="text-[0.6875rem] font-semibold tracking-widest text-muted-foreground uppercase">
          Free to register right now
        </p>
        <FreeDomainChips domains={freeDomains} />
      </div>
    </section>
  )
}

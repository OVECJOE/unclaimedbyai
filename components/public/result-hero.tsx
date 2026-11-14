import type { ReactNode } from "react"
import RegistryField from "@/components/fields/registry-field"
import { ScoreGauge } from "@/components/app/score-gauge"

type Tier = "Excellent" | "Good" | "Okay" | "Poor"

export function toTier(level: string): Tier {
  const mapped = level.charAt(0).toUpperCase() + level.slice(1)
  return (["Excellent", "Good", "Okay", "Poor"] as const).includes(
    mapped as Tier
  )
    ? (mapped as Tier)
    : "Okay"
}

/**
 * The top of a public result page: what this is, the answer in a
 * sentence, the score, and the one thing to do next. The same shape for
 * a single name and for a whole search, so the two read as one product.
 */
export default function ResultHero({
  eyebrow,
  title,
  answer,
  score,
  tier,
  actions,
}: {
  eyebrow: string
  title: ReactNode
  answer: ReactNode
  score?: number | null
  tier?: Tier
  actions: ReactNode
}) {
  return (
    <section className="relative isolate overflow-hidden border-b px-4 pt-14 pb-12 md:pt-20">
      <RegistryField quiet />
      <div className="mx-auto grid max-w-5xl items-center gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:gap-14">
        <div className="space-y-5">
          <p className="text-[0.6875rem] font-semibold tracking-widest text-primary uppercase">
            {eyebrow}
          </p>
          <h1 className="font-heading text-4xl leading-[1.05] text-balance break-words sm:text-5xl md:text-6xl">
            {title}
          </h1>
          <p className="max-w-2xl text-lg text-pretty text-muted-foreground md:text-xl">
            {answer}
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {actions}
          </div>
        </div>
        {score !== null && score !== undefined && tier ? (
          <div className="flex items-center gap-4 md:flex-col md:items-center">
            <ScoreGauge score={score} tier={tier} size={132} />
            <p className="text-sm text-muted-foreground md:text-center">
              <span className="block text-foreground">{tier} overall</span>
              score out of 100
            </p>
          </div>
        ) : null}
      </div>
    </section>
  )
}

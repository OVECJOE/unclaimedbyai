"use client"

import { useId, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { CURRENCY_SYMBOL, PRO_PRICE } from "@/lib/site"

export type CalculatorPack = {
  slug: string
  title: string
  credits: number
  amount: number
}

const ACTIONS = [
  {
    key: "rechecks",
    label: "Names to re-check",
    hint: "1 credit each. The first check on every name stays free.",
    cost: 1,
    max: 100,
    initial: 12,
  },
  {
    key: "searches",
    label: "Searches past your free allowance",
    hint: "2 credits each.",
    cost: 2,
    max: 50,
    initial: 4,
  },
  {
    key: "research",
    label: "Ideas to research in depth",
    hint: "3 credits each: competitors, demand, channels, money.",
    cost: 3,
    max: 20,
    initial: 2,
  },
] as const

type Key = (typeof ACTIONS)[number]["key"]

function money(amount: number) {
  return `${CURRENCY_SYMBOL}${amount.toFixed(2)}`
}

/**
 * "Which pack do I need?" answered with arithmetic instead of a guess.
 * Three sliders for the three things credits buy; the cheapest way to
 * cover the total is computed from the same packs checkout sells, and
 * Pro is suggested only when the searches alone would cost more than a
 * month of it.
 */
export default function CreditCalculator({
  packs,
  signedIn,
}: {
  packs: CalculatorPack[]
  signedIn: boolean
}) {
  const id = useId()
  const [values, setValues] = useState<Record<Key, number>>({
    rechecks: ACTIONS[0].initial,
    searches: ACTIONS[1].initial,
    research: ACTIONS[2].initial,
  })

  const total = ACTIONS.reduce(
    (sum, action) => sum + values[action.key] * action.cost,
    0
  )

  const best = useMemo(() => {
    if (!packs.length || total === 0) return null
    return packs
      .map((pack) => {
        const count = Math.ceil(total / pack.credits)
        return {
          pack,
          count,
          cost: count * pack.amount,
          spare: count * pack.credits - total,
        }
      })
      .sort((a, b) => a.cost - b.cost || b.spare - a.spare)[0]
  }, [packs, total])

  const cheapestRate = packs.length
    ? Math.min(...packs.map((pack) => pack.amount / pack.credits))
    : 0
  const searchSpend = values.searches * 2 * cheapestRate
  const suggestPro = searchSpend > PRO_PRICE

  return (
    <div className="grid gap-px overflow-hidden border border-border bg-border lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-8 bg-background p-6 sm:p-8">
        {ACTIONS.map((action) => {
          const inputId = `${id}-${action.key}`
          return (
            <div key={action.key} className="space-y-3">
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-medium">{action.label}</span>
                <output
                  htmlFor={inputId}
                  className="font-heading text-3xl leading-none tabular-nums"
                >
                  {values[action.key]}
                </output>
              </div>
              <Slider
                id={inputId}
                min={0}
                max={action.max}
                step={1}
                value={[values[action.key]]}
                onValueChange={([next]) =>
                  setValues((current) => ({
                    ...current,
                    [action.key]: next,
                  }))
                }
                aria-label={action.label}
              />
              <p className="text-xs text-muted-foreground">{action.hint}</p>
            </div>
          )
        })}
      </div>

      <div
        aria-live="polite"
        className="flex flex-col gap-6 bg-primary/5 p-6 sm:p-8"
      >
        <div>
          <p className="font-mono text-[0.6875rem] font-semibold tracking-[0.14em] text-primary uppercase">
            You need
          </p>
          <p className="font-heading text-7xl leading-none tabular-nums">
            {total}
            <span className="ms-2 font-sans text-base text-muted-foreground">
              credits
            </span>
          </p>
        </div>

        {best ? (
          <div className="space-y-1 border-t pt-6">
            <p className="font-mono text-[0.6875rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Cheapest way to get there
            </p>
            <p className="font-heading text-3xl">
              {best.count > 1 ? `${best.count} × ` : ""}
              {best.pack.title}
            </p>
            <p className="text-muted-foreground">
              {money(best.cost)} once
              {best.spare > 0 ? `, with ${best.spare} credits left over` : ""}.
              Credits never expire.
            </p>
          </div>
        ) : (
          <p className="border-t pt-6 text-muted-foreground">
            {total === 0
              ? "Nothing to buy. The free plan covers you."
              : "Packs could not load right now. Refresh in a moment."}
          </p>
        )}

        <p
          className={cn(
            "text-sm",
            suggestPro ? "text-primary" : "text-muted-foreground"
          )}
        >
          {suggestPro
            ? `At this many searches, Pro at ${money(PRO_PRICE)} a month is cheaper. It includes 50 searches and the watchlist.`
            : "Only searching a little? Credits are cheaper than a subscription."}
        </p>

        <Button asChild size="lg" className="mt-auto w-full">
          <Link
            href={
              signedIn
                ? "/dashboard/billing"
                : best
                  ? `/auth?plan=${best.pack.slug}`
                  : "/auth"
            }
          >
            {best ? `Get ${best.pack.title}` : "Start free"}
          </Link>
        </Button>
      </div>
    </div>
  )
}

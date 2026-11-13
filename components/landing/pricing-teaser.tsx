import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"
import GsapReveal from "@/components/about/gsap-reveal"
import { SectionHeader } from "@/components/public/section-header"
import { Button } from "@/components/ui/button"
import { FREE_SEARCHES, PLANS, PRO_LIMITS, PRO_PRICE, formatPrice } from "@/lib/site"
import { cn } from "@/lib/utils"

const cheapestCredit = Math.min(...PLANS.map((plan) => plan.amount / plan.credits))

const TIERS = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever, no card",
    lines: [
      "First check on every name, free",
      `${FREE_SEARCHES} searches a month`,
      "3 idea runs a day, 1 sandbox",
    ],
    cta: "Start free",
    href: "/auth",
    featured: false,
  },
  {
    name: "Pro",
    price: formatPrice(PRO_PRICE),
    cadence: "a month, cancel any time",
    lines: [
      `${PRO_LIMITS.max_searches} searches a month, ${PRO_LIMITS.max_sandboxes} sandboxes`,
      `${PRO_LIMITS.max_generation_runs} idea runs a day`,
      "Watchlist, rechecked every few hours",
    ],
    cta: "Go Pro",
    href: "/pricing",
    featured: true,
  },
  {
    name: "Credits",
    price: `from ${formatPrice(cheapestCredit)}`,
    cadence: "per credit, never expire",
    lines: ["Re-check a name: 1 credit", "Extra search: 2 credits", "Market research: 3 credits"],
    cta: "See packs",
    href: "/pricing#credits",
    featured: false,
  },
]

/** The price story in one glance, so nobody has to leave to find it. */
export default function PricingTeaser({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="border-b px-4 py-20 md:py-28">
      <div className="mx-auto max-w-7xl space-y-12">
        <SectionHeader
          eyebrow="What it costs"
          title="Free where it matters."
          accent="Cheap where it goes deep."
          lede="Checking a name the first time never costs anything. You only pay when you want more searches, re-checks, or someone keeping watch."
        />

        <GsapReveal
          stagger={0.1}
          className="grid gap-px overflow-hidden border border-border bg-border md:grid-cols-3"
        >
          {TIERS.map((tier) => (
            <article
              key={tier.name}
              data-reveal
              className={cn(
                "relative flex flex-col gap-6 p-6 sm:p-8",
                tier.featured ? "bg-primary/5" : "bg-background"
              )}
            >
              {tier.featured ? (
                <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-primary" />
              ) : null}
              <div className="flex items-center justify-between">
                <p className="font-mono text-[0.6875rem] font-semibold tracking-[0.14em] uppercase">
                  {tier.name}
                </p>
                {tier.featured ? (
                  <span className="bg-primary px-2 py-0.5 font-mono text-[0.625rem] font-semibold tracking-widest text-primary-foreground uppercase">
                    Best value
                  </span>
                ) : null}
              </div>
              <div>
                <p className="font-heading text-5xl leading-none">{tier.price}</p>
                <p className="mt-2 font-mono text-xs text-muted-foreground">{tier.cadence}</p>
              </div>
              <ul className="flex-1 space-y-2.5 text-sm">
                {tier.lines.map((line) => (
                  <li key={line} className="flex items-start gap-2">
                    <HugeiconsIcon
                      icon={CheckmarkCircle02Icon}
                      className="mt-0.5 size-4 shrink-0 text-primary"
                    />
                    {line}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                size="lg"
                variant={tier.featured ? "default" : "outline"}
                className="w-full"
              >
                <Link href={tier.name === "Free" && signedIn ? "/dashboard" : tier.href}>
                  {tier.name === "Free" && signedIn ? "Open dashboard" : tier.cta}
                </Link>
              </Button>
            </article>
          ))}
        </GsapReveal>
      </div>
    </section>
  )
}

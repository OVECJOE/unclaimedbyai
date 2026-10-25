import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import GsapReveal from "@/components/about/gsap-reveal"

const TIERS = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    lines: [
      "1 sandbox, 3 searches a month",
      "3 idea runs a day",
      "First check on every name, free",
    ],
    cta: "Start free",
    href: "/auth",
    highlight: false,
  },
  {
    name: "Credits",
    price: "$0.09",
    cadence: "per credit, in packs",
    lines: [
      "Market research: 3 credits",
      "Search past your allowance: 2",
      "Re-check a name: 1",
    ],
    cta: "See credit packs",
    href: "/pricing",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$4.99",
    cadence: "per month",
    lines: [
      "10 sandboxes, 50 searches a month",
      "20 idea runs a day, 5 checks per name",
      "Watchlist, rechecked every few hours",
    ],
    cta: "Go Pro",
    href: "/pricing",
    highlight: true,
  },
]

/**
 * The whole price story in one band: free to start, credits for depth,
 * Pro for people who live here. Server-rendered, no client JS.
 */
export default function PricingBand() {
  return (
    <section className="border-b px-4 py-10 md:py-16">
      <GsapReveal className="mx-auto max-w-7xl space-y-8">
        <div className="space-y-2 sm:text-center">
          <p className="text-[0.625rem] font-semibold tracking-widest text-primary uppercase">
            What it costs
          </p>
          <h2 className="font-heading text-2xl font-semibold sm:text-3xl md:text-4xl">
            Free where it matters.{" "}
            <span className="text-primary">Paid where it goes deep.</span>
          </h2>
        </div>

        <div className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-3">
          {TIERS.map((tier) => (
            <article
              key={tier.name}
              data-reveal
              className={
                tier.highlight
                  ? "flex flex-col gap-4 border border-primary bg-background p-5 sm:p-6"
                  : "flex flex-col gap-4 bg-background p-5 sm:p-6"
              }
            >
              <div className="flex items-center justify-between">
                <p className="font-heading text-xl font-semibold">
                  {tier.name}
                </p>
                {tier.highlight ? (
                  <Badge
                    className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground"
                    asChild
                  >
                    <span className="px-2 py-0.5">Most capable</span>
                  </Badge>
                ) : null}
              </div>
              <p className="flex items-baseline gap-2">
                <span className="font-heading text-4xl font-semibold">
                  {tier.price}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {tier.cadence}
                </span>
              </p>
              <ul className="flex-1 space-y-1.5 text-sm text-muted-foreground">
                {tier.lines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <Link
                href={tier.href}
                className={
                  tier.highlight
                    ? "block border border-primary bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                    : "block border px-4 py-2 text-center text-sm font-medium transition-colors hover:border-primary/50 hover:text-primary"
                }
              >
                {tier.cta}
              </Link>
            </article>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Credits never expire and sit on top of any plan.{" "}
          <Link href="/pricing" className="text-primary underline">
            The full pricing page
          </Link>{" "}
          says the whole thing out loud.
        </p>
      </GsapReveal>
    </section>
  )
}

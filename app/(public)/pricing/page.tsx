import { Badge } from "@/components/ui/badge"
import { PriceCard, PriceCardProps } from "@/components/price-card"
import type { Metadata } from "next"
import { JsonLd } from "@/components/app/json-ld"
import {
  PLANS,
  FREE_SEARCHES,
  SEARCHES_PER_REPORT,
  CURRENCY_SYMBOL,
  PRICING_DESCRIPTION,
  pageMetadata,
  pricingJsonLd,
} from "@/lib/site"

export const metadata: Metadata = pageMetadata({
  title: "Pricing",
  description: PRICING_DESCRIPTION,
  path: "/pricing",
})

const prices: PriceCardProps[] = PLANS.map((plan) => ({
  title: plan.title,
  label: plan.label,
  price: { currency: CURRENCY_SYMBOL, amount: plan.amount },
  benefits: plan.benefits,
  discountage: plan.discountage,
}))

const steps = [
  {
    title: "Search for free",
    body: `Every account starts with ${FREE_SEARCHES} searches. The first check on each name is always free.`,
  },
  {
    title: "Re-check with a report",
    body: "Changed a name or want fresh availability? Spend one report to run the check again.",
  },
  {
    title: "Get more searches",
    body: `Each report you buy also adds ${SEARCHES_PER_REPORT} searches, so bigger packs go further.`,
  },
]

export default function PricingPage() {
  return (
    <>
      <JsonLd data={pricingJsonLd} />
      <section className="space-y-5 px-4 py-10 sm:text-center">
        <Badge
          className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground"
          asChild
        >
          <p className="px-2 py-1 sm:px-3">
            {FREE_SEARCHES} free searches. Pay per report. No subscriptions.
          </p>
        </Badge>
        <div className="space-y-3">
          <h1 className="font-heading text-4xl font-semibold md:text-5xl">
            Pay for what you check. Not what you don&apos;t.
          </h1>
          <p className="mx-auto max-w-prose md:text-lg">
            Your first check on every name is free. Reports are for re-checks
            and extra searches, and you only buy them when you need them.
          </p>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mx-auto max-w-7xl mt-10">
          {prices.map((price, index) => (
            <PriceCard key={index} {...price} />
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-7xl space-y-8">
          <h2 className="font-heading text-2xl font-semibold md:text-3xl">
            How reports work
          </h2>
          <ol className="grid grid-cols-1 gap-4 text-left md:grid-cols-3">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="space-y-2 border p-5"
              >
                <span className="font-mono text-sm text-muted-foreground">
                  0{index + 1}
                </span>
                <h3 className="font-heading text-lg font-semibold">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  )
}

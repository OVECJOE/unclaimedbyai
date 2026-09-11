import { Badge } from "@/components/ui/badge"
import { PriceCard, PriceCardProps } from "@/components/price-card"
import type { Metadata } from "next"
import { JsonLd } from "@/components/app/json-ld"
import { PLANS, pageMetadata, pricingJsonLd } from "@/lib/site"

export const metadata: Metadata = pageMetadata({
  title: "Pricing",
  description:
    "Pay per report, not per month. Single reports from $1.99, 5 reports for $6.99, or 20 reports for $21.99. No subscriptions.",
  path: "/pricing",
})

const prices: PriceCardProps[] = PLANS.map((plan) => ({
  title: plan.title,
  label: plan.label,
  price: { currency: "$", amount: plan.amount },
  benefits: plan.benefits,
  discountage: plan.discountage,
}))

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
            Pay per report. No subscriptions.
          </p>
        </Badge>
        <div className="space-y-3">
          <h1 className="font-heading text-4xl font-semibold md:text-5xl">
            Pay for what you check. Not what you don&apos;t.
          </h1>
          <p className="mx-auto max-w-prose md:text-lg">
            Simple, transparent pricing. Full reports unlock after checkout.
          </p>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mx-auto max-w-7xl mt-10">
          {prices.map((price, index) => (
            <PriceCard key={index} {...price} />
          ))}
        </div>
      </section>
    </>
  );
}

import { Badge } from "@/components/ui/badge"
import { PriceCard, PriceCardProps } from "@/components/price-card"

const prices: PriceCardProps[] = [
  {
    title: "Single report",
    price: { currency: "$", amount: 1.99 },
    label: "One name, full report.",
    benefits: ["Domains", "Social handles", "AI association"],
  },
  {
    title: "5 reports",
    price: { currency: "$", amount: 6.99 },
    label: "$1.40 per report.",
    benefits: ["Domains", "Social handles", "AI association"],
    discountage: 30,
  },
  {
    title: "20 reports",
    price: { currency: "$", amount: 21.99 },
    label: "$1.10 per report.",
    benefits: ["Domains", "Social handles", "AI association"],
    discountage: 45,
  },
]

export default function PricingPage() {
  return (
    <>
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

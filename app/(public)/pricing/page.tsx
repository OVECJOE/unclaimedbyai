import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PriceCard, PriceCardProps } from "@/components/price-card"
import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { JsonLd } from "@/components/app/json-ld"
import BuyButton from "@/components/dashboard/buy-button"
import PaymentFlag from "@/components/dashboard/payment-flag"
import { getMeServer } from "@/lib/api-server"
import {
  CURRENCY_SYMBOL,
  PRICING_DESCRIPTION,
  PRO_LIMITS,
  PRO_PRICE,
  pageMetadata,
  pricingJsonLd,
  creditPackBenefits,
  proBenefits,
} from "@/lib/site"
import type { Pack } from "@/lib/api"

async function loadPacks(): Promise<Pack[]> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8007"
    const res = await fetch(`${base}/api/v1/packs`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const packs = (await res.json()) as Pack[]
    return packs.filter((pack) => pack.credits > 0)
  } catch {
    return []
  }
}

function toPriceCard(pack: Pack, singleRate: number): PriceCardProps {
  const perCredit = pack.price_minor / 100 / pack.credits
  return {
    title: pack.title,
    label: `${CURRENCY_SYMBOL}${perCredit.toFixed(2)} per credit.`,
    price: { currency: CURRENCY_SYMBOL, amount: pack.price_minor / 100 },
    benefits: creditPackBenefits(pack.credits),
    discountage:
      perCredit < singleRate
        ? Math.round((1 - perCredit / singleRate) * 100)
        : undefined,
  }
}

export const metadata: Metadata = pageMetadata({
  title: "Pricing",
  description: PRICING_DESCRIPTION,
  path: "/pricing",
})

export default async function PricingPage() {
  const packs = await loadPacks()
  const user = await getMeServer().catch(() => null)
  const singleRate = packs.length
    ? Math.max(...packs.map((p) => p.price_minor / 100 / p.credits))
    : 0.5

  const tiers = [
    {
      title: "Free",
      label: "For seeing whether this is for you.",
      price: { currency: CURRENCY_SYMBOL, amount: 0 },
      benefits: [
        "1 sandbox to hold your ideas",
        "3 searches a month",
        "3 idea runs a day",
        "First check on every name stays free",
        "No card, ever",
      ],
    },
    {
      title: "Pro",
      label: "For the person who has stopped browsing and started building.",
      price: { currency: CURRENCY_SYMBOL, amount: PRO_PRICE },
      benefits: proBenefits(PRO_LIMITS),
    },
  ]

  const steps = [
    {
      title: "Start free",
      body: "One sandbox, three searches a month, and the first check on every name is free. Nothing to cancel because there is nothing to join.",
    },
    {
      title: "Research before you build",
      body: "Spend 3 credits on deep market research for an idea: competitors, demand, audience channels, and how it makes money.",
    },
    {
      title: "Search, then re-check",
      body: "A search costs 2 credits past your allowance, and re-checking a name costs 1. Availability is the thing that changes, so re-checking is the thing worth paying for.",
    },
    {
      title: "Watch what you love",
      body: "On Pro, star a name and we recheck its domains and handles every few hours, emailing you the moment something gets claimed.",
    },
  ]

  return (
    <>
      <JsonLd data={pricingJsonLd} />
      {/* Checkout returns here with ?paid=1; this announces the result
          and refreshes the server-rendered balance. */}
      <Suspense fallback={null}>
        <PaymentFlag />
      </Suspense>
      <section className="space-y-5 px-4 py-10 sm:text-center">
        <Badge
          className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground"
          asChild
        >
          <p className="px-2 py-1 sm:px-3">
            Free to start. Pro when you build. Credits for the rest.
          </p>
        </Badge>
        <div className="space-y-3">
          <h1 className="font-heading text-4xl font-semibold md:text-5xl">
            Ideas are free. Depth is not.
          </h1>
          <p className="mx-auto max-w-prose md:text-lg">
            Generate ideas and check names without paying anything. When an idea
            earns your attention, research it properly and keep its availability
            fresh, either on Pro or with credits you buy once.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
          {tiers.map((tier) => (
            <PriceCard
              key={tier.title}
              {...tier}
              highlight={tier.title === "Pro"}
              action={
                user ? (
                  <Button size="lg" asChild className="w-full">
                    <Link href="/dashboard/billing">
                      {tier.title === "Pro" ? "Upgrade" : "Open your dashboard"}
                    </Link>
                  </Button>
                ) : (
                  <Button size="lg" asChild className="w-full">
                    <Link href="/auth">Get started</Link>
                  </Button>
                )
              }
            />
          ))}
        </div>

        <div>
          <h2 className="mb-3 font-heading text-xl font-semibold">
            Top up with credits
          </h2>
          <p className="mx-auto mb-5 max-w-prose text-sm text-muted-foreground">
            Credits sit on top of any plan and never expire. Going past your
            monthly allowance draws from them, so running out of plan never
            blocks you while credits last.
          </p>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {packs.length > 0 ? (
              packs.map((pack) => (
                <PriceCard
                  key={pack.slug}
                  {...toPriceCard(pack, singleRate)}
                  action={
                    user ? (
                      <BuyButton
                        packSlug={pack.slug}
                        label={`Buy ${pack.title}`}
                      />
                    ) : (
                      <Button size="lg" asChild className="w-full">
                        <Link href={`/auth?plan=${pack.slug}`}>
                          Get started
                        </Link>
                      </Button>
                    )
                  }
                />
              ))
            ) : (
              <p className="mx-auto max-w-prose text-sm text-muted-foreground">
                Credit packs could not load right now. Refresh in a moment — the
                free plan above works regardless.
              </p>
            )}
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-7xl space-y-8">
          <h2 className="font-heading text-2xl font-semibold md:text-3xl">
            How the money works
          </h2>
          <ol className="grid grid-cols-1 gap-4 text-left md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <li key={step.title} className="space-y-2 border p-5">
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

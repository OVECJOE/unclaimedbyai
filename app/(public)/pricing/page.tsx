import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { FaqItem, FaqList } from "@/components/ui/faq-list"
import { SectionHeader } from "@/components/public/section-header"
import CreditCalculator, {
  type CalculatorPack,
} from "@/components/public/credit-calculator"
import { cn } from "@/lib/utils"
import RegistryField from "@/components/fields/registry-field"
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
  FREE_SEARCHES,
  PLANS,
  PRO_LIMITS,
  PRO_PRICE,
  pageMetadata,
  pricingJsonLd,
  proBenefits,
  SITE_URL,
  formatPrice,
} from "@/lib/site"
import { FAQS } from "@/app/(public)/product/constants"
import type { Pack } from "@/lib/api"

async function loadPacks(): Promise<Pack[]> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8007"
    // Prices are the product's promise: an hour of stale cache after a
    // price change shows wrong numbers on the very page selling them
    // (checkout would still charge the truth from the row, so the page
    // would even *lie* about what it charges).
    const res = await fetch(`${base}/api/v1/packs`, {
      cache: "no-store",
    })
    if (!res.ok) return []
    const packs = (await res.json()) as Pack[]
    return packs.filter((pack) => pack.credits > 0)
  } catch {
    return []
  }
}

const PRICING_FAQ_IDS = [
  "is-unclaimedbyai-free-to-use",
  "how-do-credits-work",
  "why-would-i-check-the-same-name-more-than-once",
  "what-happens-to-my-work-if-i-stop-paying",
  "can-i-buy-the-domain-through-you",
]

const PRICING_FAQS = PRICING_FAQ_IDS.map((id) =>
  FAQS.find((faq) => faq.id === id)
).filter((faq): faq is (typeof FAQS)[number] => Boolean(faq))

const pricingFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": `${SITE_URL}/pricing#faq`,
  mainEntity: PRICING_FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
}

const pricingBreadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: { "@type": "WebPage", name: "Home", url: SITE_URL },
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Pricing",
      item: { "@type": "WebPage", name: "Pricing", url: `${SITE_URL}/pricing` },
    },
  ],
}

export const metadata: Metadata = pageMetadata({
  title: "Pricing",
  description: PRICING_DESCRIPTION,
  path: "/pricing",
})

const COSTS = [
  { action: "First check on any name", credits: "Free", note: "Always, on every plan" },
  { action: "Re-check a name", credits: "1", note: "Availability is what changes" },
  { action: "Search past your allowance", credits: "2", note: "A generated, checked shortlist" },
  { action: "Research an idea", credits: "3", note: "Competitors, demand, channels, money" },
]

function Benefit({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <HugeiconsIcon
        icon={CheckmarkCircle02Icon}
        className="mt-0.5 size-4 shrink-0 text-primary"
      />
      <span>{children}</span>
    </li>
  )
}

export default async function PricingPage() {
  const packs = await loadPacks()
  const user = await getMeServer().catch(() => null)
  const signedIn = Boolean(user)

  // Live packs when the API answers, the build-time mirror otherwise,
  // so the calculator always has real numbers to work with.
  const calculatorPacks: CalculatorPack[] = packs.length
    ? packs.map((pack) => ({
        slug: pack.slug,
        title: pack.title,
        credits: pack.credits,
        amount: pack.price_minor / 100,
      }))
    : PLANS.map((plan) => ({
        slug: plan.slug,
        title: plan.title,
        credits: plan.credits,
        amount: plan.amount,
      }))
  const highestRate = Math.max(
    ...calculatorPacks.map((pack) => pack.amount / pack.credits)
  )

  const tiers = [
    {
      title: "Free",
      price: 0,
      cadence: "forever. No card, ever.",
      label: "For finding out whether a name, or this tool, is for you.",
      benefits: [
        "First check on every name stays free",
        `${FREE_SEARCHES} searches a month`,
        "3 idea runs a day",
        "1 sandbox to hold your ideas",
      ],
      cta: signedIn ? "Open your dashboard" : "Start free",
      href: signedIn ? "/dashboard" : "/auth",
      featured: false,
    },
    {
      title: "Pro",
      price: PRO_PRICE,
      cadence: "a month. Cancel from Billing any time.",
      label: "For the person who has stopped browsing and started building.",
      benefits: proBenefits(PRO_LIMITS),
      cta: signedIn ? "Upgrade to Pro" : "Start with Pro",
      href: signedIn ? "/dashboard/billing" : "/auth",
      featured: true,
    },
  ]

  return (
    <>
      <JsonLd data={pricingJsonLd} />
      <JsonLd data={pricingFaqJsonLd} />
      <JsonLd data={pricingBreadcrumbJsonLd} />
      {/* Checkout returns here with ?paid=1; this announces the result
          and refreshes the server-rendered balance. */}
      <Suspense fallback={null}>
        <PaymentFlag />
      </Suspense>

      {/* Hero + plans */}
      <section className="relative isolate overflow-hidden border-b px-4 pt-16 pb-20 md:pt-24">
        <RegistryField quiet />
        <div className="mx-auto max-w-5xl space-y-14">
          <SectionHeader
            as="h1"
            eyebrow="Pricing"
            title="Ideas are free."
            accent="Depth costs pocket change."
            lede="Generate ideas and check names without paying anything. When an idea earns your attention, research it properly and keep its availability fresh, on Pro or with credits you buy once."
          />

          <div
            data-field-avoid
            className="grid gap-px overflow-hidden border border-border bg-border md:grid-cols-2"
          >
            {tiers.map((tier) => (
              <article
                key={tier.title}
                className={cn(
                  "relative flex flex-col gap-6 p-6 sm:p-10",
                  tier.featured ? "bg-primary/5" : "bg-background"
                )}
              >
                {tier.featured ? (
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-1 bg-primary"
                  />
                ) : null}
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-mono text-[0.6875rem] font-semibold tracking-[0.14em] uppercase">
                    {tier.title}
                  </h2>
                  {tier.featured ? (
                    <span className="bg-primary px-2 py-0.5 font-mono text-[0.625rem] font-semibold tracking-widest text-primary-foreground uppercase">
                      Everything included
                    </span>
                  ) : null}
                </div>
                <div>
                  <p className="font-heading text-7xl leading-none">
                    {tier.price === 0 ? "$0" : formatPrice(tier.price)}
                  </p>
                  <p className="mt-2 font-mono text-xs text-muted-foreground">
                    {tier.cadence}
                  </p>
                </div>
                <p className="text-muted-foreground">{tier.label}</p>
                <ul className="flex-1 space-y-3 border-t pt-6 text-sm">
                  {tier.benefits.map((benefit) => (
                    <Benefit key={benefit}>{benefit}</Benefit>
                  ))}
                </ul>
                <Button
                  asChild
                  size="lg"
                  variant={tier.featured ? "default" : "outline"}
                  className="h-12 w-full"
                >
                  <Link href={tier.href}>{tier.cta}</Link>
                </Button>
              </article>
            ))}
          </div>
          <p
            data-field-avoid
            className="text-center text-sm text-muted-foreground"
          >
            Pro bills monthly and cancels from Billing; the plan stays active
            until the period ends. Credits never expire, on any plan.
          </p>
        </div>
      </section>

      {/* Credit packs */}
      <section id="credits" className="scroll-mt-20 border-b px-4 py-20 md:py-28">
        <div className="mx-auto max-w-7xl space-y-12">
          <SectionHeader
            eyebrow="Credits"
            title="Top up once."
            accent="Spend whenever."
            lede="Credits sit on top of any plan and never expire. Going past your monthly allowance draws from them, so running out of plan never blocks you while credits last."
          />

          {calculatorPacks.length > 0 ? (
            <div className="grid gap-px overflow-hidden border border-border bg-border md:grid-cols-3">
              {calculatorPacks.map((pack) => {
                const amount = pack.amount
                const perCredit = amount / pack.credits
                const saving =
                  perCredit < highestRate
                    ? Math.round((1 - perCredit / highestRate) * 100)
                    : 0
                return (
                  <article
                    key={pack.slug}
                    className="flex flex-col gap-5 bg-background p-6 sm:p-8"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-mono text-[0.6875rem] font-semibold tracking-[0.14em] uppercase">
                        {pack.title}
                      </h3>
                      {saving > 0 ? (
                        <span className="border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[0.625rem] font-semibold tracking-widest text-primary uppercase">
                          Save {saving}%
                        </span>
                      ) : null}
                    </div>
                    <div>
                      <p className="font-heading text-6xl leading-none">
                        {CURRENCY_SYMBOL}
                        {amount.toFixed(2)}
                      </p>
                      <p className="mt-2 font-mono text-xs text-muted-foreground">
                        {CURRENCY_SYMBOL}
                        {perCredit.toFixed(2)} per credit, once
                      </p>
                    </div>
                    <ul className="flex-1 space-y-2 border-t pt-5 text-sm">
                      <Benefit>{pack.credits} credits, yours until spent</Benefit>
                      <Benefit>
                        Up to {pack.credits} re-checks, or{" "}
                        {Math.floor(pack.credits / 3)} research runs
                      </Benefit>
                    </ul>
                    {user ? (
                      <BuyButton
                        packSlug={pack.slug}
                        label={`Buy ${pack.title}`}
                      />
                    ) : (
                      <Button asChild size="lg" variant="outline" className="w-full">
                        <Link href={`/auth?plan=${pack.slug}`}>
                          Get {pack.title}
                        </Link>
                      </Button>
                    )}
                  </article>
                )
              })}
            </div>
          ) : (
            <p className="border p-6 text-center text-sm text-muted-foreground">
              Credit packs could not load right now. Refresh in a moment. The
              free plan works regardless.
            </p>
          )}

          <div className="overflow-x-auto border">
            <table className="w-full min-w-[32rem] border-collapse text-sm">
              <caption className="sr-only">What a credit buys</caption>
              <thead>
                <tr className="border-b bg-sidebar">
                  <th scope="col" className="p-4 text-start font-mono text-[0.6875rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                    Action
                  </th>
                  <th scope="col" className="p-4 text-start font-mono text-[0.6875rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                    Credits
                  </th>
                  <th scope="col" className="p-4 text-start font-mono text-[0.6875rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                    Why
                  </th>
                </tr>
              </thead>
              <tbody>
                {COSTS.map((row) => (
                  <tr key={row.action} className="border-b last:border-b-0">
                    <th scope="row" className="p-4 text-start font-medium">
                      {row.action}
                    </th>
                    <td className="p-4 font-heading text-2xl text-primary">
                      {row.credits}
                    </td>
                    <td className="p-4 text-muted-foreground">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section className="border-b bg-sidebar px-4 py-20 md:py-28">
        <div className="mx-auto max-w-7xl space-y-12">
          <SectionHeader
            eyebrow="Calculator"
            title="Which pack do you"
            accent="actually need?"
            lede="Slide in what you expect to do in a month. We'll work out the cheapest way to cover it, and tell you when Pro would cost less."
          />
          <CreditCalculator packs={calculatorPacks} signedIn={signedIn} />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-20 px-4 py-20 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeader
              align="start"
              eyebrow="Money questions"
              title="No fine print,"
              accent="just print."
            />
          </div>
          <FaqList className="border-t">
            {PRICING_FAQS.map((faq, index) => (
              <FaqItem key={faq.id} question={faq.question} open={index === 0}>
                {faq.body ?? faq.answer}
              </FaqItem>
            ))}
          </FaqList>
        </div>
      </section>
    </>
  )
}

import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckmarkBadge01Icon, InfoIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { PriceCard } from "@/components/price-card"
import BuyButton from "@/components/dashboard/buy-button"
import UpgradeButton from "@/components/dashboard/upgrade-button"
import CheckoutBanner from "@/components/dashboard/checkout-banner"
import PostCheckoutStrip from "@/components/dashboard/post-checkout-strip"
import PaymentFlag from "@/components/dashboard/payment-flag"
import ClearPlanCookie from "@/components/dashboard/clear-plan-cookie"
import { PENDING_PLAN_COOKIE } from "@/components/public/plan-cookie"
import { getMeServer, apiServer } from "@/lib/api-server"
import { ApiError, type Pack, type PlanInfo } from "@/lib/api"
import {
  CURRENCY_SYMBOL,
  PRO_LIMITS,
  creditPackBenefits,
  proBenefits,
} from "@/lib/site"

export const dynamic = "force-dynamic"

function UsageBar({
  label,
  used,
  max,
}: {
  label: string
  used: number
  max: number
}) {
  const percent = max > 0 ? Math.min(100, (used / max) * 100) : 100
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-sm">
          {used} <span className="text-muted-foreground">of {max}</span>
        </p>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden bg-muted"
        role="progressbar"
        aria-valuenow={used}
        aria-valuemax={max}
        aria-label={`${label}: ${used} of ${max} used`}
      >
        <span
          className="block h-full bg-primary transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ paid?: string; canceled?: string; plan?: string }>
}) {
  const user = await getMeServer().catch(() => null)
  if (!user) redirect("/auth")

  const params = await searchParams
  const pendingPlan = (await cookies()).get(PENDING_PLAN_COOKIE)?.value ?? null
  let packs: Pack[] = []
  let plan: PlanInfo | null = null
  try {
    ;[packs, plan] = await Promise.all([
      apiServer<Pack[]>("/api/v1/packs"),
      apiServer<PlanInfo>("/api/v1/plan"),
    ])
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/auth")
    throw error
  }
  const highlightSlug = params.plan ?? pendingPlan
  const isPro = plan?.tier === "pro"
  const singleRate = packs.length
    ? Math.max(...packs.map((p) => p.price_minor / 100 / p.credits))
    : 0.5

  return (
    <>
      {pendingPlan ? <ClearPlanCookie /> : null}
      <section className="px-4">
        <div className="mx-auto max-w-7xl space-y-6">
          <Suspense fallback={null}>
            <PaymentFlag keepPaid />
          </Suspense>
          {params.paid ? <CheckoutBanner kind="success" /> : null}
          {params.canceled ? <CheckoutBanner kind="canceled" /> : null}
          {params.paid ? <PostCheckoutStrip /> : null}

          {plan ? (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="border p-5">
                <p className="text-sm text-muted-foreground">Plan</p>
                <p className="font-heading text-3xl font-semibold">
                  {plan.title}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isPro
                    ? "Renews monthly. Cancel any time."
                    : "Free forever. Upgrade when you outgrow it."}
                </p>
              </div>
              <div className="border p-5 md:col-span-2">
                <p className="mb-3 text-sm text-muted-foreground">This month</p>
                <div className="space-y-3">
                  <UsageBar
                    label="Searches"
                    used={plan.used_searches}
                    max={plan.max_searches}
                  />
                  <UsageBar
                    label="Sandboxes"
                    used={plan.used_sandboxes}
                    max={plan.max_sandboxes}
                  />
                  <UsageBar
                    label="Idea runs today"
                    used={plan.used_generation_runs}
                    max={plan.max_generation_runs}
                  />
                </div>
              </div>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="border p-5">
              <p className="text-sm text-muted-foreground">Credits</p>
              <p className="font-heading text-4xl font-semibold">
                {user.credits}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Spend on research, extra searches, and re-checks.
              </p>
            </div>
            <div className="border p-5">
              <p className="text-sm text-muted-foreground">
                Searches left this month
              </p>
              <p className="font-heading text-4xl font-semibold">
                {plan ? Math.max(0, plan.max_searches - plan.used_searches) : 0}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Refills on the first of the month.
              </p>
            </div>
          </div>

          {!isPro && plan ? (
            /* The one place billing gets the boiling aura: the upsell
               borrows the hero prompter's sanctioned flourish, at low
               opacity behind glass so the offer stays readable. The
               blobs stop under prefers-reduced-motion like everywhere
               else. */
            <div className="relative overflow-hidden border border-primary">
              <div aria-hidden className="prompter-aura opacity-50">
                <span className="prompter-blob prompter-blob-violet" />
                <span className="prompter-blob prompter-blob-amber" />
              </div>
              <div className="relative grid gap-6 bg-card/80 p-6 backdrop-blur-sm md:grid-cols-2 md:items-center">
                <div className="space-y-2 self-start">
                  <p className="text-[0.625rem] font-semibold tracking-widest text-primary uppercase">
                    Most capable
                  </p>
                  <p className="font-heading text-3xl font-semibold">Pro</p>
                  <p className="flex items-baseline gap-2">
                    <span className="font-heading text-5xl font-semibold">
                      $14.99
                    </span>
                    <span className="font-mono text-sm text-muted-foreground">
                      per month
                    </span>
                  </p>
                  <p className="max-w-prose text-sm text-muted-foreground">
                    For the person who has stopped browsing and started
                    building.
                  </p>
                </div>
                <div className="space-y-4">
                  <ul className="space-y-1.5 text-sm">
                    {/* The Pro tier's real numbers, not the current
                        plan's: this card is the upsell, and showing the
                        free limits under a Pro heading sells the wrong
                        thing. */}
                    {proBenefits(PRO_LIMITS).map((benefit) => (
                      <li
                        key={benefit}
                        className="flex items-center gap-2 text-muted-foreground"
                      >
                        <HugeiconsIcon
                          icon={CheckmarkBadge01Icon}
                          size={20}
                          className="text-primary"
                        />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                  <UpgradeButton className="w-full" />
                </div>
              </div>
            </div>
          ) : null}

          <div>
            <p className="mb-3 font-heading text-xl font-semibold">
              Top up with credits
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {packs.map((pack) => {
                const perCredit = pack.price_minor / 100 / pack.credits
                return (
                  <PriceCard
                    key={pack.slug}
                    title={pack.title}
                    label={`${CURRENCY_SYMBOL}${perCredit.toFixed(2)} per credit.`}
                    price={{
                      currency: CURRENCY_SYMBOL,
                      amount: pack.price_minor / 100,
                    }}
                    benefits={creditPackBenefits(pack.credits)}
                    discountage={
                      perCredit < singleRate
                        ? Math.round((1 - perCredit / singleRate) * 100)
                        : undefined
                    }
                    highlight={highlightSlug === pack.slug}
                    action={
                      <BuyButton
                        packSlug={pack.slug}
                        label={
                          highlightSlug === pack.slug
                            ? "Continue to secure checkout"
                            : `Buy ${pack.title}`
                        }
                      />
                    }
                  />
                )
              })}
            </div>
          </div>

          <Alert className="bg-secondary">
            <HugeiconsIcon icon={InfoIcon} size={48} />
            <AlertDescription>
              Credits never expire and sit on top of your plan. A search beyond
              your monthly allowance draws from credits, so running out of plan
              never blocks you while credits last.
            </AlertDescription>
          </Alert>
        </div>
      </section>
    </>
  )
}

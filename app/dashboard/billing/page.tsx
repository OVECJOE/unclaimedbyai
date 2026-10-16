import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { PriceCard } from "@/components/price-card"
import BuyButton from "@/components/dashboard/buy-button"
import CheckoutBanner from "@/components/dashboard/checkout-banner"
import PostCheckoutStrip from "@/components/dashboard/post-checkout-strip"
import PaymentFlag from "@/components/dashboard/payment-flag"
import ClearPlanCookie from "@/components/dashboard/clear-plan-cookie"
import { PENDING_PLAN_COOKIE } from "@/components/public/plan-cookie"
import { getMeServer, apiServer } from "@/lib/api-server"
import { ApiError, type Pack } from "@/lib/api"
import { CURRENCY_SYMBOL, planBenefits } from "@/lib/site"

export const dynamic = "force-dynamic"

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
  try {
    packs = await apiServer<Pack[]>("/api/v1/packs")
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/auth")
    throw error
  }
  const single = packs.find((pack) => pack.reports === 1)
  const highlightSlug = params.plan ?? pendingPlan
  const planPack = packs.find((pack) => pack.slug === highlightSlug)

  return (
    <>
      {pendingPlan ? <ClearPlanCookie /> : null}
      <section className="px-4">
        <div className="mx-auto max-w-7xl space-y-4">
          <Suspense fallback={null}>
            <PaymentFlag keepPaid />
          </Suspense>
          {params.paid ? <CheckoutBanner kind="success" /> : null}
          {params.canceled ? <CheckoutBanner kind="canceled" /> : null}
          {params.paid ? <PostCheckoutStrip /> : null}
          {planPack ? (
            <Alert className="bg-secondary">
              <AlertDescription>
                You chose the {planPack.title} before signing in. Continue to
                secure checkout whenever you are ready, or pick a different
                pack below.
              </AlertDescription>
            </Alert>
          ) : null}
          {user.credits === 0 && user.searches_left === 0 ? (
            <Alert className="border border-dashed">
              <AlertDescription>
                You are out of both reports and searches. Every pack below
                restores both at once, and checkout takes about a minute.
              </AlertDescription>
            </Alert>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="border p-5">
              <p className="text-sm text-muted-foreground">Searches left</p>
              <p className="font-heading text-4xl font-semibold">
                {user.searches_left}
              </p>
            </div>
            <div className="border p-5">
              <p className="text-sm text-muted-foreground">Report credits</p>
              <p className="font-heading text-4xl font-semibold">
                {user.credits}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {packs.map((pack) => {
              const perReport = pack.price_minor / 100 / pack.reports
              const singleRate = single ? single.price_minor / 100 : perReport
              return (
                <PriceCard
                  key={pack.slug}
                  title={pack.title}
                  label={`${CURRENCY_SYMBOL}${perReport.toFixed(2)} per report.`}
                  price={{
                    currency: CURRENCY_SYMBOL,
                    amount: pack.price_minor / 100,
                  }}
                  benefits={planBenefits(pack.reports)}
                  discountage={
                    single && perReport < singleRate
                      ? Math.round((1 - perReport / singleRate) * 100)
                      : undefined
                  }
                  highlight={highlightSlug === pack.slug}
                  action={
                    <div className="space-y-1.5">
                      {pack.slug === "five" ? (
                        <p className="text-center text-[0.625rem] font-semibold tracking-widest text-primary uppercase">
                          Most popular
                        </p>
                      ) : null}
                      <BuyButton
                        packSlug={pack.slug}
                        label={
                          highlightSlug === pack.slug
                            ? "Continue to secure checkout"
                            : `Buy ${pack.title}`
                        }
                      />
                    </div>
                  }
                />
              )
            })}
          </div>
          <Alert className="bg-secondary">
            <HugeiconsIcon icon={InfoIcon} size={48} />
            <AlertDescription>
              Reports are one-off purchases through secure checkout, with no
              subscriptions and no stored cards. A report costs less than the
              domain you are about to register.
            </AlertDescription>
          </Alert>
        </div>
      </section>
    </>
  )
}

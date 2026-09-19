import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { totalSpent } from "@/lib/billing"
import { headers } from "next/headers"
import { cn } from "@/lib/utils"

export default async function BillingLayout({
  children
}: {
  children: React.ReactNode
  }) {
  const pathname = (await headers()).get("x-pathname")
  const activeTab = pathname === "/dashboard/billing/history" ? "history" : "payment-methods"

  return (
    <>
      <section className="px-4 py-10">
        <div className="mx-auto max-w-7xl space-y-5">
          <div className="space-y-2">
            <h1 className="font-heading text-4xl font-semibold md:text-5xl">
              Billing
            </h1>
            <p className="text-sm text-muted-foreground">
              Total spent:{" "}
              <span className="font-mono font-semibold text-primary">
                ${totalSpent}
              </span>
            </p>
          </div>
          <Tabs defaultValue={activeTab}>
            <div>
              <TabsList variant="line">
                <TabsTrigger value="payment-methods" asChild>
                  <Link href="/dashboard/billing">Payment Methods</Link>
                </TabsTrigger>
                <TabsTrigger value="history" asChild>
                  <Link href="/dashboard/billing/history">History</Link>
                </TabsTrigger>
              </TabsList>
            </div>
          </Tabs>
        </div>
      </section>
      {children}
    </>
  )
}

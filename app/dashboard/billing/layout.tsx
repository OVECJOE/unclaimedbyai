import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { headers } from "next/headers"
import { getMeServer, apiServer } from "@/lib/api-server"
import type { OrderItem } from "@/lib/api"

export default async function BillingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = (await headers()).get("x-pathname")
  const activeTab =
    pathname === "/dashboard/billing/history" ? "history" : "overview"

  let totalSpent = 0
  const user = await getMeServer().catch(() => null)
  if (user) {
    try {
      const orders = await apiServer<OrderItem[]>("/api/v1/orders")
      totalSpent = orders
        .filter((order) => order.status === "paid")
        .reduce((sum, order) => sum + order.amount_minor / 100, 0)
    } catch {
      totalSpent = 0
    }
  }

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
                ${totalSpent.toFixed(2)}
              </span>
            </p>
          </div>
          <Tabs defaultValue={activeTab}>
            <div>
              <TabsList variant="line" className="w-full border-b">
                <TabsTrigger value="overview" asChild>
                  <Link href="/dashboard/billing">Overview</Link>
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

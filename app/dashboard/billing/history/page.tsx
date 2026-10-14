import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDateTime } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { PaginationWindow } from "@/components/ui/pagination-window"
import { ITEMS_PER_PAGE } from "@/lib/constants"
import { clampPage } from "@/lib/pagination"
import { redirect } from "next/navigation"
import { ApiError, type OrderItem } from "@/lib/api"
import { apiServer } from "@/lib/api-server"

export const dynamic = "force-dynamic"

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>
}) {
  const { page } = await searchParams
  const requested = Number.parseInt(page ?? "", 10)
  const parsed = Number.isNaN(requested) ? 1 : requested

  let orders: OrderItem[]
  try {
    orders = await apiServer<OrderItem[]>("/api/v1/orders")
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/auth")
    throw error
  }

  const pageCount = Math.max(1, Math.ceil(orders.length / ITEMS_PER_PAGE))
  const currentPage = clampPage(parsed, pageCount)
  const start = (currentPage - 1) * ITEMS_PER_PAGE
  const currentOrders = orders.slice(start, start + ITEMS_PER_PAGE)

  return (
    <section className="px-4">
      <div className="mx-auto max-w-7xl space-y-4">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Pack</TableHead>
              <TableHead className="hidden sm:table-cell">Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {currentOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <div className="space-y-1">
                    <p className="text-md font-semibold">
                      {order.reports} report{order.reports === 1 ? "" : "s"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      +{order.searches} searches
                    </p>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <span className="text-xs font-medium italic">
                    {formatDateTime(order.paid_at ?? order.created_at)}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Badge
                      className={
                        order.status === "paid"
                          ? "bg-green-600/10 text-green-700 dark:bg-green-400/10 dark:text-green-400"
                          : "bg-amber-500/10 text-amber-700 dark:bg-amber-400/10 dark:text-amber-500"
                      }
                    >
                      {order.status}
                    </Badge>
                    {order.receipt_url ? (
                      <a
                        href={order.receipt_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-xs text-primary underline"
                      >
                        Receipt
                      </a>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-heading text-lg font-bold">
                    {order.currency} {(order.amount_minor / 100).toFixed(2)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {orders.length === 0 ? (
          <p className="text-muted-foreground">
            No purchases yet. Packs you buy will show up here.
          </p>
        ) : null}
        <div className="mt-4 mb-8">
          <PaginationWindow
            currentPage={currentPage}
            pageCount={pageCount}
            basePath="/dashboard/billing/history"
          />
        </div>
      </div>
    </section>
  )
}

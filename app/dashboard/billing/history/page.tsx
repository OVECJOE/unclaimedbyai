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
import { ApiError, type Ledger, type OrderItem } from "@/lib/api"
import { apiServer } from "@/lib/api-server"

export const dynamic = "force-dynamic"

const REASON_LABELS: Record<string, string> = {
  signup_grant: "Welcome credits",
  purchase: "Credit pack purchase",
  search_created: "Search",
  recheck: "Re-check",
  refund: "Refund — that one didn't go through",
  adjustment: "Adjustment",
  legacy_conversion: "Converted balance",
}

const UNIT_LABELS: Record<string, string> = {
  credit: "credits",
  search: "search",
  generation_run: "idea run",
  report: "report",
}

const LEDGER_SHOWN = 25

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>
}) {
  const { page } = await searchParams
  const requested = Number.parseInt(page ?? "", 10)
  const parsed = Number.isNaN(requested) ? 1 : requested

  let orders: OrderItem[]
  let ledger: Ledger | null
  try {
    ;[orders, ledger] = await Promise.all([
      apiServer<OrderItem[]>("/api/v1/orders"),
      apiServer<Ledger>("/api/v1/me/ledger").catch(() => null),
    ])
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
                      {order.credits} credit{order.credits === 1 ? "" : "s"}
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

        {ledger && ledger.items.length > 0 ? (
          <div className="mt-8 space-y-3 border-t pt-6 mb-8">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-heading text-xl font-semibold">
                Credit history
              </h2>
              <p className="text-xs text-muted-foreground">
                Balance right now:{" "}
                <strong className="font-mono text-sm text-foreground">
                  {ledger.balance}
                </strong>{" "}
                credits
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Every grant and spend, newest first — the balance always has a
              reason here.
            </p>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Movement</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="text-right">Change</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledger.items.slice(0, LEDGER_SHOWN).map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <span className="text-sm font-medium">
                        {REASON_LABELS[entry.reason] ?? entry.reason}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-xs font-medium italic">
                        {formatDateTime(entry.created_at)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      <span
                        className={
                          entry.delta > 0
                            ? "text-green-700 dark:text-green-400"
                            : "text-muted-foreground"
                        }
                      >
                        {entry.delta > 0 ? `+${entry.delta}` : entry.delta}{" "}
                        {UNIT_LABELS[entry.unit] ?? entry.unit}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {entry.balance_after !== null ? entry.balance_after : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {ledger.items.length > LEDGER_SHOWN ? (
              <p className="text-xs text-muted-foreground">
                Showing the {LEDGER_SHOWN} most recent of{" "}
                {ledger.items.length} movements.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  )
}

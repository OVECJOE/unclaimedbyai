import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DownloadIcon, RefreshIcon } from "@hugeicons/core-free-icons"
import { transactions } from "@/lib/billing"
import { formatDateTime } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@/components/ui/button"
import { tierColor } from "@/lib/name-results"

export default function HistoryPage() {
  return (
    <section className="px-4">
      <div className="mx-auto max-w-7xl space-y-4">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Name/Query</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <div className="space-y-1">
                    <p
                      className={cn("text-md font-semibold", {
                        "text-muted-foreground":
                          transaction.status === "Failed",
                      })}
                    >
                      {transaction.name}
                    </p>
                    <p
                      className={cn("text-muted-foreground text-xs", {
                        "font-light": transaction.status === "Failed",
                      })}
                    >
                      {transaction.query}
                    </p>
                  </div>
                </TableCell>
                <TableCell><span className="text-xs font-medium italic">{formatDateTime(transaction.purchasedAt)}</span></TableCell>
                <TableCell>
                  <Badge
                    className={cn({
                      [tierColor("Excellent")]:
                        transaction.status === "Completed",
                      [tierColor("Poor")]: transaction.status === "Failed",
                    })}
                  >
                    {transaction.status}
                  </Badge>
                </TableCell>
                <TableCell><span className="font-bold font-heading text-lg">${transaction.amount}</span></TableCell>
                <TableCell className="text-center">
                  {transaction.status === "Completed" ? (
                    <Button variant="ghost" asChild>
                      <Link href={transaction.downloadUrl!}>
                        <HugeiconsIcon
                          icon={DownloadIcon}
                          aria-label="Download"
                          size={24}
                          className="mx-auto text-destructive"
                        />
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="ghost">
                      <HugeiconsIcon
                        icon={RefreshIcon}
                        aria-label="Refresh"
                        size={24}
                        className="mx-auto text-primary"
                      />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}

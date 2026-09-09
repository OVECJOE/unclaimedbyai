import {
  Card,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardAction,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckmarkBadgeIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type PriceCardProps = {
  price: {
    currency: string
    amount: number
  }
  title: string
  label: string
  benefits: string[]
  discountage?: number
}

export function PriceCard({ price, title, label, benefits, discountage }: PriceCardProps) {
  return (
    <Card className={cn(
      "text-start [--card-spacing:--spacing(5)] relative",
      discountage && "border border-primary/70 bg-primary/5"
    )}>
      {discountage && <Badge className="text-xs absolute bg-primary/10 text-primary p-2 right-3.5 top-3.5">Save {discountage}%</Badge>}
      <CardHeader className="space-y-1">
        <p className="text-base">{title}</p>
        <CardTitle className="text-4xl">
          {price.currency}
          {price.amount}
        </CardTitle>
        <CardDescription>{label}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul>
          {benefits.map((benefit, index) => (
            <li key={index} className="flex items-center gap-1">
              <HugeiconsIcon
                icon={CheckmarkBadgeIcon}
                className="text-primary"
              />
              {benefit}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <CardAction className="w-full">
          <Button size="lg" asChild className="w-full">
            <Link href="/auth">Get Started</Link>
          </Button>
        </CardAction>
      </CardFooter>
    </Card>
  )
}

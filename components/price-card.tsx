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
  highlight?: boolean
  action?: React.ReactNode
}

export function PriceCard({
  price,
  title,
  label,
  benefits,
  discountage,
  highlight,
  action,
}: PriceCardProps) {
  return (
    <Card
      className={cn(
        "relative text-start [--card-spacing:--spacing(5)]",
        discountage && "border border-primary/70 bg-primary/5",
        highlight && "border-2 border-primary"
      )}
    >
      <div className="absolute top-3.5 right-3.5 flex gap-1">
        {highlight && (
          <Badge className="bg-primary p-2 text-xs text-primary-foreground">
            Your pick
          </Badge>
        )}
        {discountage && (
          <Badge className="bg-primary/10 p-2 text-xs text-primary">
            Save {discountage}%
          </Badge>
        )}
      </div>
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
          {action ?? (
            <Button size="lg" asChild className="w-full">
              <Link href="/auth">Get Started</Link>
            </Button>
          )}
        </CardAction>
      </CardFooter>
    </Card>
  )
}

import { Card, CardContent } from "@/components/ui/card"
import { BankIcon, CreditCardIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { PaddedText } from "@/components/public/padded-text"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type PaymentMethodCardProps = {
  method: "card" | "bank"
  cardDetails?: {
    last4: string
    expiryDate: string
    cardType: string
  }
  bankDetails?: {
    bankName: string
    accountNumber: string
    routingNumber?: string
  }
  isPrimary?: boolean
}

export default function PaymentMethodCard({
  method,
  cardDetails,
  bankDetails,
  isPrimary,
}: PaymentMethodCardProps) {
  return (
    <Card size="sm" className={cn({ "border border-dashed border-primary/50 bg-primary/10": isPrimary })}>
      <CardContent>
        {method === "card" && cardDetails && (
          <div className="flex items-center gap-5">
            <HugeiconsIcon icon={CreditCardIcon} className={cn({ "text-primary": isPrimary })} />
            <div className="flex flex-1 items-center justify-between gap-5">
              <div>
                <h5 className="flex items-center gap-2 font-heading text-lg font-semibold md:text-xl">
                  {cardDetails?.cardType}{" "}
                  <PaddedText count={4} suffix={cardDetails?.last4} />
                </h5>
                <p className="text-xs text-muted-foreground">
                  Expires {cardDetails?.expiryDate}
                </p>
              </div>
              {isPrimary && <Badge variant="destructive" className="text-sm md:text-md">Primary</Badge>}
            </div>
          </div>
        )}
        {method === "bank" && bankDetails && (
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={BankIcon} />
            <div className="flex flex-1 items-center justify-between gap-5">
              <div>
                <h5 className="font-heading text-lg font-semibold md:text-xl">
                  {bankDetails?.bankName}
                </h5>
                <p className="text-xs text-muted-foreground">
                  Account {bankDetails?.accountNumber}
                </p>
              </div>
              {isPrimary && <Badge variant="destructive">Default</Badge>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

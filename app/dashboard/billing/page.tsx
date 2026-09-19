import PaymentMethodCard from "@/components/dashboard/payment-method-card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { paymentMethods } from "@/lib/billing"
import { AddIcon, InfoIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"

export default function BillingPage() {
  return (
    <>
      <section className="px-4">
        <div className="mx-auto max-w-7xl space-y-4">
          {paymentMethods.map((method) => (
            <PaymentMethodCard
              key={method.id}
              method="card"
              cardDetails={{
                cardType: method.brand,
                expiryDate: `${method.expMonth}/${method.expYear}`,
                last4: method.last4,
              }}
              isPrimary={method.isDefault}
            />
          ))}
          <Button variant="link" asChild className="p-0">
            <Link href="/dashboard/billing?mode=add">
              <HugeiconsIcon icon={AddIcon} /> Add Payment Method
            </Link>
          </Button>
          <Alert className="bg-secondary">
            <HugeiconsIcon icon={InfoIcon} size={48} />
            <AlertDescription>
              Reports are charged to your default card the moment you buy one — no separate checkout step.
            </AlertDescription>
          </Alert>
        </div>
      </section>
    </>
  )
}

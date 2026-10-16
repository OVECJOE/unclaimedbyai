import Link from "next/link"
import { affiliateLink } from "@/lib/affiliate"

/**
 * The register-it moment, immediately after a purchase.
 *
 * Checkout returns to the billing page with a `paid` param, and this strip
 * renders directly beneath the confirmation, while the visitor is still in
 * the frame of mind that just spent money on naming. It is deliberately not
 * an interruption before checkout, and it names no particular domain, because
 * the redirect back from Stripe only carries that a purchase happened, not
 * which name it was for. The claim it makes is the honest one: the report is
 * useless until the domain is registered, and this is where you do that.
 *
 * `PaymentFlag` leaves the `paid` param alone on this page, so the strip and
 * the banner stay until the visitor navigates away or refreshes. That is
 * intended: a payment confirmation should not evaporate mid-read.
 */
export default function PostCheckoutStrip() {
  const href = affiliateLink("namecheap", "post-checkout")
  if (!href) return null

  return (
    <div className="space-y-1 border p-4 text-center sm:p-5">
      <p className="font-heading text-xl font-semibold">
        One thing founders do next
      </p>
      <p className="mx-auto max-w-prose text-sm text-muted-foreground">
        The name you just bought reports for is only yours once the domain is
        registered, and extensions people wait on get taken.{" "}
        <a
          href={href}
          target="_blank"
          rel="sponsored noopener noreferrer"
          className="text-primary underline"
        >
          Register it at Namecheap
        </a>
        , or{" "}
        <Link href="/dashboard" className="text-primary underline">
          run another check
        </Link>
        .
      </p>
      <p className="text-xs text-muted-foreground">
        We may earn a commission if you register through that link. The price
        is the same either way.
      </p>
    </div>
  )
}

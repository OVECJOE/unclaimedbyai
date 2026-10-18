"use client"

import { useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

/**
 * Checkout can return to any page through return_to, so payment results
 * announce themselves with a toast wherever they land, and the flag
 * params are stripped so a refresh or back button never replays them.
 *
 * The billing page passes `keepPaid`: it renders the payment result as a
 * durable surface (banner + strip) from the same params, so this
 * component stays out of the way entirely there — toasting and stripping
 * would only fight the page that is already showing the result.
 */
export default function PaymentFlag({
  keepPaid = false,
}: {
  keepPaid?: boolean
}) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const paid = searchParams.get("paid")
  const canceled = searchParams.get("canceled")

  useEffect(() => {
    if (keepPaid) return
    if (paid) {
      toast.success("Payment received. Your credits are on the account.")
    } else if (canceled) {
      toast.warning("Checkout was canceled. No charge was made.")
    }
    if (paid || canceled) {
      const params = new URLSearchParams(window.location.search)
      params.delete("paid")
      params.delete("canceled")
      const query = params.toString()
      window.history.replaceState(
        null,
        "",
        `${pathname}${query ? `?${query}` : ""}`
      )
      router.refresh()
    }
  }, [keepPaid, paid, canceled, router, pathname])

  return null
}

"use client"

import { useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

/**
 * Checkout can return to any page through return_to, so payment results
 * announce themselves with a toast wherever they land, and the flag
 * params are stripped so a refresh or back button never replays them.
 *
 * The billing page passes `keepPaid`, because it renders the payment
 * result as a durable surface instead of a toast. Stripping `paid` there
 * would destroy that surface during the same mount that should show it.
 */
export default function PaymentFlag({
  keepPaid = false,
}: {
  keepPaid?: boolean
}) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const paid = keepPaid ? null : searchParams.get("paid")
  const canceled = searchParams.get("canceled")

  useEffect(() => {
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
  }, [paid, canceled, router, pathname])

  return null
}

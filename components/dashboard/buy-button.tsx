"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createCheckout } from "@/lib/api"
import { toastApiError } from "@/lib/api-errors"

export default function BuyButton({
  packSlug,
  label = "Buy",
}: {
  packSlug: string
  label?: string
}) {
  const [pending, setPending] = useState(false)

  async function buy() {
    setPending(true)
    try {
      const { checkout_url } = await createCheckout(packSlug)
      window.location.href = checkout_url
    } catch (err) {
      setPending(false)
      toastApiError(err, "Checkout failed. Try again.")
    }
  }

  return (
    <Button
      size="lg"
      className="w-full"
      disabled={pending}
      onClick={() => void buy()}
    >
      {pending ? "Redirecting…" : label}
    </Button>
  )
}

"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ApiError, createCheckout } from "@/lib/api"

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
      toast.error(
        err instanceof ApiError ? err.message : "Checkout failed. Try again."
      )
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

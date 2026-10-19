"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createCheckout, listPacks, type Pack } from "@/lib/api"
import { toastApiError } from "@/lib/api-errors"
import { CURRENCY_SYMBOL } from "@/lib/site"

/**
 * The moment someone tries to spend and cannot. This dialog only opens
 * when a 402 interrupts an action they just took, so it answers a
 * question they asked with their own click instead of advertising at
 * them, and checkout returns to the exact page they were on.
 */
export default function ShortageDialog({
  open,
  kind,
  onOpenChange,
}: {
  open: boolean
  kind: "credits" | "searches"
  onOpenChange: (open: boolean) => void
}) {
  const [pack, setPack] = useState<Pack | null>(null)
  const [failed, setFailed] = useState(false)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (!open || pack || failed) return
    let cancelled = false
    listPacks()
      .then((packs) => {
        if (cancelled) return
        // The smallest pack is the right default here: the least
        // commitment at a moment of friction, and it exists whatever
        // the slugs are called.
        const pick =
          [...packs].sort((a, b) => a.price_minor - b.price_minor)[0] ?? null
        setPack(pick)
        if (!pick) setFailed(true)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [open, pack, failed])

  const perCredit =
    pack && pack.credits > 0 ? pack.price_minor / 100 / pack.credits : null

  async function buy() {
    if (!pack) return
    setPending(true)
    try {
      const { checkout_url } = await createCheckout(
        pack.slug,
        `${window.location.pathname}${window.location.search}`
      )
      window.location.href = checkout_url
    } catch (error) {
      setPending(false)
      toastApiError(error, "Checkout could not start. Try again.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {kind === "credits"
              ? "You are out of credits"
              : "You are out of searches"}
          </DialogTitle>
          <DialogDescription>
            {kind === "credits"
              ? "Re-checks cost one credit each, which is how availability stays fresh as names get claimed while you decide."
              : "Searches are what turn a brief into fresh name candidates, and every account starts with a few."}
            {pack && perCredit !== null
              ? ` The ${pack.title} brings every credit to ${CURRENCY_SYMBOL}${perCredit.toFixed(
                  2
                )}, and checkout drops you right back here.`
              : ""}
          </DialogDescription>
        </DialogHeader>
        {failed ? (
          <p className="text-sm text-muted-foreground">
            We could not load pack prices right now. Visit the billing page when
            you are ready to top up.
          </p>
        ) : null}
        <DialogFooter>
          <Button
            variant="outline"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            Not now
          </Button>
          <Button disabled={!pack || pending} onClick={() => void buy()}>
            {pending ? "Redirecting…" : "Continue to checkout"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

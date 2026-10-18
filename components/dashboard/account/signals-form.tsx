"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { saveSignalProfile, type SignalProfile } from "@/lib/api"
import { toastApiError } from "@/lib/api-errors"
import SignalFields from "@/components/playground/signal-fields"

/**
 * The account steer: the eight signals new sandboxes copy. Per-sandbox
 * overrides live on the sandbox itself, in the canvas, so this editor
 * only ever writes the profile and says so.
 */
export default function SignalsForm({
  initial,
  loadFailed = false,
}: {
  initial: SignalProfile | null
  loadFailed?: boolean
}) {
  const [signals, setSignals] = useState<Partial<SignalProfile>>(initial ?? {})
  const [pending, setPending] = useState(false)

  async function save(event: React.FormEvent) {
    event.preventDefault()
    setPending(true)
    try {
      await saveSignalProfile(signals)
      toast("Steer saved. New sandboxes will use it.")
    } catch (error) {
      toastApiError(error, "Could not save the steer.")
    } finally {
      setPending(false)
    }
  }

  if (loadFailed) {
    return (
      <div
        className="max-w-3xl space-y-4 border border-dashed p-6"
        role="alert"
      >
        <h2 className="font-heading text-2xl font-semibold">
          Your steer could not load
        </h2>
        <p className="text-sm text-muted-foreground">
          We&apos;d rather show you this than empty fields you might save over
          your real answers. Reload the page to try again.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => window.location.reload()}
        >
          Reload
        </Button>
      </div>
    )
  }

  const filled = Object.values(signals).some(Boolean)

  return (
    <form onSubmit={save} className="max-w-3xl space-y-5">
      <div className="space-y-2">
        <h2 className="font-heading text-2xl font-semibold">Idea steer</h2>
        <p className="text-sm text-muted-foreground">
          {filled
            ? "The default for new sandboxes. A sandbox can override any of these without changing the account answer."
            : "Your steer is empty, so generated ideas run on each brief alone. Eight answers make them sharper."}
        </p>
      </div>
      <SignalFields signals={signals} onChange={setSignals} expanded />
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save steer"}
      </Button>
    </form>
  )
}

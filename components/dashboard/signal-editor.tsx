"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { saveSignalProfile, type SignalProfile } from "@/lib/api"
import { toastApiError } from "@/lib/api-errors"

const FIELDS: { key: keyof SignalProfile; label: string; placeholder: string }[] =
  [
    { key: "skills", label: "Skills", placeholder: "Baking, sales, analysis" },
    {
      key: "industries",
      label: "Industries you know",
      placeholder: "Logistics, healthcare",
    },
    { key: "audience", label: "People you can reach", placeholder: "A list" },
    {
      key: "target_customer",
      label: "Who you would serve",
      placeholder: "Therapists, small farms",
    },
  ]

/**
 * The account-wide steer, which a new sandbox copies. Editing it here
 * changes the default rather than rewriting existing sandboxes, so a
 * sandbox keeps the steer it was created with.
 */
export default function SignalEditor({
  signals,
  onSaved,
}: {
  signals: Partial<SignalProfile>
  onSaved: () => void | Promise<unknown>
}) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    for (const field of FIELDS) {
      initial[field.key] = signals[field.key] ?? ""
    }
    return initial
  })

  async function save() {
    setPending(true)
    try {
      await saveSignalProfile(values as Partial<SignalProfile>)
      toast("Steer saved. New sandboxes will use it.")
      await onSaved()
      setOpen(false)
    } catch (error) {
      toastApiError(error, "Could not save the steer.")
    } finally {
      setPending(false)
    }
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Edit account steer
      </Button>
    )
  }

  return (
    <div className="border p-5">
      <p className="font-heading text-lg font-semibold">Account steer</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Used as the default for new sandboxes. A sandbox keeps whatever it
        was created with, so changing this does not rewrite the past.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {FIELDS.map((field) => (
          <div key={field.key} className="space-y-1.5">
            <Label htmlFor={`sig-${field.key}`}>{field.label}</Label>
            <Input
              id={`sig-${field.key}`}
              value={values[field.key] ?? ""}
              placeholder={field.placeholder}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  [field.key]: event.target.value,
                }))
              }
            />
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Answering more of these makes generated ideas sharper.
      </p>
      <div className="mt-3 flex gap-2">
        <Button disabled={pending} onClick={() => void save()}>
          {pending ? "Saving..." : "Save steer"}
        </Button>
        <Button variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

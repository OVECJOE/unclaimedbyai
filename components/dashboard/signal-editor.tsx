"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  saveSignalProfile,
  updateSandbox,
  type Sandbox,
  type SignalProfile,
} from "@/lib/api"
import { toastApiError } from "@/lib/api-errors"
import {
  SIGNAL_OPTIONS,
  SIGNAL_TEXT,
  signalLabel,
  signalSummary,
  type SignalOptionKey,
} from "@/lib/signals"

const CLEAR = "__inherit__"
const OPTION_KEYS = Object.keys(SIGNAL_OPTIONS) as SignalOptionKey[]
const TEXT_KEYS = SIGNAL_TEXT.map((field) => field.key)

/**
 * The account steer, and a sandbox's overrides on top of it.
 *
 * Account mode writes the profile, which new sandboxes copy. Sandbox mode
 * writes one sandbox's row, where an empty value means inherit rather
 * than blank, so clearing an override restores the account answer
 * instead of silently replacing it with nothing.
 */
export default function SignalEditor({
  sandbox,
  onSaved,
}: {
  sandbox: Sandbox
  onSaved: () => void | Promise<unknown>
}) {
  const [mode, setMode] = useState<"account" | "sandbox">("account")
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    for (const key of [...OPTION_KEYS, ...TEXT_KEYS]) {
      initial[key] = sandbox.signals[key] ?? ""
    }
    return initial
  })

  const inherited = signalSummary(sandbox.signals)

  function set(key: string, value: string) {
    setValues((current) => ({ ...current, [key]: value }))
  }

  async function save() {
    setPending(true)
    try {
      if (mode === "account") {
        await saveSignalProfile(values as Partial<SignalProfile>)
        toast("Steer saved. New sandboxes will use it.")
      } else {
        const overrides: Record<string, string> = {}
        for (const key of [...OPTION_KEYS, ...TEXT_KEYS]) {
          overrides[key] = values[key] === CLEAR ? "" : values[key]
        }
        await updateSandbox(sandbox.public_id, { signals: overrides })
        toast("Sandbox steer saved.")
      }
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
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          Edit sandbox steer
        </Button>
        {inherited ? (
          <p className="text-xs text-muted-foreground">{inherited}</p>
        ) : null}
      </div>
    )
  }

  return (
    <div className="border p-5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-heading text-lg font-semibold">Steer</p>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={mode === "sandbox" ? "default" : "ghost"}
            onClick={() => setMode("sandbox")}
          >
            This sandbox
          </Button>
          <Button
            size="sm"
            variant={mode === "account" ? "default" : "ghost"}
            onClick={() => setMode("account")}
          >
            Account default
          </Button>
        </div>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {mode === "account"
          ? "The default for new sandboxes. Existing sandboxes keep what they were created with."
          : "Overrides for this sandbox only. Choose Inherit to fall back to the account answer."}
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {SIGNAL_TEXT.map((field) => (
          <div key={field.key} className="space-y-1.5">
            <Label htmlFor={`sig-${field.key}`}>{field.label}</Label>
            <Input
              id={`sig-${field.key}`}
              value={values[field.key] ?? ""}
              placeholder={field.placeholder}
              onChange={(event) => set(field.key, event.target.value)}
            />
            {mode === "sandbox" ? (
              <p className="text-xs text-muted-foreground">
                Empty inherits the account answer.
              </p>
            ) : null}
          </div>
        ))}

        {OPTION_KEYS.map((key) => (
          <div key={key} className="space-y-1.5">
            <Label>{SIGNAL_OPTIONS[key].label}</Label>
            <Select
              value={values[key] || CLEAR}
              onValueChange={(value) => set(key, value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                {mode === "sandbox" ? (
                  <SelectItem value={CLEAR}>
                    Inherit
                    {signalLabel(key, sandbox.signals[key])
                      ? ` (${signalLabel(key, sandbox.signals[key])})`
                      : ""}
                  </SelectItem>
                ) : null}
                {SIGNAL_OPTIONS[key].options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

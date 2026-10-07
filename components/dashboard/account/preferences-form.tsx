"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { updatePreferences } from "@/app/dashboard/account/actions"
import type { Preferences } from "@/lib/api"

const ROWS = [
  {
    key: "report_ready",
    title: "Report ready",
    body: "When a check you started finishes running.",
  },
  {
    key: "payment_receipts",
    title: "Payment receipts",
    body: "Email a receipt after every purchase.",
  },
  {
    key: "product_updates",
    title: "Product updates",
    body: "Occasional emails about new features.",
  },
] as const

export default function PreferencesForm({ initial }: { initial: Preferences }) {
  const [prefs, setPrefs] = useState(initial)

  async function toggle(key: keyof Preferences, value: boolean) {
    const previous = prefs
    setPrefs({ ...prefs, [key]: value })
    try {
      const saved = await updatePreferences({ [key]: value })
      setPrefs(saved)
    } catch {
      setPrefs(previous)
      toast.error("Could not save that preference.")
    }
  }

  return (
    <div className="space-y-5">
      {ROWS.map((row) => (
        <div key={row.key} className="flex items-start justify-between gap-5">
          <div className="w-full space-y-0.5">
            <Label
              className="font-heading text-lg font-semibold"
              htmlFor={row.key}
            >
              {row.title}
            </Label>
            <p className="text-sm text-muted-foreground">{row.body}</p>
          </div>
          <Switch
            id={row.key}
            checked={prefs[row.key]}
            onCheckedChange={(value) => void toggle(row.key, value)}
          />
        </div>
      ))}
    </div>
  )
}

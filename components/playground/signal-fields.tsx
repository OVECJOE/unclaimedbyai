"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { SignalProfile } from "@/lib/api"
import { SIGNAL_OPTIONS, SIGNAL_TEXT } from "@/lib/signals"

// Radix shows a Select's placeholder only for the empty string or
// undefined, so an unset signal is controlled as "" rather than a
// sentinel value: a sentinel matches no item and the trigger renders
// with no label at all.
const UNSET = ""

// Radix portals the select's content to document.body, where two things
// work against it inside the intake dialog: the body sits at z-50 under
// the dialog's z-[60] panel, and the modal dialog has set body
// pointer-events to none, so the portaled list would render behind the
// dialog and swallow no clicks of its own. Lifting the z-index and
// re-enabling pointer events on the content fixes both; outside a
// dialog the additions are harmless.
const SELECT_CONTENT_CLASS = "z-[70] pointer-events-auto"

/**
 * The three intake questions, with the remaining five behind the
 * caller's expander. Used by the new-sandbox dialog and the studio
 * prompter mode, so both render the same fields with the same choice
 * sets.
 */
export default function SignalFields({
  signals,
  onChange,
  expanded,
}: {
  signals: Partial<SignalProfile>
  onChange: (next: Partial<SignalProfile>) => void
  expanded: boolean
}) {
  function setText(key: keyof SignalProfile, value: string) {
    onChange({ ...signals, [key]: value || undefined })
  }

  function setChoice(key: keyof SignalProfile, value: string) {
    onChange({ ...signals, [key]: value || undefined })
  }

  const [skills, time, model] = [
    SIGNAL_TEXT[0],
    SIGNAL_OPTIONS.time_available,
    SIGNAL_OPTIONS.business_model,
  ]

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="sig-skills">{skills.label}</Label>
          <Textarea
            id="sig-skills"
            value={signals.skills ?? ""}
            onChange={(event) => setText("skills", event.target.value)}
            placeholder={skills.placeholder}
            className="min-h-16"
          />
        </div>
        <div className="space-y-1.5">
          <Label>{time.label}</Label>
          <Select
            value={signals.time_available ?? UNSET}
            onValueChange={(value) => setChoice("time_available", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pick one" />
            </SelectTrigger>
            <SelectContent position="popper" className={SELECT_CONTENT_CLASS}>
              {time.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>{model.label}</Label>
          <Select
            value={signals.business_model ?? UNSET}
            onValueChange={(value) => setChoice("business_model", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pick one" />
            </SelectTrigger>
            <SelectContent position="popper" className={SELECT_CONTENT_CLASS}>
              {model.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {expanded ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>{SIGNAL_OPTIONS.tech_comfort.label}</Label>
            <Select
              value={signals.tech_comfort ?? UNSET}
              onValueChange={(value) => setChoice("tech_comfort", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pick one" />
              </SelectTrigger>
              <SelectContent position="popper" className={SELECT_CONTENT_CLASS}>
                {SIGNAL_OPTIONS.tech_comfort.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{SIGNAL_OPTIONS.budget.label}</Label>
            <Select
              value={signals.budget ?? UNSET}
              onValueChange={(value) => setChoice("budget", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pick one" />
              </SelectTrigger>
              <SelectContent position="popper" className={SELECT_CONTENT_CLASS}>
                {SIGNAL_OPTIONS.budget.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {SIGNAL_TEXT.slice(1).map((field) => (
            <div key={field.key} className="space-y-1.5">
              <Label htmlFor={`sig-${field.key}`}>{field.label}</Label>
              {field.key === "target_customer" ? (
                <Input
                  id={`sig-${field.key}`}
                  value={signals[field.key] ?? ""}
                  onChange={(event) => setText(field.key, event.target.value)}
                  placeholder={field.placeholder}
                />
              ) : (
                <Textarea
                  id={`sig-${field.key}`}
                  value={signals[field.key] ?? ""}
                  onChange={(event) => setText(field.key, event.target.value)}
                  placeholder={field.placeholder}
                  className="min-h-16"
                />
              )}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

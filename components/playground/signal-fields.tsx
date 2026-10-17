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

const BLANK = "__blank__"

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
    onChange({ ...signals, [key]: value === BLANK ? undefined : value })
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
            value={signals.time_available ?? BLANK}
            onValueChange={(value) => setChoice("time_available", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pick one" />
            </SelectTrigger>
            <SelectContent>
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
            value={signals.business_model ?? BLANK}
            onValueChange={(value) => setChoice("business_model", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pick one" />
            </SelectTrigger>
            <SelectContent>
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
              value={signals.tech_comfort ?? BLANK}
              onValueChange={(value) => setChoice("tech_comfort", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pick one" />
              </SelectTrigger>
              <SelectContent>
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
              value={signals.budget ?? BLANK}
              onValueChange={(value) => setChoice("budget", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pick one" />
              </SelectTrigger>
              <SelectContent>
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

import type { SignalProfile } from "@/lib/api"

/**
 * The eight steering signals, in one place.
 *
 * Four are free text and four are a closed set of choices, and both the
 * intake and the editor render them. Lifting the choice sets here keeps
 * the two surfaces from drifting into separate vocabularies for the same
 * signals, which is how a value saved by one screen becomes unreadable by
 * the other.
 */

export const TIME_OPTIONS = [
  { value: "weekends", label: "Weekends only" },
  { value: "evenings", label: "Evenings and weekends" },
  { value: "part-time", label: "Most days, part-time" },
  { value: "full-time", label: "Full time" },
]

export const MODEL_OPTIONS = [
  { value: "saas", label: "Software subscription" },
  { value: "services", label: "Services or consulting" },
  { value: "commerce", label: "Products or commerce" },
  { value: "content", label: "Content or audience" },
  { value: "marketplace", label: "Marketplace or community" },
  { value: "open", label: "Open to anything" },
]

export const TECH_OPTIONS = [
  { value: "none", label: "No code at all" },
  { value: "nocode", label: "No-code tools" },
  { value: "some", label: "Some code or AI assistance" },
  { value: "strong", label: "I build software" },
]

export const BUDGET_OPTIONS = [
  { value: "none", label: "Nothing upfront" },
  { value: "small", label: "Under 100 dollars" },
  { value: "moderate", label: "Under 1000 dollars" },
  { value: "flexible", label: "Whatever it takes" },
]

export type SignalOptionKey =
  "time_available" | "business_model" | "tech_comfort" | "budget"

export const SIGNAL_OPTIONS: Record<
  SignalOptionKey,
  { label: string; options: { value: string; label: string }[] }
> = {
  time_available: { label: "How much time?", options: TIME_OPTIONS },
  business_model: {
    label: "What kind of business?",
    options: MODEL_OPTIONS,
  },
  tech_comfort: { label: "Comfort with technology?", options: TECH_OPTIONS },
  budget: { label: "Budget", options: BUDGET_OPTIONS },
}

export type SignalTextKey =
  "skills" | "audience" | "industries" | "target_customer"

export const SIGNAL_TEXT: {
  key: SignalTextKey
  label: string
  placeholder: string
}[] = [
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

/** Look up the label a stored choice value renders as, so a saved value
 *  never surfaces as a raw slug. A missing key and a null one mean the
 *  same thing here, which is why this takes undefined as well. */
export function signalLabel(
  key: SignalOptionKey,
  value: string | null | undefined
): string | null {
  if (!value) return null
  const match = SIGNAL_OPTIONS[key].options.find(
    (option) => option.value === value
  )
  return match ? match.label : value
}

/** The account steer as a rendered list, for showing what a sandbox will
 *  inherit without opening an editor. */
export function signalSummary(signals: Partial<SignalProfile>): string | null {
  const parts = [
    signals.skills,
    signalLabel("time_available", signals.time_available),
    signalLabel("business_model", signals.business_model),
  ].filter(Boolean) as string[]
  return parts.length ? parts.join(" · ") : null
}

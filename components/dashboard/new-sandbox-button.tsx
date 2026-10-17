"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
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
import { createSandbox, type SignalProfile } from "@/lib/api"
import { toastApiError } from "@/lib/api-errors"
import {
  BUDGET_OPTIONS,
  MODEL_OPTIONS,
  TECH_OPTIONS,
  TIME_OPTIONS,
} from "@/lib/signals"

/**
 * The three-question intake, with the remaining five behind an expander
 * that promises better ideas for better answers. Three questions is a
 * choice, not a limit: a wall of eight fields on first run is the kind of
 * friction that ends a session before it starts.
 */
export default function NewSandboxButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [name, setName] = useState("")
  const [skills, setSkills] = useState("")
  const [time, setTime] = useState("")
  const [model, setModel] = useState("")
  const [tech, setTech] = useState("")
  const [budget, setBudget] = useState("")
  const [audience, setAudience] = useState("")
  const [industries, setIndustries] = useState("")
  const [customer, setCustomer] = useState("")

  async function create() {
    if (!name.trim()) {
      toast.error("Give the sandbox a name so you can find it later.")
      return
    }
    setPending(true)
    try {
      const signals: Partial<SignalProfile> = {}
      if (skills.trim()) signals.skills = skills.trim()
      if (time) signals.time_available = time
      if (model) signals.business_model = model
      if (tech) signals.tech_comfort = tech
      if (budget) signals.budget = budget
      if (audience.trim()) signals.audience = audience.trim()
      if (industries.trim()) signals.industries = industries.trim()
      if (customer.trim()) signals.target_customer = customer.trim()
      const sandbox = await createSandbox({ name: name.trim(), signals })
      router.push(`/dashboard/sandbox/${sandbox.public_id}`)
    } catch (error) {
      setPending(false)
      toastApiError(error, "Could not create the sandbox.")
    }
  }

  if (!open) {
    return <Button onClick={() => setOpen(true)}>New sandbox</Button>
  }

  return (
    <div className="space-y-4 border p-5">
      <p className="font-heading text-xl font-semibold">New sandbox</p>
      <div className="space-y-1.5">
        <Label htmlFor="sb-name">Name</Label>
        <Input
          id="sb-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Weekend bets, B2B invoicing, ..."
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="sb-skills">What are you good at?</Label>
          <Textarea
            id="sb-skills"
            value={skills}
            onChange={(event) => setSkills(event.target.value)}
            placeholder="Baking, sales, data analysis"
            className="min-h-16"
          />
        </div>
        <div className="space-y-1.5">
          <Label>How much time?</Label>
          <Select value={time} onValueChange={setTime}>
            <SelectTrigger>
              <SelectValue placeholder="Pick one" />
            </SelectTrigger>
            <SelectContent>
              {TIME_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>What kind of business?</Label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger>
              <SelectValue placeholder="Pick one" />
            </SelectTrigger>
            <SelectContent>
              {MODEL_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="text-sm text-primary underline"
      >
        {expanded ? "Hide details" : "Answer more for sharper ideas"}
      </button>

      {expanded ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Comfort with technology</Label>
            <Select value={tech} onValueChange={setTech}>
              <SelectTrigger>
                <SelectValue placeholder="Pick one" />
              </SelectTrigger>
              <SelectContent>
                {TECH_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Budget</Label>
            <Select value={budget} onValueChange={setBudget}>
              <SelectTrigger>
                <SelectValue placeholder="Pick one" />
              </SelectTrigger>
              <SelectContent>
                {BUDGET_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sb-audience">People you can already reach</Label>
            <Textarea
              id="sb-audience"
              value={audience}
              onChange={(event) => setAudience(event.target.value)}
              placeholder="An email list, a social following, a shop"
              className="min-h-16"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sb-industries">Industries you know</Label>
            <Textarea
              id="sb-industries"
              value={industries}
              onChange={(event) => setIndustries(event.target.value)}
              placeholder="Logistics, healthcare, restaurants"
              className="min-h-16"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="sb-customer">Who you would serve</Label>
            <Input
              id="sb-customer"
              value={customer}
              onChange={(event) => setCustomer(event.target.value)}
              placeholder="Independent therapists, small farms, ..."
            />
          </div>
        </div>
      ) : null}

      <div className="flex gap-2">
        <Button disabled={pending} onClick={() => void create()}>
          {pending ? "Creating..." : "Create sandbox"}
        </Button>
        <Button variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

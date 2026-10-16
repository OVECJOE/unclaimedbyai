"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  createSearch,
  getResearch,
  startResearch,
  type Idea,
  type Research,
} from "@/lib/api"
import { toastApiError } from "@/lib/api-errors"

function CanvasLine({ label, value }: { label: string; value: string | null }) {
  if (!value) return null
  return (
    <p className="text-sm">
      <span className="font-medium">{label}</span>{" "}
      <span className="text-muted-foreground">{value}</span>
    </p>
  )
}

/**
 * One idea, and the four things worth doing to it. Research costs credits
 * and is the paid artifact, so it is offered first because it is the one
 * that changes a guess into a decision.
 */
export default function IdeaCard({
  idea,
  onChange,
}: {
  idea: Idea
  onChange: () => void
}) {
  const router = useRouter()
  const [research, setResearch] = useState<Research | null>(null)
  const [busy, setBusy] = useState(false)

  async function openResearch() {
    setBusy(true)
    try {
      const current = await getResearch(idea.public_id)
      if (current && current.status === "ready") {
        setResearch(current)
        onChange()
        return
      }
      if (!current) {
        await startResearch(idea.public_id)
        toast("Researching. This takes a moment.")
        return
      }
      setResearch(current)
    } catch (error) {
      toastApiError(error, "Research could not start.")
    } finally {
      setBusy(false)
    }
  }

  async function toSearch() {
    setBusy(true)
    try {
      const search = await createSearch({
        query: `${idea.title}. ${idea.concept}`,
        idea_id: idea.public_id,
      })
      router.push(`/results/${search.id}`)
    } catch (error) {
      setBusy(false)
      toastApiError(error, "Could not start the search.")
    }
  }

  return (
    <li className="border p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-heading text-xl font-semibold">{idea.title}</p>
        <div className="flex items-center gap-2">
          {idea.pinned ? (
            <span className="text-[0.625rem] font-semibold tracking-widest text-primary uppercase">
              Kept
            </span>
          ) : null}
          <Badge variant="outline">{idea.category}</Badge>
        </div>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{idea.concept}</p>
      {idea.canvas ? (
        <div className="mt-3 space-y-1 border-l-2 pl-3">
          <CanvasLine label="Audience" value={idea.canvas.audience} />
          <CanvasLine label="Wedge" value={idea.canvas.wedge} />
          <CanvasLine label="Model" value={idea.canvas.model} />
        </div>
      ) : null}

      {research && research.status === "ready" ? (
        <div className="mt-4 space-y-3 border p-4">
          <p className="font-heading text-lg font-semibold">Market research</p>
          {research.summary ? (
            <p className="text-sm text-muted-foreground">{research.summary}</p>
          ) : null}
          {research.competitors?.competitors?.length ? (
            <div>
              <p className="text-sm font-medium">Competitors</p>
              <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                {research.competitors.competitors.map((competitor) => (
                  <li key={competitor.name}>
                    {competitor.name}
                    {competitor.pricing ? ` — ${competitor.pricing}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {research.demand?.signals?.length ? (
            <div>
              <p className="text-sm font-medium">Demand signals</p>
              <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                {research.demand.signals.map((signal) => (
                  <li key={signal}>{signal}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {research.monetization?.paths?.length ? (
            <div>
              <p className="text-sm font-medium">How it earns</p>
              <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                {research.monetization.paths.map((path) => (
                  <li key={path.model}>
                    {path.model}
                    {path.price ? ` at ${path.price}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" disabled={busy} onClick={() => void openResearch()}>
          {idea.status === "researched" ? "Read research" : "Research · 3"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => void toSearch()}
        >
          Search names · 2
        </Button>
      </div>
    </li>
  )
}

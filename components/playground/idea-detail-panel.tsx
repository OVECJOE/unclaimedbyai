"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Cancel01Icon,
  Pin02Icon,
  Search01Icon,
  MagicWand01Icon,
} from "@hugeicons/core-free-icons"
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
import { useDashboardStore } from "@/lib/store/dashboard"

function CanvasLine({ label, value }: { label: string; value: string | null }) {
  if (!value) return null
  return (
    <p className="text-sm">
      <span className="font-medium">{label}</span>{" "}
      <span className="text-muted-foreground">{value}</span>
    </p>
  )
}

function ResearchBody({
  research,
}: {
  research: Pick<Research, "status" | "error"> &
    Partial<
      Pick<Research, "summary" | "competitors" | "demand" | "monetization">
    >
}) {
  if (research.status === "failed") {
    return (
      <p className="text-sm text-destructive">
        {research.error ?? "Research failed. Try again."}
      </p>
    )
  }
  if (research.status === "generating") {
    return (
      <div className="space-y-2" aria-label="Generating research">
        <div className="h-4 w-2/3 animate-pulse bg-muted" />
        <div className="h-3 w-full animate-pulse bg-muted" />
        <div className="h-3 w-5/6 animate-pulse bg-muted" />
        <p className="text-xs text-muted-foreground">
          Researching. Refresh in a moment.
        </p>
      </div>
    )
  }
  return (
    <div className="space-y-3">
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
                {competitor.pricing ? `, ${competitor.pricing}` : ""}
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
  )
}

/**
 * One idea, opened: the full canvas, the research if it was bought, and
 * the two paid steps. Panel on desktop, sheet on mobile, same body
 * either way, because the content is identical and only the frame
 * differs by how much room there is.
 */
export default function IdeaDetailPanel({
  idea,
  onClose,
}: {
  idea: Idea
  onClose: () => void
}) {
  const router = useRouter()
  const setPinned = useDashboardStore((state) => state.setPinned)
  const [research, setResearch] = useState<Research | null>(null)
  const [startingResearch, setStartingResearch] = useState(false)
  const [busy, setBusy] = useState(false)
  const researching = startingResearch || research?.status === "generating"

  async function openResearch() {
    setBusy(true)
    try {
      const current = await getResearch(idea.public_id)
      if (current && current.status === "ready") {
        setResearch(current)
        return
      }
      if (!current) {
        await startResearch(idea.public_id)
        setStartingResearch(true)
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
      router.push(`/dashboard/history/${search.id}`)
    } catch (error) {
      toastApiError(error, "Could not start the search.")
    } finally {
      setBusy(false)
    }
  }

  async function togglePin() {
    try {
      await setPinned(idea.public_id, !idea.pinned)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "The pin could not save."
      )
    }
  }

  return (
    <div className="flex h-full flex-col border bg-card">
      <div className="flex items-start justify-between gap-3 border-b p-4">
        <div className="min-w-0">
          <p className="truncate font-heading text-xl font-semibold">
            {idea.title}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Badge variant="outline">{idea.category}</Badge>
            {idea.status === "researched" ? (
              <span className="text-[0.625rem] font-semibold tracking-widest text-primary uppercase">
                Researched
              </span>
            ) : null}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Close idea"
          onClick={onClose}
        >
          <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
        </Button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <p className="text-sm text-muted-foreground">{idea.concept}</p>
        {idea.canvas ? (
          <div className="space-y-1 border-l-2 pl-3">
            <CanvasLine label="Audience" value={idea.canvas.audience} />
            <CanvasLine label="Wedge" value={idea.canvas.wedge} />
            <CanvasLine label="Model" value={idea.canvas.model} />
          </div>
        ) : null}

        <div className="border p-4">
          <p className="text-sm font-medium">Market research</p>
          {research && research.status !== "generating" ? (
            <div className="mt-2">
              <ResearchBody research={research} />
            </div>
          ) : researching ? (
            <div className="mt-2">
              <ResearchBody research={{ status: "generating", error: null }} />
            </div>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">
              Competitors, demand, channels, and how it earns. The paid artifact
              behind a real decision.
            </p>
          )}
          <Button
            size="sm"
            className="mt-3"
            disabled={busy}
            onClick={() => void openResearch()}
          >
            {idea.status === "researched" ? "Read research" : "Research · 3"}
          </Button>
        </div>

        {idea.search_id ? (
          <Link
            href={`/dashboard/history/${idea.search_id}`}
            className="flex items-center gap-2 border p-4 text-sm text-primary transition-colors hover:border-primary/50"
          >
            <HugeiconsIcon icon={Search01Icon} className="size-4" />
            Open the names already generated for this idea
          </Link>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2 border-t p-4">
        <Button size="sm" disabled={busy} onClick={() => void toSearch()}>
          <HugeiconsIcon icon={MagicWand01Icon} className="size-4" />
          Generate names · 2
        </Button>
        <Button
          size="sm"
          variant={idea.pinned ? "default" : "outline"}
          onClick={() => void togglePin()}
        >
          <HugeiconsIcon icon={Pin02Icon} className="size-4" />
          {idea.pinned ? "Kept" : "Keep"}
        </Button>
      </div>
    </div>
  )
}

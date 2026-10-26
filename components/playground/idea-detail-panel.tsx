"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Cancel01Icon,
  Delete02Icon,
  Pin02Icon,
  Search01Icon,
  MagicWand01Icon,
} from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  createSearch,
  getResearch,
  retryResearchSection,
  startResearch,
  suggestPositioning,
  type Idea,
  type IdeaCanvas,
  type Research,
} from "@/lib/api"
import { toastApiError } from "@/lib/api-errors"
import { track } from "@/lib/analytics"
import { playSound } from "@/lib/sound/engine"
import { useDashboardStore } from "@/lib/store/dashboard"
import {
  ResearchBody,
  sectionPending,
} from "@/components/playground/research-body"

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
  const detachSearch = useDashboardStore((state) => state.detachSearch)
  const saveIdeaCanvas = useDashboardStore((state) => state.saveIdeaCanvas)
  const [research, setResearch] = useState<Research | null>(null)
  const [polling, setPolling] = useState(false)
  const [busy, setBusy] = useState(false)
  const [positioning, setPositioning] = useState<IdeaCanvas | null>(null)
  const [distilling, setDistilling] = useState(false)

  async function openResearch() {
    setBusy(true)
    try {
      const current = await getResearch(idea.public_id)
      if (current && current.status === "ready" && !sectionPending(current)) {
        setResearch(current)
        return
      }
      if (current && current.status === "generating") {
        setPolling(true)
        return
      }
      // Nothing bought yet, or a failed run that already refunded:
      // both are a fresh purchase, never a re-bill of dead work.
      if (!current || current.status === "failed") {
        await startResearch(idea.public_id)
        setResearch({
          status: "generating",
          error: null,
          competitors: null,
          demand: null,
          audience_channels: null,
          monetization: null,
          summary: null,
        })
        setPolling(true)
        toast("Four sections, researched live — each lands as it finishes.")
        return
      }
      setResearch(current)
    } catch (error) {
      toastApiError(error, "Research could not start.")
    } finally {
      setBusy(false)
    }
  }

  async function retrySection(section: string) {
    try {
      await retryResearchSection(idea.public_id, section)
      setResearch((current) =>
        current ? ({ ...current, [section]: null } as Research) : current
      )
      setPolling(true)
    } catch (error) {
      toastApiError(error, "The section could not be re-run.")
    }
  }

  // Load what was already bought the moment the idea opens — a bought
  // report should be visible without a click, let alone a refresh.
  useEffect(() => {
    let cancelled = false
    void getResearch(idea.public_id)
      .then((existing) => {
        if (cancelled || !existing) return
        setResearch(existing)
        if (existing.status === "generating") setPolling(true)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [idea.public_id])

  // While anything is still being researched, poll: sections land one
  // by one in front of the buyer. The old copy said "refresh in a
  // moment"; this never asks for an F5.
  useEffect(() => {
    if (!polling) return
    let cancelled = false
    let attempts = 0
    const id = setInterval(() => {
      attempts += 1
      if (attempts > 80) {
        setPolling(false)
        return
      }
      void getResearch(idea.public_id)
        .then((fresh) => {
          if (cancelled || !fresh) return
          setResearch(fresh)
          if (fresh.status === "ready" && !sectionPending(fresh)) {
            setPolling(false)
            playSound("reward", `research:${idea.public_id}`)
            track("research_ready")
          } else if (fresh.status === "failed") {
            setPolling(false)
            playSound("error", `research:${idea.public_id}`)
            toast.error(fresh.error ?? "Research failed. Try again.")
          }
        })
        .catch(() => {})
    }, 3000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [polling, idea.public_id])

  async function openPositioning() {
    setDistilling(true)
    try {
      const suggestion = await suggestPositioning(idea.public_id)
      setPositioning({
        audience: suggestion.audience ?? idea.canvas?.audience ?? null,
        wedge: suggestion.wedge ?? idea.canvas?.wedge ?? null,
        model: suggestion.model ?? idea.canvas?.model ?? null,
      })
    } catch (error) {
      toastApiError(error, "Positioning could not be distilled.")
    } finally {
      setDistilling(false)
    }
  }

  async function applyPositioning() {
    if (!positioning) return
    setBusy(true)
    try {
      await saveIdeaCanvas(idea.public_id, positioning)
      setPositioning(null)
      toast("Steer saved — the next name run names this positioning.")
    } catch (error) {
      toastApiError(error, "The steer could not save.")
    } finally {
      setBusy(false)
    }
  }

  async function toSearch() {
    setBusy(true)
    try {
      const steer = idea.canvas
        ? [
            idea.canvas.audience ? `Audience: ${idea.canvas.audience}` : null,
            idea.canvas.wedge ? `Positioning gap: ${idea.canvas.wedge}` : null,
            idea.canvas.model ? `Revenue model: ${idea.canvas.model}` : null,
          ].filter((line): line is string => line !== null)
        : []
      const search = await createSearch({
        query: steer.length
          ? `${idea.title}. ${idea.concept}\n${steer.join("\n")}`
          : `${idea.title}. ${idea.concept}`,
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

  async function removeSearch() {
    setBusy(true)
    try {
      await detachSearch(idea.public_id)
      toast("Search deleted.")
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "The delete failed."
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col border bg-card">
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

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
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
          {research ? (
            <div className="mt-2">
              <ResearchBody research={research} onRetry={retrySection} />
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
            disabled={busy || polling}
            onClick={() => void openResearch()}
          >
            {polling || research?.status === "generating"
              ? "Researching…"
              : idea.status === "researched"
                ? "Read research"
                : "Run research · 3 credits"}
          </Button>

          {research && research.status === "ready" ? (
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              disabled={busy || distilling}
              onClick={() => void openPositioning()}
            >
              {distilling
                ? "Distilling positioning…"
                : "Apply positioning to steer"}
            </Button>
          ) : null}
        </div>

        {idea.search_id ? (
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/history/${idea.search_id}`}
              className="flex flex-1 items-center gap-2 border p-4 text-sm text-primary transition-colors hover:border-primary/50"
            >
              <HugeiconsIcon icon={Search01Icon} className="size-4" />
              Open the names already generated for this idea
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Delete this idea's search"
                  className="border text-muted-foreground hover:border-destructive hover:text-destructive"
                  disabled={busy}
                >
                  <HugeiconsIcon icon={Delete02Icon} className="size-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this search?</AlertDialogTitle>
                  <AlertDialogDescription>
                    The names generated for this idea stop being reachable, and
                    the idea goes back to ready for a fresh run. This cannot be
                    undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep it</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={busy}
                    onClick={(event) => {
                      event.preventDefault()
                      void removeSearch()
                    }}
                  >
                    {busy ? "Deleting..." : "Delete search"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
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

      <Dialog
        open={positioning !== null}
        onOpenChange={(open) => {
          if (!open) setPositioning(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Steer the next name run</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {(["audience", "wedge", "model"] as const).map((key) => (
              <div key={key} className="space-y-1">
                <label
                  htmlFor={`steer-${key}`}
                  className="text-sm font-medium capitalize"
                >
                  {key}
                </label>
                <Input
                  id={`steer-${key}`}
                  value={positioning?.[key] ?? ""}
                  onChange={(event) =>
                    setPositioning((current) =>
                      current
                        ? {
                            ...current,
                            [key]: event.target.value || null,
                          }
                        : current
                    )
                  }
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPositioning(null)}>
              Cancel
            </Button>
            <Button disabled={busy} onClick={() => void applyPositioning()}>
              {busy ? "Saving..." : "Apply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

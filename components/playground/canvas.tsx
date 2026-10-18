"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import type { SandboxDetail, SandboxList } from "@/lib/api"
import { useDashboardStore } from "@/lib/store/dashboard"
import { useMediaQuery } from "@/hooks/use-media-query"
import SandboxSwitcher from "@/components/playground/sandbox-switcher"
import GeneratePanel from "@/components/playground/generate-panel"
import IdeaBoard from "@/components/playground/idea-board"
import IdeaDetailPanel from "@/components/playground/idea-detail-panel"

const POLL_MS = 2500

function ManualIdeaForm({ publicId }: { publicId: string }) {
  const addIdea = useDashboardStore((state) => state.addIdea)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [concept, setConcept] = useState("")
  const [pending, setPending] = useState(false)

  async function add(event: React.FormEvent) {
    event.preventDefault()
    if (!title.trim() || !concept.trim()) {
      toast.error("An idea needs a title and a concept.")
      return
    }
    setPending(true)
    const idea = await addIdea(publicId, {
      title: title.trim(),
      concept: concept.trim(),
    })
    setPending(false)
    if (!idea) {
      toast.error("Could not add the idea.")
      return
    }
    setTitle("")
    setConcept("")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <HugeiconsIcon icon={Add01Icon} className="size-4" />
          Add by hand
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add by hand</DialogTitle>
          <DialogDescription>
            An idea you already have works exactly like a generated one.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={add} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="mi-title">Title</Label>
            <Input
              id="mi-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Sourdough subscriptions"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mi-concept">Concept</Label>
            <Textarea
              id="mi-concept"
              value={concept}
              onChange={(event) => setConcept(event.target.value)}
              placeholder="Weekly starter kits for people who want fresh bread without the fuss."
              className="min-h-20"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Adding..." : "Add idea"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/**
 * The canvas: one sandbox, its board, and the two ways ideas arrive.
 * The store owns the sandbox and its ideas; this component wires the
 * route to the store and the store to the board, and polls only while
 * a run is going.
 */
export default function PlaygroundCanvas({
  initialList,
  initialDetail,
  activeId,
}: {
  initialList: SandboxList
  initialDetail: SandboxDetail | null
  activeId: string | null
}) {
  const isDesktop = useMediaQuery("(min-width: 1024px)", true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const list = useDashboardStore((state) => state.sandboxes)
  const detail = useDashboardStore((state) => state.detail)
  const openSandbox = useDashboardStore((state) => state.openSandbox)
  const ensureSandboxes = useDashboardStore((state) => state.ensureSandboxes)

  // Seed the store from the server's first answer, then let the store
  // answer everything after. Hydration runs once per mount.
  useEffect(() => {
    useDashboardStore.setState((state) => ({
      sandboxes: state.sandboxes.length ? state.sandboxes : initialList.items,
      sandboxesAt: state.sandboxesAt || Date.now(),
      detail:
        state.detail?.public_id === initialDetail?.public_id
          ? state.detail
          : initialDetail,
      detailAt: state.detailAt || Date.now(),
    }))
  }, [initialList, initialDetail])

  // Follow the sandbox in the address bar without a full reload, so a
  // switcher click re-uses the already rendered board.
  useEffect(() => {
    if (activeId && detail?.public_id !== activeId) {
      void openSandbox(activeId)
    }
  }, [activeId, detail?.public_id, openSandbox])

  const generating = detail?.run_status === "generating"

  // Poll while a run is going and stop the moment it is not, so a tab
  // left open does not poll forever.
  useEffect(() => {
    if (!generating || !detail) return
    let cancelled = false
    const timer = setInterval(async () => {
      const fresh = await openSandbox(detail.public_id, { force: true })
      if (cancelled || !fresh) return
      if (fresh.run_status === "failed" && fresh.run_error) {
        toast.error(fresh.run_error)
      }
      if (fresh.run_status !== "generating") {
        void ensureSandboxes({ force: true })
      }
    }, POLL_MS)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [generating, detail, openSandbox, ensureSandboxes])

  const sandboxes = list.length ? list : initialList.items
  const board = detail

  if (!board) {
    return (
      <div className="border border-dashed p-8 text-center">
        <p className="font-heading text-xl font-semibold">No sandbox open</p>
        <p className="mx-auto mt-1 max-w-prose text-sm text-muted-foreground">
          {sandboxes.length
            ? "Pick one above, or start a new sandbox to generate ideas."
            : "Start a sandbox, answer three questions, and generate your first batch."}
        </p>
      </div>
    )
  }

  const expanded = board.ideas.find((idea) => idea.public_id === expandedId)

  const panel = expanded ? (
    <IdeaDetailPanel idea={expanded} onClose={() => setExpandedId(null)} />
  ) : null

  return (
    <div className="space-y-5">
      <SandboxSwitcher sandboxes={sandboxes} activeId={board.public_id} />

      <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-baseline gap-3">
              <h2 className="font-heading text-2xl font-semibold">
                {board.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                {board.ideas.length} idea{board.ideas.length === 1 ? "" : "s"}
                {" · "}
                {board.search_count} search
                {board.search_count === 1 ? "" : "es"}
              </p>
            </div>
            <ManualIdeaForm publicId={board.public_id} />
          </div>
          <IdeaBoard
            ideas={board.ideas}
            expandedId={expandedId}
            onExpand={(publicId) =>
              setExpandedId((current) =>
                current === publicId ? null : publicId
              )
            }
          />
        </div>

        <div className="space-y-4">
          {/* Desktop keeps the open idea beside the board; mobile puts
              it in a sheet so it does not shove the board off screen. */}
          {isDesktop && panel ? (
            <div className="max-h-[36rem]">{panel}</div>
          ) : null}
          <GeneratePanel
            publicId={board.public_id}
            runStatus={board.run_status}
            runError={board.run_error}
            hasIdeas={board.ideas.length > 0}
          />
        </div>
      </div>

      <Sheet
        open={!isDesktop && Boolean(expanded)}
        onOpenChange={(open) => {
          if (!open) setExpandedId(null)
        }}
      >
        <SheetContent side="bottom" className="h-[85vh] p-0">
          <SheetTitle className="sr-only">
            {expanded?.title ?? "Idea"}
          </SheetTitle>
          {panel}
        </SheetContent>
      </Sheet>
    </div>
  )
}

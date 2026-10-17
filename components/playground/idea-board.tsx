"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable"
import { HugeiconsIcon } from "@hugeicons/react"
import { SparklesIcon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { createSearch, type Idea } from "@/lib/api"
import { toastApiError } from "@/lib/api-errors"
import { useDashboardStore } from "@/lib/store/dashboard"
import IdeaBoardCard from "@/components/playground/idea-board-card"

const GENERATE_ZONE_ID = "generate-names-zone"

/**
 * The drop target that turns a dragged idea into a search. It arms
 * while anything is dragged, so the gesture reads as "take this idea
 * over there", and the actual drop is answered in the context's drag
 * end where the dragged idea is known.
 */
function GenerateDropZone({ armed }: { armed: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: GENERATE_ZONE_ID })
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex items-center justify-center gap-2 border border-dashed px-4 py-3 text-sm transition-colors",
        isOver
          ? "border-primary bg-primary/5 font-medium text-primary"
          : armed
            ? "border-primary/50 text-muted-foreground"
            : "text-muted-foreground"
      )}
    >
      <HugeiconsIcon icon={SparklesIcon} className="size-4" />
      {isOver
        ? "Drop to generate names for this idea"
        : "Drag an idea here to generate names for it"}
    </div>
  )
}

/**
 * The idea board: drag to reorder, drag onto the zone to start a
 * search, click a card to open it. Mouse and touch both work because
 * the sensors pair a distance-armed pointer with a delay-armed touch,
 * which keeps a scroll from becoming a drag on a phone.
 */
export default function IdeaBoard({
  ideas,
  expandedId,
  onExpand,
}: {
  ideas: Idea[]
  expandedId: string | null
  onExpand: (publicId: string) => void
}) {
  const router = useRouter()
  const reorderIdeas = useDashboardStore((state) => state.reorderIdeas)
  const openSandbox = useDashboardStore((state) => state.openSandbox)
  const detailPublicId = useDashboardStore((state) => state.detail?.public_id)
  const [searching, setSearching] = useState(false)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  async function toSearch(idea: Idea) {
    setSearching(true)
    try {
      const search = await createSearch({
        query: `${idea.title}. ${idea.concept}`,
        idea_id: idea.public_id,
      })
      // The card gains its names link on the way out, so refresh the
      // board before the route change and it is consistent when the
      // user comes back.
      if (detailPublicId) {
        await openSandbox(detailPublicId, { force: true }).catch(() => null)
      }
      router.push(`/dashboard/history/${search.id}`)
    } catch (error) {
      toastApiError(error, "Could not start the search.")
    } finally {
      setSearching(false)
    }
  }

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || searching) return
    const dragged = ideas.find((idea) => idea.public_id === active.id)
    if (!dragged) return

    if (over.id === GENERATE_ZONE_ID) {
      await toSearch(dragged)
      return
    }
    if (active.id === over.id) return

    const from = ideas.findIndex((idea) => idea.public_id === active.id)
    const to = ideas.findIndex((idea) => idea.public_id === over.id)
    if (from === -1 || to === -1) return
    const ordered = arrayMove(ideas, from, to)
    try {
      await reorderIdeas(ordered.map((idea) => idea.public_id))
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "The order could not save."
      )
    }
  }

  if (ideas.length === 0) {
    return (
      <div className="border border-dashed p-8 text-center">
        <p className="font-heading text-xl font-semibold">Empty board</p>
        <p className="mx-auto mt-1 max-w-prose text-sm text-muted-foreground">
          Generate a batch or add an idea by hand. Either way, this board fills
          with what the studios and you come up with.
        </p>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={(event) => void onDragEnd(event)}
    >
      <SortableContext
        items={ideas.map((idea) => idea.public_id)}
        strategy={rectSortingStrategy}
      >
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {ideas.map((idea) => (
            <IdeaBoardCard
              key={idea.public_id}
              idea={idea}
              expanded={idea.public_id === expandedId}
              onExpand={() => onExpand(idea.public_id)}
            />
          ))}
        </ul>
      </SortableContext>
      <div className="mt-4">
        <GenerateDropZone armed={!searching} />
      </div>
    </DndContext>
  )
}

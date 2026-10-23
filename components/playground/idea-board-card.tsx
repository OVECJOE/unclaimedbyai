"use client"

import Link from "next/link"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  Drag01Icon,
  Pin02Icon,
} from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Idea } from "@/lib/api"

/**
 * One idea on the board. Draggable by the grip so a click anywhere
 * else still opens the card, which keeps touch drag from eating the
 * tap that meant "expand".
 */
export default function IdeaBoardCard({
  idea,
  expanded,
  onExpand,
}: {
  idea: Idea
  expanded: boolean
  onExpand: () => void
}) {
  const hasSearch = Boolean(idea.search_id)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: idea.public_id, disabled: hasSearch })

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "flex flex-col border bg-card p-4",
        isDragging && "z-10 opacity-60",
        expanded && "border-primary"
      )}
    >
      <div className="flex items-start gap-2">
        {hasSearch ? (
          <span className="mt-0.5 block size-4 shrink-0" aria-hidden="true" />
        ) : (
          <button
            type="button"
            className="cursor-grab touch-none p-2 -m-2 text-muted-foreground hover:text-foreground active:cursor-grabbing"
            aria-label={`Reorder ${idea.title}`}
            {...attributes}
            {...listeners}
          >
            <HugeiconsIcon icon={Drag01Icon} className="size-4" />
          </button>
        )}
        <button
          type="button"
          onClick={onExpand}
          aria-expanded={expanded}
          className="min-w-0 flex-1 text-left"
        >
          <p className="truncate font-heading text-lg font-semibold">
            {idea.title}
          </p>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {idea.concept}
          </p>
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {idea.pinned ? (
          <span className="flex items-center gap-1 text-[0.625rem] font-semibold tracking-widest text-primary uppercase">
            <HugeiconsIcon icon={Pin02Icon} className="size-3" />
            Kept
          </span>
        ) : null}
        <Badge variant="outline">{idea.category}</Badge>
        {idea.search_id ? (
          <Link
            href={`/dashboard/history/${idea.search_id}`}
            className="ml-auto flex items-center gap-1 text-xs text-primary underline"
          >
            Names
            <HugeiconsIcon icon={ArrowRight01Icon} className="size-3" />
          </Link>
        ) : null}
      </div>
    </li>
  )
}

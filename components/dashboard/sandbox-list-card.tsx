"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  Delete02Icon,
  PencilEdit01Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import type { Sandbox } from "@/lib/api"
import { restoreSandbox } from "@/lib/api"
import { useDashboardStore } from "@/lib/store/dashboard"
import { signalSummary } from "@/lib/signals"

function createdAt(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

/**
 * One row of the sandboxes list. Rename and delete run through the
 * dashboard store so the canvas and home page see the same change the
 * moment it happens, then the server list refreshes underneath.
 */
export default function SandboxListCard({ sandbox }: { sandbox: Sandbox }) {
  const router = useRouter()
  const renameSandbox = useDashboardStore((state) => state.renameSandbox)
  const removeSandbox = useDashboardStore((state) => state.removeSandbox)
  const ensureSandboxes = useDashboardStore((state) => state.ensureSandboxes)
  const [renaming, setRenaming] = useState(false)
  const [name, setName] = useState(sandbox.name)
  const [busy, setBusy] = useState(false)

  async function rename(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim()) return
    setBusy(true)
    try {
      await renameSandbox(sandbox.public_id, name.trim())
      setRenaming(false)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The rename failed.")
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    setBusy(true)
    try {
      await removeSandbox(sandbox.public_id)
      router.refresh()
      toast(`${sandbox.name} retired.`, {
        duration: 6000,
        action: {
          label: "Undo",
          onClick: () => {
            void restoreSandbox(sandbox.public_id)
              .then(async () => {
                // The store's optimistic removal already dropped it
                // from the lists, so the undo has to repopulate them,
                // not just refresh the server page underneath.
                await ensureSandboxes({ force: true })
                router.refresh()
                toast.success(`${sandbox.name} is back.`)
              })
              .catch((error: unknown) => {
                toast.error(
                  error instanceof Error
                    ? error.message
                    : "Could not bring that back."
                )
              })
          },
        },
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The delete failed.")
    } finally {
      setBusy(false)
    }
  }

  const summary = signalSummary(sandbox.signals)

  return (
    <li className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
      <Link
        href={`/dashboard/playground?sandbox=${sandbox.public_id}`}
        className="min-w-0 flex-1"
      >
        <div className="flex items-baseline gap-2">
          <p className="truncate font-heading text-xl font-semibold">
            {sandbox.name}
          </p>
          {sandbox.auto_created ? (
            <span className="shrink-0 text-[0.625rem] font-semibold tracking-widest text-muted-foreground uppercase">
              From a search
            </span>
          ) : null}
        </div>
        {summary ? (
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {summary}
          </p>
        ) : null}
        <p className="mt-2 text-sm text-muted-foreground">
          {sandbox.idea_count} idea{sandbox.idea_count === 1 ? "" : "s"}
          {" · "}
          {sandbox.search_count} search
          {sandbox.search_count === 1 ? "" : "es"}
          {" · "}
          {createdAt(sandbox.created_at)}
        </p>
      </Link>

      <div className="flex shrink-0 items-center gap-1">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link
            href={`/dashboard/playground?sandbox=${sandbox.public_id}`}
            aria-label={`Open ${sandbox.name}`}
          >
            <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Rename ${sandbox.name}`}
          onClick={() => {
            setName(sandbox.name)
            setRenaming(true)
          }}
        >
          <HugeiconsIcon icon={PencilEdit01Icon} className="size-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Delete ${sandbox.name}`}
              className="text-muted-foreground hover:text-destructive"
            >
              <HugeiconsIcon icon={Delete02Icon} className="size-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {sandbox.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                Every idea in this sandbox goes with it, and the searches
                started from those ideas stop being reachable here. This cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep it</AlertDialogCancel>
              <AlertDialogAction
                disabled={busy}
                onClick={(event) => {
                  event.preventDefault()
                  void remove()
                }}
              >
                {busy ? "Deleting..." : "Delete sandbox"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Dialog open={renaming} onOpenChange={setRenaming}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename sandbox</DialogTitle>
          </DialogHeader>
          <form onSubmit={rename} className="space-y-4">
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              aria-label="Sandbox name"
              autoFocus
            />
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setRenaming(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={busy || !name.trim()}>
                {busy ? "Saving..." : "Save name"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </li>
  )
}

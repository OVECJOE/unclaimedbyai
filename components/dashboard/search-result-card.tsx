"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  BrandfetchIcon,
  Delete02Icon,
  PencilEdit01Icon,
} from "@hugeicons/core-free-icons"
import { formatDateTime } from "@/lib/utils"
import {
  Avatar,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { deleteSearch, restoreSearch, updateSearch } from "@/lib/api"
import { TierBadge } from "@/components/tier-badge"
import type { GradeTier } from "@/lib/name-results"

export type SearchResultCardProps = {
  id: string
  query: string
  nameCount: number
  topPick: { name: string; logo: string }
  namesPreview: { name: string; logo: string }[]
  createdAt: string
  tier?: GradeTier
}

export function SearchResultCard({
  id,
  query,
  nameCount,
  namesPreview,
  topPick,
  createdAt,
  tier,
}: SearchResultCardProps) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [draft, setDraft] = useState(query)

  async function rename(event: React.FormEvent) {
    event.preventDefault()
    const next = draft.trim()
    if (!next || next === query) {
      setRenaming(false)
      return
    }
    setBusy(true)
    try {
      await updateSearch(Number(id), next)
      setRenaming(false)
      router.refresh()
      toast.success("Renamed.")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "The rename failed."
      )
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    setBusy(true)
    try {
      await deleteSearch(Number(id))
      router.refresh()
      toast(`“${query}” retired.`, {
        duration: 6000,
        action: {
          label: "Undo",
          onClick: () => {
            void restoreSearch(Number(id))
              .then(() => {
                router.refresh()
                toast.success(`“${query}” is back in your history.`)
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
      toast.error(
        error instanceof Error ? error.message : "The delete failed."
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="group relative">
      <Link
        href={`/dashboard/history/${id}`}
        as={`/dashboard/history/${id}`}
        className="block"
      >
        <div className="px-2 py-4">
          <div className="flex items-start justify-between gap-6 px-1">
            <div className="flex min-w-0 flex-col gap-2">
              <div className="space-y-1">
                <h5 className="line-clamp-3 truncate font-heading text-lg font-semibold md:text-xl">
                  {query}
                </h5>
                <p className="text-xs leading-4 text-muted-foreground">
                  {formatDateTime(createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Avatar size="sm">
                  <AvatarImage src={topPick.logo} alt={topPick.name} />
                  <AvatarFallback>
                    <HugeiconsIcon icon={BrandfetchIcon} className="size-4" />
                  </AvatarFallback>
                </Avatar>
                {topPick.name ? (
                  <p className="text-sm font-medium italic">
                    <span className="text-primary">{topPick.name}</span> is the
                    top pick
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No names yet
                  </p>
                )}
                {tier && <TierBadge tier={tier} />}
              </div>
            </div>

            <AvatarGroup>
              {namesPreview.map((name, index) => (
                <Avatar key={index}>
                  <AvatarImage src={name.logo} alt={name.name} />
                  <AvatarFallback>
                    <HugeiconsIcon icon={BrandfetchIcon} className="size-4" />
                  </AvatarFallback>
                </Avatar>
              ))}
              {nameCount > namesPreview.length ? (
                <AvatarGroupCount>
                  +{nameCount - namesPreview.length}
                </AvatarGroupCount>
              ) : null}
            </AvatarGroup>
          </div>
        </div>
      </Link>

      <div className="absolute right-2 bottom-3 z-10 flex opacity-100 transition-opacity focus-visible:opacity-100 pointer-fine:opacity-0 pointer-fine:group-focus-within:opacity-100 pointer-fine:group-hover:opacity-100">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Rename the search "${query}"`}
          className="text-muted-foreground hover:text-primary"
          disabled={busy}
          onClick={() => {
            setDraft(query)
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
              aria-label={`Delete the search "${query}"`}
              className="text-muted-foreground hover:text-destructive"
              disabled={busy}
            >
              <HugeiconsIcon icon={Delete02Icon} className="size-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this search?</AlertDialogTitle>
              <AlertDialogDescription>
                The names it generated stop being reachable, and the month&apos;s
                search slot it used comes back. Undo sits in the toast for a
                few seconds after.
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
                {busy ? "Deleting..." : "Delete search"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Dialog open={renaming} onOpenChange={setRenaming}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename this search</DialogTitle>
          </DialogHeader>
          <form onSubmit={(event) => void rename(event)} className="space-y-4">
            <Input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              aria-label="Search brief"
              maxLength={400}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              The brief is the title everywhere this search appears — history,
              breadcrumbs, and the report header.
            </p>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setRenaming(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={busy || !draft.trim()}>
                {busy ? "Saving..." : "Save name"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

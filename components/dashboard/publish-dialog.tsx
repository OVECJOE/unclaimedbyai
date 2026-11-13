"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Share08Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  getPublication,
  savePublication,
  unpublish,
  type Publication,
} from "@/lib/api"
import { toastApiError } from "@/lib/api-errors"
import { refreshIdeaPage } from "@/app/dashboard/actions"

/**
 * Turns a finished search into a public page. Off by default, and the
 * dialog says plainly what becomes public: the idea, the names with
 * their checks, and only the name you choose to show. Your email never
 * appears, and you can leave any name off the page.
 */
export default function PublishDialog({
  searchId,
  query,
  names,
}: {
  searchId: number
  query: string
  names: { id: number; name: string }[]
}) {
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<Publication | null>(null)
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [showAvatar, setShowAvatar] = useState(false)
  const [note, setNote] = useState("")
  const [hidden, setHidden] = useState<number[]>([])
  const [saving, setSaving] = useState(false)
  const [failed, setFailed] = useState(false)

  function load(next: Publication) {
    setState(next)
    setTitle(next.title ?? "")
    setAuthor(next.author_name ?? "")
    setShowAvatar(next.show_avatar)
    setNote(next.note ?? "")
    setHidden(next.hidden_name_ids)
  }

  useEffect(() => {
    if (!open || state) return
    getPublication(searchId)
      .then(load)
      .catch(() => setFailed(true))
  }, [open, state, searchId])

  const shown =
    names.length - hidden.filter((id) => names.some((n) => n.id === id)).length

  async function publish() {
    setSaving(true)
    try {
      const saved = await savePublication(searchId, {
        title: title.trim() || null,
        author_name: author.trim() || null,
        show_avatar: showAvatar,
        note: note.trim() || null,
        hidden_name_ids: hidden,
      })
      load(saved)
      if (saved.slug) await refreshIdeaPage(saved.slug)
      toast.success(state?.published ? "Page updated." : "Your page is live.")
    } catch (error) {
      toastApiError(error, "Could not publish. Try again in a moment.")
    } finally {
      setSaving(false)
    }
  }

  async function takeDown() {
    setSaving(true)
    try {
      const saved = await unpublish(searchId)
      load(saved)
      if (saved.slug) await refreshIdeaPage(saved.slug)
      toast.success("Your page is offline.")
    } catch (error) {
      toastApiError(error, "Could not take it offline. Try again.")
    } finally {
      setSaving(false)
    }
  }

  async function copy() {
    if (!state?.path) return
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}${state.path}`
      )
      toast.success("Link copied.")
    } catch {
      toast.error("Could not copy the link.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <HugeiconsIcon icon={Share08Icon} className="size-4" />
          {state?.published ? "Published" : "Publish"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">
            Publish this as a public page
          </DialogTitle>
          <DialogDescription>
            Turn this search into a page anyone can read and search engines can
            find. You can take it offline at any time.
          </DialogDescription>
        </DialogHeader>

        {failed ? (
          <p className="text-sm text-destructive" role="alert">
            Could not load your page settings. Close this and try again.
          </p>
        ) : !state ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : state.taken_down ? (
          <p className="text-sm text-destructive" role="alert">
            This page was taken down after a review and cannot be published
            again. Contact us if you think that was a mistake.
          </p>
        ) : !state.eligible ? (
          <p className="text-sm text-muted-foreground">{state.reason}</p>
        ) : (
          <div className="space-y-5">
            <div className="space-y-2 border bg-muted/40 p-3 text-sm">
              <p className="font-medium">What becomes public</p>
              <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                <li>Your idea and the {shown} names you leave on the page</li>
                <li>
                  Each name&apos;s score and its domain, handle and chatbot
                  checks
                </li>
                <li>The name you choose below (or &ldquo;A founder&rdquo;)</li>
              </ul>
              <p className="text-muted-foreground">
                Your email is never shown.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pub-title">Page title</Label>
              <Input
                id="pub-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={140}
                placeholder={query}
              />
              <p className="text-xs text-muted-foreground">
                This is the headline people see in search results. Leave it
                empty to use your original idea.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pub-author">How you appear</Label>
              <Input
                id="pub-author"
                value={author}
                onChange={(event) => setAuthor(event.target.value)}
                maxLength={60}
                placeholder={state.default_author_name ?? "A founder"}
              />
              <p className="text-xs text-muted-foreground">
                Empty publishes as &ldquo;A founder&rdquo;.
              </p>
              {state.has_avatar ? (
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={showAvatar}
                    onCheckedChange={(value) => setShowAvatar(value === true)}
                  />
                  Show my profile picture
                </label>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pub-note">Your note (optional)</Label>
              <Textarea
                id="pub-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                maxLength={800}
                rows={3}
                placeholder="Why this idea? What are you hoping to find?"
              />
            </div>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">
                Names on the page ({shown} of {names.length})
              </legend>
              <ul className="grid gap-1.5 sm:grid-cols-2">
                {names.map((entry) => (
                  <li key={entry.id}>
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={!hidden.includes(entry.id)}
                        onCheckedChange={(value) =>
                          setHidden((current) =>
                            value === true
                              ? current.filter((id) => id !== entry.id)
                              : [...current, entry.id]
                          )
                        }
                      />
                      <span className="truncate">{entry.name}</span>
                    </label>
                  </li>
                ))}
              </ul>
              {shown < state.min_names ? (
                <p className="text-xs text-destructive">
                  Keep at least {state.min_names} names on the page.
                </p>
              ) : null}
            </fieldset>

            {state.published && state.path ? (
              <p className="flex flex-wrap items-center gap-3 text-sm">
                <Link
                  href={state.path}
                  target="_blank"
                  className="text-primary underline underline-offset-4"
                >
                  View your page
                </Link>
                <button
                  type="button"
                  onClick={() => void copy()}
                  className="text-muted-foreground underline underline-offset-4 hover:text-foreground"
                >
                  Copy link
                </button>
              </p>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => void publish()}
                disabled={saving || shown < state.min_names}
              >
                {saving
                  ? "Saving…"
                  : state.published
                    ? "Update page"
                    : "Publish page"}
              </Button>
              {state.published ? (
                <Button
                  variant="ghost"
                  onClick={() => void takeDown()}
                  disabled={saving}
                >
                  Take offline
                </Button>
              ) : null}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

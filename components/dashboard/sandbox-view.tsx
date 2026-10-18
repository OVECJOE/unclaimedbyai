"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  addManualIdea,
  generateIdeas,
  getSandbox,
  type SandboxDetail,
} from "@/lib/api"
import { toastApiError } from "@/lib/api-errors"
import IdeaCard from "@/components/dashboard/idea-card"
import SignalEditor from "@/components/dashboard/signal-editor"

const POLL_MS = 2500

/**
 * One sandbox: generate a batch, watch ideas stream in, then act on the
 * ones that catch you. Polling rather than a socket, because a run is
 * short and the page is not a chat.
 */
export default function SandboxView({
  sandbox: initial,
  sid,
}: {
  sandbox: SandboxDetail
  sid?: string
}) {
  const router = useRouter()
  const [sandbox, setSandbox] = useState<SandboxDetail>(initial)
  const [count, setCount] = useState(6)
  const [seed, setSeed] = useState("")
  const [generating, setGenerating] = useState(
    initial.run_status === "generating"
  )
  const [title, setTitle] = useState("")
  const [concept, setConcept] = useState("")
  const [adding, setAdding] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const signedIn = !sid

  const refresh = useCallback(async () => {
    try {
      const fresh = await getSandbox(initial.public_id, sid)
      setSandbox(fresh)
      setGenerating(fresh.run_status === "generating")
      return fresh
    } catch {
      return null
    }
  }, [initial.public_id, sid])

  // Poll while a run is going, and stop the moment it is not, so a page
  // left open does not poll forever.
  useEffect(() => {
    if (!generating) return
    let cancelled = false
    async function tick() {
      const fresh = await refresh()
      if (cancelled) return
      if (fresh && fresh.run_status !== "generating") {
        setGenerating(false)
        if (fresh.run_status === "failed" && fresh.run_error) {
          toast.error(fresh.run_error)
        }
        return
      }
      timer.current = setTimeout(() => void tick(), POLL_MS)
    }
    timer.current = setTimeout(() => void tick(), POLL_MS)
    return () => {
      cancelled = true
      if (timer.current) clearTimeout(timer.current)
    }
  }, [generating, refresh])

  async function run() {
    setGenerating(true)
    try {
      await generateIdeas(
        initial.public_id,
        {
          count,
          seed: seed.trim() || undefined,
          anon_session_id: sid,
        },
        sid
      )
      await refresh()
    } catch (error) {
      setGenerating(false)
      toastApiError(error, "Could not start a run.")
    }
  }

  async function addIdea() {
    if (!title.trim() || !concept.trim()) {
      toast.error("An idea needs a title and a concept.")
      return
    }
    setAdding(true)
    try {
      await addManualIdea(
        initial.public_id,
        {
          title: title.trim(),
          concept: concept.trim(),
        },
        sid
      )
      setTitle("")
      setConcept("")
      await refresh()
    } catch (error) {
      toastApiError(error, "Could not add the idea.")
    } finally {
      setAdding(false)
    }
  }

  const ideas = sandbox.ideas ?? []

  return (
    <section className="px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="font-heading text-4xl font-semibold">
            {sandbox.name}
          </h1>
          {signedIn ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
            >
              All sandboxes
            </Button>
          ) : null}
        </div>

        {signedIn ? <SignalEditor sandbox={sandbox} onSaved={refresh} /> : null}

        <div className="border p-5">
          <p className="font-heading text-xl font-semibold">Generate ideas</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Four studios argue from different angles and a judge keeps the
            strongest, so a batch spreads rather than repeats.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]">
            <div className="space-y-1.5">
              <Label htmlFor="gen-seed">Steer this run (optional)</Label>
              <Input
                id="gen-seed"
                value={seed}
                onChange={(event) => setSeed(event.target.value)}
                placeholder="Something in fintech, or leave it open"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gen-count">Ideas</Label>
              <select
                id="gen-count"
                value={count}
                onChange={(event) => setCount(Number(event.target.value))}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              >
                {[4, 5, 6, 7, 8].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Button
            className="mt-4"
            disabled={generating}
            onClick={() => void run()}
          >
            {generating ? "Generating..." : "Generate ideas"}
          </Button>
        </div>

        {ideas.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No ideas yet. Generate a batch, or add one you already have.
          </p>
        ) : (
          <ul className="space-y-3">
            {ideas.map((idea) => (
              <IdeaCard
                key={idea.public_id}
                idea={idea}
                sid={sid}
                onChange={() => void refresh()}
              />
            ))}
          </ul>
        )}

        <div className="border p-5">
          <p className="font-heading text-xl font-semibold">Add by hand</p>
          <p className="mt-1 text-sm text-muted-foreground">
            An idea you already have works exactly like a generated one.
          </p>
          <div className="mt-4 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="idea-title">Title</Label>
              <Input
                id="idea-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Sourdough subscriptions"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="idea-concept">Concept</Label>
              <Textarea
                id="idea-concept"
                value={concept}
                onChange={(event) => setConcept(event.target.value)}
                placeholder="Weekly starter kits for people who want fresh bread without the fuss."
                className="min-h-20"
              />
            </div>
            <Button disabled={adding} onClick={() => void addIdea()}>
              {adding ? "Adding..." : "Add idea"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

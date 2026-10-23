"use client"

import { useState, useEffect, useRef } from "react"
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
import { ApiError } from "@/lib/api"
import { track } from "@/lib/analytics"
import { playSound } from "@/lib/sound/engine"
import { useTurnstile } from "@/components/public/turnstile"

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
  sid,
  onChange,
}: {
  idea: Idea
  sid?: string
  onChange: () => void
}) {
  const router = useRouter()
  const [research, setResearch] = useState<Research | null>(null)
  const [busy, setBusy] = useState(false)
  const [polling, setPolling] = useState(false)
  // Anonymous name searches are turnstile-gated spends; the widget
  // rides along here so a returning session can always solve one.
  const turnstile = useTurnstile("anonymous_check")
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  })

  useEffect(() => {
    if (!polling) return
    let cancelled = false
    let attempts = 0
    const id = setInterval(() => {
      attempts += 1
      if (attempts > 40) {
        setPolling(false)
        return
      }
      void getResearch(idea.public_id)
        .then((fresh) => {
          if (cancelled || !fresh) return
          if (fresh.status === "ready") {
            setPolling(false)
            setResearch(fresh)
            onChangeRef.current()
            // Paid work landing: the reward timbre, seeded by the idea
            // so every idea's research sounds like itself.
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

  function searchDestination(searchId: number): string {
    return sid
      ? `/results/${searchId}?sid=${encodeURIComponent(sid)}`
      : `/dashboard/history/${searchId}`
  }

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
        setPolling(true)
        return
      }
      if (current.status === "generating") {
        setPolling(true)
        return
      }
      setResearch(current)
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        // Research is an account feature; the public sandbox shows the
        // button, so the refusal has to say what unlocks it.
        toast.error(
          "Market research runs on your account. Sign in to start it.",
          {
            action: {
              label: "Sign in",
              onClick: () =>
                router.push(
                  `/auth?next=${encodeURIComponent(window.location.pathname)}`
                ),
            },
          }
        )
        return
      }
      toastApiError(error, "Research could not start.")
    } finally {
      setBusy(false)
    }
  }

  async function toSearch() {
    setBusy(true)
    try {
      if (idea.search_id) {
        router.push(searchDestination(idea.search_id))
        return
      }
      const search = await turnstile.verify(
        (token) =>
          createSearch({
            query: `${idea.title}. ${idea.concept}`,
            ...(sid ? { anon_session_id: sid } : {}),
            idea_id: idea.public_id,
            cf_turnstile_token: token,
          }),
        { waitMs: 30000 }
      )
      if (!search) {
        toast.error("The human check did not finish. Try again.")
        return
      }
      router.push(searchDestination(search.id))
    } catch (error) {
      toastApiError(error, "Could not start the search.")
    } finally {
      setBusy(false)
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
        <Button
          size="sm"
          disabled={busy || polling}
          onClick={() => void openResearch()}
        >
          {polling
            ? "Researching…"
            : idea.status === "researched"
              ? "Read research"
              : "Run research · 3 credits"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => void toSearch()}
        >
          Search names
        </Button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Research returns competitors, demand, audience channels, and how it
        earns — 3 credits. Searches use your monthly allowance first, then 2
        credits each.
      </p>
      {sid ? turnstile.widget : null}
    </li>
  )
}

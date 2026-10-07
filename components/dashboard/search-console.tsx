"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  ApiError,
  claimSearches,
  createName,
  createSearch,
  generateNames,
  runCheck,
  type ApiUser,
  type CheckReport as Report,
  type NameCandidate,
} from "@/lib/api"
import CheckReport from "./check-report"

const ANON_KEY = "uba-anon-id"

type Phase =
  | { step: "idle" }
  | { step: "generating" }
  | { step: "candidates"; searchId: number; searchesLeft?: number }
  | { step: "checking"; name: string }
  | { step: "done" }

export default function SearchConsole({ user }: { user: ApiUser }) {
  const [brief, setBrief] = useState("")
  const [candidates, setCandidates] = useState<NameCandidate[]>([])
  const [phase, setPhase] = useState<Phase>({ step: "idle" })
  const [report, setReport] = useState<Report | null>(null)
  const [error, setError] = useState<string | null>(null)
  const claimed = useRef(false)

  useEffect(() => {
    if (claimed.current) return
    const id = localStorage.getItem(ANON_KEY)
    if (!id) return
    claimed.current = true
    claimSearches(id)
      .then(() => localStorage.removeItem(ANON_KEY))
      .catch(() => {
        claimed.current = false
      })
  }, [])

  async function onGenerate(event: React.FormEvent) {
    event.preventDefault()
    if (!brief.trim()) return
    setError(null)
    setReport(null)
    setCandidates([])
    setPhase({ step: "generating" })
    try {
      const [generated, search] = await Promise.all([
        generateNames(brief.trim()),
        createSearch({ query: brief.trim() }),
      ])
      setCandidates(generated.candidates)
      setPhase({
        step: "candidates",
        searchId: search.id,
        searchesLeft: search.searches_left,
      })
    } catch (error) {
      setPhase({ step: "idle" })
      setError(
        error instanceof ApiError
          ? error.message
          : "Something went wrong. Try again."
      )
    }
  }

  async function onCheck(searchId: number, name: string) {
    setError(null)
    setReport(null)
    setPhase({ step: "checking", name })
    try {
      const created = await createName(searchId, { name })
      const result = await runCheck(created.id, {})
      setReport(result)
      setPhase({ step: "done" })
    } catch (error) {
      setPhase({ step: "candidates", searchId })
      setError(
        error instanceof ApiError
          ? error.message
          : "The check failed. Try again in a moment."
      )
    }
  }

  const checking = phase.step === "checking"
  const activeSearchId =
    phase.step === "candidates" ||
    phase.step === "checking" ||
    phase.step === "done"
      ? (phase as { searchId?: number }).searchId
      : undefined

  return (
    <div className="mx-auto max-w-prose space-y-6">
      <form onSubmit={onGenerate}>
        <div className="relative border border-border bg-card p-3 transition-colors focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15 dark:border-primary/30 dark:bg-secondary/40">
          <Textarea
            rows={2}
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            aria-label="Describe what you're building"
            placeholder="Describe what you're building…"
            className="min-h-16 resize-none border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
          />
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">
              {user.searches_left} searches left
            </span>
            <Button
              type="submit"
              disabled={!brief.trim() || phase.step === "generating"}
            >
              {phase.step === "generating" ? "Generating…" : "Generate names"}
            </Button>
          </div>
        </div>
      </form>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {candidates.length && activeSearchId ? (
        <div className="space-y-2">
          <h3 className="font-heading text-xl">Candidates</h3>
          <ul className="divide-y divide-border border-y">
            {candidates.map((candidate) => (
              <li
                key={candidate.name}
                className="flex flex-wrap items-center justify-between gap-2 py-2"
              >
                <div>
                  <p className="font-medium">{candidate.name}</p>
                  {candidate.rationale ? (
                    <p className="text-sm text-muted-foreground">
                      {candidate.rationale}
                    </p>
                  ) : null}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={checking}
                  onClick={() => void onCheck(activeSearchId, candidate.name)}
                >
                  {checking ? "Checking…" : "Check"}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {checking && phase.step === "checking" ? (
        <p className="text-sm text-muted-foreground">
          Checking {phase.name} across domains, handles, and AI models. This can
          take up to a minute…
        </p>
      ) : null}

      {report ? <CheckReport report={report} /> : null}
    </div>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type ActionResult = {
  label: string
  status: number | null
  body: unknown
}

type Action = "check" | "balance" | "checked"

const ACTIONS: { id: Action; label: string; blurb: string }[] = [
  {
    id: "check",
    label: "Check a name",
    blurb: "Runs the free first check on one exact name, then polls it live.",
  },
  {
    id: "balance",
    label: "Account balance",
    blurb: "Reads your searches and report credits through GET /me.",
  },
  {
    id: "checked",
    label: "Recent checks",
    blurb: "Lists your checked names with scores through GET /names/checked.",
  },
]

async function apiCall(
  path: string,
  key: string,
  init?: RequestInit
): Promise<{ status: number; json: unknown }> {
  const res = await fetch(`/api/v1${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      ...(init?.headers ?? {}),
    },
  })
  let json: unknown = null
  try {
    json = await res.json()
  } catch {
    json = null
  }
  return { status: res.status, json }
}

/**
 * Live playground against the real API with the visitor's own key.
 * The key lives in component state only: it is sent to the API with
 * each request and never stored or logged anywhere else.
 */
export default function ApiSandbox() {
  const [key, setKey] = useState("")
  const [action, setAction] = useState<Action>("check")
  const [name, setName] = useState("")
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<ActionResult | null>(null)
  const [liveNote, setLiveNote] = useState<string | null>(null)

  const ready = key.trim().startsWith("uba_live_") && !running

  async function run() {
    setRunning(true)
    setResult(null)
    setLiveNote(null)
    const trimmedKey = key.trim()
    try {
      if (action === "balance") {
        const res = await apiCall("/me", trimmedKey)
        setResult({ label: "GET /api/v1/me", status: res.status, body: res.json })
      } else if (action === "checked") {
        const res = await apiCall("/names/checked?page=1&page_size=5", trimmedKey)
        setResult({
          label: "GET /api/v1/names/checked",
          status: res.status,
          body: res.json,
        })
      } else {
        const created = await apiCall("/checks/direct", trimmedKey, {
          method: "POST",
          body: JSON.stringify({ name: name.trim() }),
        })
        const searchId = (created.json as { search_id?: number } | null)?.search_id
        if (created.status !== 202 || !searchId) {
          setResult({
            label: "POST /api/v1/checks/direct",
            status: created.status,
            body: created.json,
          })
          return
        }
        setResult({
          label: "POST /api/v1/checks/direct",
          status: created.status,
          body: created.json,
        })
        // Poll the live results so the sandbox shows the check itself,
        // exactly like the product's own results page does.
        for (let attempt = 0; attempt < 12; attempt += 1) {
          await new Promise((resolve) => setTimeout(resolve, 1500))
          const polled = await apiCall(`/searches/${searchId}/results`, trimmedKey)
          const body = polled.json as
            | { items?: unknown[]; pending?: { job?: { snapshot?: unknown } }[] }
            | null
          if (body?.items?.length) {
            setLiveNote("Check complete")
            setResult({
              label: `GET /api/v1/searches/${searchId}/results`,
              status: polled.status,
              body: polled.json,
            })
            return
          }
          setLiveNote(
            `Checking… attempt ${attempt + 1} of 12, live data as it arrives`
          )
        }
      }
    } catch {
      setResult({
        label: "request",
        status: null,
        body: { error: "The API could not be reached from this page." },
      })
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="space-y-4 border p-4 sm:p-6">
      <div className="space-y-1">
        <p className="text-sm font-semibold">Try it with your own key</p>
        <p className="max-w-prose text-sm text-muted-foreground">
          Paste an API key from your account and run real requests from this
          page. The key stays in this browser tab only, goes straight to our
          API with each request, and is never stored.
        </p>
      </div>

      <div className="max-w-xl space-y-1">
        <Label htmlFor="sandbox-key">API key</Label>
        <Input
          id="sandbox-key"
          type="password"
          value={key}
          onChange={(event) => setKey(event.target.value)}
          placeholder="uba_live_..."
          autoComplete="off"
          className="font-mono text-xs"
        />
        {!key.trim().startsWith("uba_live_") ? (
          <p className="text-xs text-muted-foreground">
            Keys are created in the API tab of your account page.
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Sandbox action">
        {ACTIONS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            aria-pressed={action === entry.id}
            onClick={() => {
              setAction(entry.id)
              setResult(null)
              setLiveNote(null)
            }}
            className={cn(
              "border px-2.5 py-1.5 text-xs font-medium backdrop-blur-sm transition-colors",
              action === entry.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background/80 text-foreground hover:border-primary/50 hover:text-primary"
            )}
          >
            {entry.label}
          </button>
        ))}
      </div>

      {action === "check" ? (
        <div className="max-w-xl space-y-1">
          <Label htmlFor="sandbox-name">Name to check</Label>
          <Input
            id="sandbox-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nexuare"
            maxLength={60}
          />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          disabled={
            !ready || (action === "check" && name.trim().length < 2)
          }
          onClick={() => void run()}
        >
          {running ? "Running…" : "Run request"}
        </Button>
        <p className="text-xs text-muted-foreground">
          {ACTIONS.find((entry) => entry.id === action)?.blurb}
        </p>
      </div>

      {liveNote ? (
        <p className="text-sm text-primary" role="status">
          {liveNote}
        </p>
      ) : null}

      {result ? (
        <div className="space-y-2">
          <p className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <span
              className={cn(
                "border px-1.5 py-0.5 font-semibold",
                result.status && result.status < 400
                  ? "border-green-600/40 text-green-700 dark:text-green-400"
                  : "border-destructive/40 text-destructive"
              )}
            >
              {result.status ?? "network error"}
            </span>
            <span className="text-muted-foreground">{result.label}</span>
          </p>
          <pre className="overflow-x-auto border bg-muted/40 p-4 font-mono text-xs leading-relaxed">
            {JSON.stringify(result.body, null, 2)}
          </pre>
        </div>
      ) : null}
    </div>
  )
}

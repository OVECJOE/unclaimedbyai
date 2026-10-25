import { useEffect, useRef, useState } from "react"
import { ApiError } from "@/lib/api"
import { playSound } from "@/lib/sound/engine"
import { TierBadge } from "@/components/tier-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Logo from "./Logo"
import {
  SITE,
  classifyText,
  getSelectionHandoff,
  loadApiKey,
  saveApiKey,
  screenName,
  syncNotifications,
  type ScreenResult,
  type TextKind,
  type Verdict,
} from "./api"

type Phase = "loading" | "setup" | "intake" | "result"

const KINDS: { kind: TextKind; label: string }[] = [
  { kind: "name", label: "Name" },
  { kind: "idea", label: "Idea" },
  { kind: "rough", label: "Rough" },
]

function openTab(url: string): void {
  void chrome.tabs.create({ url })
}

function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return "That key was rejected. Copy it again from Account → API keys."
    if (error.status === 429) {
      return error.retryAfter
        ? `Rate-limited. Try again in ${error.retryAfter}s.`
        : "Rate-limited. Try again in a moment."
    }
    return error.message
  }
  return error instanceof Error ? error.message : "Something went wrong."
}

export default function App() {
  const [phase, setPhase] = useState<Phase>("loading")
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [keyDraft, setKeyDraft] = useState("")
  const [text, setText] = useState("")
  const [override, setOverride] = useState<{ for: string; kind: TextKind } | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ScreenResult | null>(null)
  const [notices, setNotices] = useState(0)
  const [verdict, setVerdict] = useState<Verdict | null>(null)
  const [classifying, setClassifying] = useState(false)
  const [classifyFailed, setClassifyFailed] = useState(false)
  const classifySeqRef = useRef(0)

  // Mount: key, then the context-menu handoff, then the watch badge's
  // first sync (which also proves the key still works).
  useEffect(() => {
    let alive = true
    void (async () => {
      const key = await loadApiKey()
      if (!alive) return
      setApiKey(key)
      if (!key) {
        setPhase("setup")
        return
      }
      const handoff = await getSelectionHandoff()
      if (!alive) return
      if (handoff.selection) setText(handoff.selection)
      try {
        const fresh = await syncNotifications(key)
        if (!alive) return
        setNotices(fresh.length)
        if (fresh.length > 0) void chrome.action.setBadgeText({ text: "" })
      } catch {
        // The badge keeps whatever the alarm last wrote.
      }
      setPhase("intake")
    })()
    return () => {
      alive = false
    }
  }, [])

  // Model-backed triage: one call per settled text (900 ms of quiet —
  // never per keystroke; every call spends the house classifier model
  // and the server also spends it under the LLM POST rate cap), and
  // none at all once the user has overruled it with a chip. A seq
  // counter discards answers that arrive after newer text landed.
  useEffect(() => {
    const trimmed = text.trim()
    const overridden = override !== null && override.for === text
    const timer = setTimeout(() => {
      if (!apiKey || trimmed.length < 3 || overridden) {
        setVerdict(null)
        setClassifying(false)
        setClassifyFailed(false)
        return
      }
      const seq = ++classifySeqRef.current
      setClassifying(true)
      setClassifyFailed(false)
      classifyText(trimmed, apiKey)
        .then((next) => {
          if (classifySeqRef.current !== seq) return
          setVerdict(next)
          setClassifying(false)
        })
        .catch(() => {
          if (classifySeqRef.current !== seq) return
          setVerdict(null)
          setClassifying(false)
          setClassifyFailed(true)
        })
    }, 900)
    return () => clearTimeout(timer)
  }, [text, override, apiKey])

  const overridden = override !== null && override.for === text
  const kind: TextKind = overridden
    ? override.kind
    : (verdict?.kind ?? "name")
  const reason = text.trim().length === 0
    ? "Nothing to read yet."
    : overridden
      ? "Overruled — your call."
      : classifying
        ? "Reading it…"
        : verdict
          ? verdict.reason
          : classifyFailed
            ? "Couldn't reach the classifier — pick a mode below."
            : "Pick a mode if you'd rather not wait."

  async function saveKey(): Promise<void> {
    const key = keyDraft.trim()
    if (!key) return
    if (!key.startsWith("uba_live_")) {
      setError("Keys look like uba_live_… — copy the whole thing.")
      return
    }
    setPending(true)
    setError(null)
    try {
      await syncNotifications(key) // 200 proves the key, whatever the count
      await saveApiKey(key)
      setApiKey(key)
      setKeyDraft("")
      setPhase("intake")
      playSound("reward", "extension-key-saved")
    } catch (caught) {
      await saveApiKey(null)
      setError(errorMessage(caught))
      playSound("error", "extension-key-rejected")
    } finally {
      setPending(false)
    }
  }

  async function screen(): Promise<void> {
    if (!apiKey || pending) return
    // Lists screen their first item — the model says which, and the
    // reason line says so before the button is ever pressed.
    const name = (verdict?.screenAs ?? text).trim()
    if (!name) return
    setPending(true)
    setError(null)
    playSound("launch", `extension-screen:${name}`)
    try {
      const outcome = await screenName(name, apiKey)
      setResult(outcome)
      setPhase("result")
      if (outcome.item) {
        playSound("reveal", `extension-result:${outcome.item.name}`)
      } else if (outcome.timedOut) {
        playSound("complete", "extension-result-timeout")
      } else {
        playSound("error", "extension-result-failed")
      }
    } catch (caught) {
      setError(errorMessage(caught))
      playSound("error", `extension-screen-error:${name}`)
      if (caught instanceof ApiError && caught.status === 401) {
        await saveApiKey(null)
        setApiKey(null)
        setPhase("setup")
      }
    } finally {
      setPending(false)
    }
  }

  function routeToStudio(): void {
    const brief = encodeURIComponent(text.trim().slice(0, 400))
    const mode = kind === "rough" ? "studio" : "idea"
    playSound("launch", `extension-route:${mode}:${brief}`)
    openTab(`${SITE}/?mode=${mode}&brief=${brief}`)
  }

  function reset(): void {
    setResult(null)
    setText("")
    setOverride(null)
    setError(null)
    setPhase("intake")
  }

  /* ------------------------------------------------------------------ setup */

  if (phase === "setup") {
    return (
      <main className="flex min-h-screen flex-col gap-6 p-6">
        <Header />
        <section className="space-y-4">
          <h1 className="font-heading text-2xl font-semibold">
            Point it at your key.
          </h1>
          <p className="text-sm text-muted-foreground">
            The panel checks through your account: one key, pasted once,
            revocable anytime. Your first check on any name is free, exactly
            like on the site.
          </p>
          <div className="space-y-2">
            <Input
              value={keyDraft}
              onChange={(event) => setKeyDraft(event.target.value)}
              placeholder="uba_live_…"
              spellCheck={false}
              autoComplete="off"
              aria-label="API key"
              onKeyDown={(event) => {
                if (event.key === "Enter") void saveKey()
              }}
            />
            {error ? (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            ) : null}
            <Button
              className="w-full"
              disabled={pending || keyDraft.trim().length === 0}
              onClick={() => void saveKey()}
            >
              {pending ? "Checking…" : "Save key"}
            </Button>
            <button
              type="button"
              className="w-full text-center text-xs text-muted-foreground underline"
              onClick={() => openTab(`${SITE}/dashboard/account`)}
            >
              Where do I get a key?
            </button>
          </div>
        </section>
      </main>
    )
  }

  /* ----------------------------------------------------------------- result */

  if (phase === "result" && result) {
    const item = result.item
    return (
      <main className="flex min-h-screen flex-col gap-6 p-6">
        <Header notices={notices} />
        {item ? (
          <section className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-3xl font-semibold">
                {item.name}
              </h1>
              <TierBadge tier={item.tier} />
            </div>
            <p className="font-heading text-5xl font-semibold">
              {item.score}
              <span className="text-base font-normal text-muted-foreground">
                /100
              </span>
            </p>

            <Verdict
              label="Domains"
              parts={item.domains.map((d) => ({ key: d.tld, ok: d.available, text: d.tld }))}
            />
            <Verdict
              label="Handles"
              parts={item.socials.map((s) => ({
                key: s.platform,
                ok: s.available,
                text: s.platform,
              }))}
            />
            <div className="space-y-1">
              <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                AI associations
              </p>
              <p className="text-sm">
                {item.aiAssociation || "Nothing meaningful came back."}
              </p>
            </div>

            {result.timedOut ? (
              <p className="text-sm text-muted-foreground">
                Still running — open the full report to watch them land.
              </p>
            ) : null}
            {result.failed ? (
              <p className="text-sm text-destructive">
                Some checks ran into a wall. The report lets you retry them.
              </p>
            ) : null}

            <div className="flex flex-col gap-2">
              <Button
                onClick={() => openTab(`${SITE}/results/${result.searchId}`)}
              >
                Open full report
              </Button>
              <Button variant="outline" onClick={reset}>
                Check another
              </Button>
            </div>
          </section>
        ) : (
          <section className="space-y-4">
            <h1 className="font-heading text-2xl font-semibold">
              Nothing to show yet.
            </h1>
            <p className="text-sm text-muted-foreground">
              The checks either failed or are still in flight — the full
              report has them.
            </p>
            <div className="flex flex-col gap-2">
              <Button onClick={() => openTab(`${SITE}/results/${result.searchId}`)}>
                Open full report
              </Button>
              <Button variant="outline" onClick={reset}>
                Check another
              </Button>
            </div>
          </section>
        )}
      </main>
    )
  }

  /* ----------------------------------------------------------------- intake */

  return (
    <main className="flex min-h-screen flex-col gap-6 p-6">
      <Header notices={notices} />
      {phase === "loading" ? (
        <p className="text-sm text-muted-foreground">Waking up…</p>
      ) : (
        <section className="space-y-4">
          <Textarea
            value={text}
            onChange={(event) => {
              setText(event.target.value)
              setError(null)
            }}
            placeholder="Paste or highlight anything — a name, an idea, a half-thought."
            rows={4}
            aria-label="Text to screen or develop"
          />

          <div className="space-y-2">
            <div className="flex gap-2">
              {KINDS.map((option) => (
                <Button
                  key={option.kind}
                  size="sm"
                  variant={kind === option.kind ? "default" : "outline"}
                  aria-pressed={kind === option.kind}
                  onClick={() => setOverride({ for: text, kind: option.kind })}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{reason}</p>
          </div>

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}

          {kind === "name" ? (
            <Button
              className="w-full"
              disabled={pending || text.trim().length === 0}
              onClick={() => void screen()}
            >
              {pending ? "Screening…" : "Screen it"}
            </Button>
          ) : (
            <>
              <Button className="w-full" onClick={routeToStudio}>
                {kind === "rough" ? "Shape it in the studio" : "Name it with the studios"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Opens unclaimedbyai.com with your text prefilled.
              </p>
            </>
          )}

          {notices > 0 ? (
            <button
              type="button"
              className="block w-full"
              onClick={() =>
                openTab(`${SITE}/dashboard/playground/watchlist`)
              }
            >
              <Badge className="w-full justify-center">
                {notices} new watch {notices === 1 ? "event" : "events"}
              </Badge>
            </button>
          ) : null}
        </section>
      )}
    </main>
  )
}

function Header({ notices = 0 }: { notices?: number }) {
  return (
    <header className="flex items-center justify-between gap-3 border-b pb-4">
      <Logo />
      {notices > 0 ? (
        <span className="text-xs text-muted-foreground">
          {notices} unseen
        </span>
      ) : null}
    </header>
  )
}

function Verdict({
  label,
  parts,
}: {
  label: string
  parts: { key: string; ok: boolean; text: string }[]
}) {
  if (parts.length === 0) return null
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {parts.map((part) => (
          <span
            key={part.key}
            className={
              "border px-1.5 py-0.5 font-mono text-xs " +
              (part.ok ? "text-green-600" : "text-red-600")
            }
          >
            {part.text} {part.ok ? "free" : "taken"}
          </span>
        ))}
      </div>
    </div>
  )
}

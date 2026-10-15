"use client"

import { useMemo, useState } from "react"
import { useTheme } from "next-themes"
import { Highlight, themes, Prism } from "prism-react-renderer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

// Register JSON and bash grammars on the shared Prism instance; the
// dynamic imports cannot hoist above this assignment.
const globalScope = globalThis as { Prism?: typeof Prism }
if (!globalScope.Prism) globalScope.Prism = Prism
void import("prismjs/components/prism-json")
void import("prismjs/components/prism-bash")

type SandboxEndpoint = {
  id: string
  method: "GET" | "POST"
  path: string
  label: string
  detail: string
  body?: string
  queries?: string[]
  noAuth?: boolean
}

/**
 * The documented surface, nothing more: endpoints a key holder actually
 * calls, with the internal browser plumbing (turnstile tokens, anonymous
 * sessions) deliberately absent.
 */
const ENDPOINTS: SandboxEndpoint[] = [
  {
    id: "me",
    method: "GET",
    path: "/me",
    label: "Read your balance",
    detail: "Remaining searches and report credits for your account.",
  },
  {
    id: "direct",
    method: "POST",
    path: "/checks/direct",
    label: "Check one exact name",
    detail:
      "Queues the free first check on a name and returns a search to poll.",
    body: '{\n  "name": "Nexuare"\n}',
  },
  {
    id: "generate",
    method: "POST",
    path: "/searches/generate",
    label: "Generate names from a brief",
    detail:
      "The full pipeline: studios, judge, .com screening, then checks. Poll the header until ready.",
    body: '{\n  "query": "a budgeting app for creatives",\n  "count": 12\n}',
  },
  {
    id: "add-name",
    method: "POST",
    path: "/searches/{search_id}/names",
    label: "Add a name to a search",
    detail: "Attach a name to an existing search before checking it.",
    body: '{\n  "name": "Vantle"\n}',
  },
  {
    id: "run-check",
    method: "POST",
    path: "/names/{name_id}/checks",
    label: "Run a check on one name",
    detail: "Free on the first attempt, then one report credit.",
    body: '{\n  "tlds": ["com", "ai"],\n  "platforms": ["github", "x"]\n}',
  },
  {
    id: "check-all",
    method: "POST",
    path: "/searches/{search_id}/check-all",
    label: "Check every unchecked name",
    detail: "Queues checks for a whole search at once.",
    body: '{\n  "tlds": ["com", "ai"],\n  "platforms": ["github", "x"]\n}',
  },
  {
    id: "header",
    method: "GET",
    path: "/searches/{search_id}/header",
    label: "Poll generation progress",
    detail: "Status, progress, and the sharpened brief while names generate.",
  },
  {
    id: "results",
    method: "GET",
    path: "/searches/{search_id}/results",
    label: "Poll results",
    detail:
      "Scored names in items, plus live partial data in pending while checks run.",
    queries: ["available_only", "sort", "q"],
  },
  {
    id: "checked",
    method: "GET",
    path: "/names/checked",
    label: "List your checked names",
    detail: "Newest check per name with score and tier, filtered and paged.",
    queries: ["q", "watched", "tier", "sort", "page", "page_size"],
  },
  {
    id: "report",
    method: "GET",
    path: "/reports/{public_id}",
    label: "Fetch a full report",
    detail: "A complete report snapshot. Public, no key needed.",
    noAuth: true,
  },
  {
    id: "watches",
    method: "GET",
    path: "/watches",
    label: "List your watchlist",
    detail: "Watched names with status, events, and slot usage.",
    queries: ["q", "status", "page", "page_size"],
  },
  {
    id: "watch-add",
    method: "POST",
    path: "/watches",
    label: "Start watching a name",
    detail: "Free rechecking every few hours, with email alerts.",
    body: '{\n  "search_id": 123,\n  "name": "Nexuare"\n}',
  },
  {
    id: "sweep",
    method: "POST",
    path: "/watches/{watch_id}/sweep",
    label: "Recheck a watch now",
    detail: "Runs a sweep immediately instead of waiting for the cycle.",
  },
  {
    id: "packs",
    method: "GET",
    path: "/packs",
    label: "List credit packs",
    detail: "Packs and prices. Public, no key needed.",
    noAuth: true,
  },
  {
    id: "orders",
    method: "GET",
    path: "/orders",
    label: "List your orders",
    detail: "Purchase history with receipt links.",
  },
]

function pathParamsOf(path: string): string[] {
  return [...path.matchAll(/\{(\w+)\}/g)].map((match) => match[1])
}

/**
 * A real browser playground: pick any documented endpoint, edit its
 * path params, query params, and JSON body, and send the request to
 * production from this tab. The key never leaves the browser.
 */
export default function ApiSandbox() {
  const { theme } = useTheme()
  const [key, setKey] = useState("")
  const [selected, setSelected] = useState<SandboxEndpoint>(ENDPOINTS[1])
  const [pathValues, setPathValues] = useState<Record<string, string>>({})
  const [queryValues, setQueryValues] = useState<Record<string, string>>({})
  const [body, setBody] = useState(ENDPOINTS[1].body ?? "")
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{
    status: number | null
    ms: number
    body: unknown
  } | null>(null)

  const params = useMemo(() => pathParamsOf(selected.path), [selected])
  const bodyInvalid = useMemo(() => {
    if (!body.trim()) return false
    try {
      JSON.parse(body)
      return false
    } catch {
      return true
    }
  }, [body])
  const codeTheme = theme === "dark" ? themes.nightOwl : themes.github

  function pick(endpoint: SandboxEndpoint) {
    setSelected(endpoint)
    setPathValues({})
    setQueryValues({})
    setBody(endpoint.body ?? "")
    setResult(null)
  }

  function resolvedPath(): string {
    let path = selected.path
    for (const param of params) {
      path = path.replace(
        `{${param}}`,
        encodeURIComponent(pathValues[param] ?? "")
      )
    }
    const query = new URLSearchParams(
      Object.entries(queryValues).filter(([, value]) => value !== "")
    ).toString()
    return query ? `${path}?${query}` : path
  }

  async function send() {
    setSending(true)
    setResult(null)
    const started = performance.now()
    try {
      const res = await fetch(`/api/v1${resolvedPath()}`, {
        method: selected.method,
        headers: {
          ...(selected.body || body
            ? { "Content-Type": "application/json" }
            : {}),
          ...(selected.noAuth || !key.trim()
            ? {}
            : { Authorization: `Bearer ${key.trim()}` }),
        },
        body: selected.method === "POST" && body.trim() ? body : undefined,
      })
      let parsed: unknown = null
      try {
        parsed = await res.json()
      } catch {
        parsed = null
      }
      setResult({
        status: res.status,
        ms: Math.round(performance.now() - started),
        body: parsed ?? { note: "Response carried no JSON body." },
      })
    } catch {
      setResult({
        status: null,
        ms: Math.round(performance.now() - started),
        body: { error: "The API could not be reached from this page." },
      })
    } finally {
      setSending(false)
    }
  }

  const needsKey = !selected.noAuth

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="sandbox-key">Your API key</Label>
        <Input
          id="sandbox-key"
          type="password"
          value={key}
          onChange={(event) => setKey(event.target.value)}
          placeholder="uba_live_..."
          autoComplete="off"
          className="max-w-md font-mono text-xs"
        />
        <p className="text-sm text-muted-foreground">
          Sent with each request below and stored nowhere. Create keys in the
          API tab of your account page.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
        <div
          role="listbox"
          aria-label="Endpoints"
          className="max-h-96 divide-y divide-border overflow-y-auto border"
        >
          {ENDPOINTS.map((endpoint) => (
            <button
              key={endpoint.id}
              type="button"
              role="option"
              aria-selected={selected.id === endpoint.id}
              onClick={() => pick(endpoint)}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2 text-left transition-colors",
                selected.id === endpoint.id
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-muted/50"
              )}
            >
              <span
                className={cn(
                  "w-11 shrink-0 border px-1 text-center font-mono text-[0.625rem] font-semibold",
                  endpoint.method === "GET"
                    ? "border-green-600/40 text-green-700 dark:text-green-400"
                    : "border-primary/40 text-primary"
                )}
              >
                {endpoint.method}
              </span>
              <span className="truncate font-mono text-xs">{endpoint.path}</span>
            </button>
          ))}
        </div>

        <div className="space-y-3 border p-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold">{selected.label}</p>
            <p className="text-sm text-muted-foreground">{selected.detail}</p>
          </div>

          {params.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {params.map((param) => (
                <div key={param} className="space-y-1">
                  <Label htmlFor={`param-${param}`} className="font-mono text-xs">
                    {param}
                  </Label>
                  <Input
                    id={`param-${param}`}
                    value={pathValues[param] ?? ""}
                    onChange={(event) =>
                      setPathValues((current) => ({
                        ...current,
                        [param]: event.target.value,
                      }))
                    }
                    placeholder="123"
                    className="font-mono text-xs"
                  />
                </div>
              ))}
            </div>
          ) : null}

          {selected.queries?.length ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {selected.queries.map((query) => (
                <div key={query} className="space-y-1">
                  <Label htmlFor={`query-${query}`} className="font-mono text-xs">
                    {query}
                  </Label>
                  <Input
                    id={`query-${query}`}
                    value={queryValues[query] ?? ""}
                    onChange={(event) =>
                      setQueryValues((current) => ({
                        ...current,
                        [query]: event.target.value,
                      }))
                    }
                    placeholder="optional"
                    className="font-mono text-xs"
                  />
                </div>
              ))}
            </div>
          ) : null}

          {selected.body !== undefined ? (
            <div className="space-y-1">
              <Label htmlFor="sandbox-body" className="font-mono text-xs">
                Request body
              </Label>
              <div className="relative min-h-[7rem] border bg-muted/40">
                <pre
                  aria-hidden="true"
                  className="overflow-x-auto p-3 font-mono text-xs leading-relaxed"
                >
                  <Highlight
                    theme={codeTheme}
                    code={body || " "}
                    language="json"
                  >
                    {({ style, tokens, getLineProps, getTokenProps }) => (
                      <code
                        style={{
                          ...style,
                          background: "transparent",
                          fontFamily: "inherit",
                        }}
                        className="block whitespace-pre-wrap"
                      >
                        {tokens.map((line, lineIndex) => (
                          <div key={lineIndex} {...getLineProps({ line })}>
                            {line.map((token, tokenIndex) => (
                              <span
                                key={tokenIndex}
                                {...getTokenProps({ token })}
                              />
                            ))}
                          </div>
                        ))}
                      </code>
                    )}
                  </Highlight>
                </pre>
                <Textarea
                  id="sandbox-body"
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  spellCheck={false}
                  wrap="soft"
                  className="absolute inset-0 resize-none border-0 bg-transparent p-3 font-mono text-xs leading-relaxed text-transparent caret-foreground shadow-none focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>
              {bodyInvalid ? (
                <p className="text-xs text-destructive">
                  This is not valid JSON yet. The request will fail as
                  written.
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <Button disabled={sending} onClick={() => void send()}>
              {sending ? "Sending…" : "Send request"}
            </Button>
            {needsKey && !key.trim() ? (
              <span className="text-xs text-muted-foreground">
                This endpoint requires a key above.
              </span>
            ) : null}
          </div>

          {result ? (
            <div className="space-y-2">
              <p className="font-mono text-xs">
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
                <span className="ml-2 text-muted-foreground">
                  {resolvedPath()} in {result.ms}ms
                </span>
              </p>
              <div className="max-h-80 overflow-auto border bg-muted/40 p-3">
                <Highlight
                  theme={codeTheme}
                  code={JSON.stringify(result.body, null, 2)}
                  language="json"
                >
                  {({ style, tokens, getLineProps, getTokenProps }) => (
                    <pre
                      className="font-mono text-xs leading-relaxed"
                      style={{ ...style, background: "transparent" }}
                    >
                      {tokens.map((line, lineIndex) => (
                        <div key={lineIndex} {...getLineProps({ line })}>
                          {line.map((token, tokenIndex) => (
                            <span
                              key={tokenIndex}
                              {...getTokenProps({ token })}
                            />
                          ))}
                        </div>
                      ))}
                    </pre>
                  )}
                </Highlight>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

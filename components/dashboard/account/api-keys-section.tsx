"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  createApiKey,
  listApiKeys,
  revokeApiKey,
  type ApiKeyItem,
} from "@/lib/api"
import { toastApiError } from "@/lib/api-errors"
import { formatDateTime } from "@/lib/utils"

function RevealPanel({
  rawKey,
  onDismiss,
}: {
  rawKey: string
  onDismiss: () => void
}) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(rawKey)
      setCopied(true)
      toast.success("Key copied.")
    } catch {
      toast.error("The key could not be copied. Select it and copy manually.")
    }
  }

  return (
    <div className="space-y-3 border border-primary/40 bg-primary/5 p-4">
      <div className="space-y-1">
        <p className="text-sm font-semibold">Your new API key</p>
        <p className="text-sm text-muted-foreground">
          Copy it now. We store only a hash, so this is the only time it will
          ever be shown.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap border bg-background px-3 py-2 font-mono text-xs">
          {rawKey}
        </code>
        <Button size="sm" onClick={() => void copy()}>
          {copied ? "Copied" : "Copy key"}
        </Button>
      </div>
      <Button size="sm" variant="outline" onClick={onDismiss}>
        I have copied it
      </Button>
    </div>
  )
}

export default function ApiKeysSection() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([])
  const [loaded, setLoaded] = useState(false)
  const [name, setName] = useState("")
  const [creating, setCreating] = useState(false)
  const [rawKey, setRawKey] = useState<string | null>(null)
  const [revokeOpen, setRevokeOpen] = useState<number | null>(null)

  const load = useCallback(async () => {
    try {
      setKeys(await listApiKeys())
    } catch (error) {
      toastApiError(error, "Could not load your API keys.")
    } finally {
      setLoaded(true)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => void load(), 0)
    return () => clearTimeout(timer)
  }, [load])

  async function create() {
    setCreating(true)
    try {
      const created = await createApiKey(name.trim())
      setRawKey(created.key)
      setName("")
      await load()
    } catch (error) {
      toastApiError(error, "Could not create the key.")
    } finally {
      setCreating(false)
    }
  }

  async function revoke(key: ApiKeyItem) {
    try {
      await revokeApiKey(key.id)
      setRevokeOpen(null)
      toast.success("Key revoked. Requests using it fail from now on.")
      await load()
    } catch (error) {
      toastApiError(error, "Could not revoke the key.")
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="font-heading text-xl font-semibold">API keys</h2>
        <p className="max-w-prose text-sm text-muted-foreground">
          Keys let scripts, bots, and CI jobs run name checks as you, spending
          your searches and credits. Each key is shown once at creation and
          only its hash is stored, so copy it before you close the reveal.
        </p>
      </div>

      {rawKey ? <RevealPanel rawKey={rawKey} onDismiss={() => setRawKey(null)} /> : null}

      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(event) => {
          event.preventDefault()
          if (!creating) void create()
        }}
      >
        <div className="min-w-48 flex-1 space-y-1">
          <Label htmlFor="key-name">Key name</Label>
          <Input
            id="key-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="CI checks, Slack bot, laptop script"
            maxLength={100}
          />
        </div>
        <Button type="submit" disabled={creating}>
          {creating ? "Creating…" : "Create key"}
        </Button>
      </form>

      {!loaded ? (
        <p className="text-sm text-muted-foreground">Loading your keys…</p>
      ) : keys.length === 0 ? (
        <p className="border border-dashed p-6 text-sm text-muted-foreground">
          No API keys yet. Create one above to run checks from a script or
          another tool.
        </p>
      ) : (
        <ul className="divide-y divide-border border">
          {keys.map((key) => (
            <li
              key={key.id}
              className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3"
            >
              <div className="min-w-0 space-y-0.5">
                <p className="truncate text-sm font-medium">
                  {key.name || "Unnamed key"}
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                  {key.prefix}…
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>
                  Last used{" "}
                  {key.last_used_at
                    ? formatDateTime(key.last_used_at)
                    : "never"}
                </span>
                <span>Created {formatDateTime(key.created_at)}</span>
              </div>
              <AlertDialog
                open={revokeOpen === key.id}
                onOpenChange={(next) => setRevokeOpen(next ? key.id : null)}
              >
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="outline" className="text-destructive">
                    Revoke
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Revoke {key.name || "this key"}?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Anything using this key stops working immediately. This
                      cannot be undone, and a replacement has to be created
                      and copied again.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep it</AlertDialogCancel>
                    <AlertDialogAction asChild>
                      <Button
                        variant="destructive"
                        onClick={() => void revoke(key)}
                      >
                        Revoke key
                      </Button>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
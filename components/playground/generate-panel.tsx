"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { SandboxRunStatus } from "@/lib/api"
import { toastApiError } from "@/lib/api-errors"
import { useDashboardStore } from "@/lib/store/dashboard"

const COUNTS = [4, 5, 6, 7, 8]

/**
 * The run controls: how many ideas, which way to steer them, and the
 * run's own status. The count is a pick of four to eight because four
 * is where the studios stop disagreeing and eight is where a person
 * stops reading.
 */
export default function GeneratePanel({
  publicId,
  runStatus,
  runError,
  hasIdeas,
}: {
  publicId: string
  runStatus: SandboxRunStatus
  runError: string | null
  hasIdeas: boolean
}) {
  const startGeneration = useDashboardStore((state) => state.startGeneration)
  const [count, setCount] = useState(6)
  const [seed, setSeed] = useState("")
  const [pending, setPending] = useState(false)
  const generating = runStatus === "generating" || pending

  async function run() {
    setPending(true)
    try {
      await startGeneration(publicId, {
        count,
        seed: seed.trim() || undefined,
      })
      toast("The studios are working. Ideas land as the judge keeps them.")
    } catch (error) {
      toastApiError(error, "Could not start a run.")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="border p-5">
      <p className="font-heading text-xl font-semibold">Generate ideas</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {hasIdeas
          ? "Four studios argue from different angles and a judge keeps the strongest, so a batch spreads rather than repeats."
          : "Four studios argue from different angles and a judge keeps the strongest. Your first batch lands here."}
      </p>

      {runStatus === "failed" && runError ? (
        <p className="mt-3 border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {runError}
        </p>
      ) : null}

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
          <Select
            value={String(count)}
            onValueChange={(value) => setCount(Number(value))}
          >
            <SelectTrigger id="gen-count" className="w-full sm:w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COUNTS.map((value) => (
                <SelectItem key={value} value={String(value)}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button className="mt-4" disabled={generating} onClick={() => void run()}>
        {generating ? "Generating..." : "Generate ideas"}
      </Button>
      {generating ? (
        <div className="mt-4 space-y-2" aria-label="Generating ideas">
          <div className="h-5 w-2/3 animate-pulse bg-muted" />
          <div className="h-3 w-full animate-pulse bg-muted" />
          <div className="h-3 w-4/5 animate-pulse bg-muted" />
        </div>
      ) : null}
    </div>
  )
}

"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ApiError, runCheck, type CheckReport as Report } from "@/lib/api"
import CheckReport from "./check-report"

export default function NameCheckPanel({
  searchId: _searchId,
  nameId,
  name,
}: {
  searchId: number
  nameId: number
  name: string
}) {
  void _searchId
  const [report, setReport] = useState<Report | null>(null)
  const [checking, setChecking] = useState(false)

  async function onCheck() {
    setReport(null)
    setChecking(true)
    try {
      setReport(await runCheck(nameId, {}))
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "The check failed. Try again in a moment."
      )
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="space-y-3 border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-heading text-xl">{name}</p>
        <Button
          size="sm"
          variant="outline"
          disabled={checking}
          onClick={() => void onCheck()}
        >
          {checking ? "Checking…" : report ? "Re-check" : "Run check"}
        </Button>
      </div>
      {checking ? (
        <p className="text-sm text-muted-foreground">
          Checking across domains, handles, and AI models. This can take up to a
          minute…
        </p>
      ) : null}
      {report ? <CheckReport report={report} /> : null}
    </div>
  )
}

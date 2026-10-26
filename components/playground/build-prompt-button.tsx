"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  getBuildPrompt,
  startBuildPrompt,
  type BuildPromptState,
} from "@/lib/api"
import { toastApiError } from "@/lib/api-errors"
import { playSound } from "@/lib/sound/engine"
import { useDashboardStore } from "@/lib/store/dashboard"

export default function BuildPromptButton({
  ideaId,
  status,
  hasNames,
}: {
  ideaId: string
  status: BuildPromptState
  hasNames: boolean
}) {
  const setStatus = useDashboardStore((state) => state.setBuildPromptStatus)
  const [busy, setBusy] = useState(false)

  const copyPrompt = useCallback(
    async (prompt: string) => {
      try {
        await navigator.clipboard.writeText(prompt)
        playSound("spark", `build-prompt:${ideaId}`)
        toast.success(
          hasNames
            ? "Prompt copied — paste it into any AI agent."
            : "Prompt copied. It opens by asking your founder to pick a name on unclaimedbyai.com/dashboard."
        )
      } catch {
        toast.error("The prompt could not be copied.")
      }
    },
    [ideaId, hasNames]
  )

  useEffect(() => {
    if (status !== "generating") return
    let cancelled = false
    let attempts = 0
    const id = setInterval(() => {
      attempts += 1
      if (attempts > 40) {
        clearInterval(id)
        return
      }
      void getBuildPrompt(ideaId)
        .then((state) => {
          if (cancelled) return
          setStatus(ideaId, state.status)
          if (state.status === "ready" && state.prompt) {
            void copyPrompt(state.prompt)
          } else if (state.status === "failed") {
            toast.error(state.error ?? "The prompt could not be written.")
          }
        })
        .catch(() => {})
    }, 3000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [status, ideaId, copyPrompt, setStatus])

  async function onClick() {
    if (status === "ready") {
      setBusy(true)
      try {
        const state = await getBuildPrompt(ideaId)
        if (state.prompt) {
          await copyPrompt(state.prompt)
        } else {
          setStatus(ideaId, state.status)
        }
      } catch (error) {
        toastApiError(error, "The prompt could not load.")
      } finally {
        setBusy(false)
      }
      return
    }
    setBusy(true)
    try {
      await startBuildPrompt(ideaId)
      setStatus(ideaId, "generating")
      toast("The prompt is being written. It copies itself when ready.")
    } catch (error) {
      toastApiError(error, "The prompt could not start.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={busy || status === "generating"}
      onClick={() => void onClick()}
    >
      {status === "generating"
        ? "Writing prompt…"
        : status === "ready"
          ? "Copy build prompt"
          : "Build prompt"}
    </Button>
  )
}

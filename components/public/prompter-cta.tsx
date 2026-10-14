"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Prompter, { type PrompterMode } from "@/components/app/prompter"
import { useTurnstile } from "@/components/public/turnstile"
import { getAnonSessionId } from "@/lib/anon"
import {
  ApiError,
  directCheck,
  generateFilledSearch,
  getMe,
} from "@/lib/api"
import { toastApiError } from "@/lib/api-errors"

export const PENDING_BRIEF_KEY = "uba-pending-brief"

export default function PrompterCta({
  defaultValue = "",
}: {
  defaultValue?: string
}) {
  const [pending, setPending] = useState(false)
  const [lastMode, setLastMode] = useState<PrompterMode>("idea")
  const router = useRouter()
  const turnstile = useTurnstile("anonymous_generate")

  async function onSubmit(value: string, mode: PrompterMode) {
    setPending(true)
    setLastMode(mode)
    try {
      const user = await getMe(5000).catch(() => null)
      if (user) {
        if (mode === "name") {
          const result = await directCheck({ name: value })
          router.push(`/dashboard/history/${result.search_id}`)
          return
        }
        try {
          sessionStorage.setItem(PENDING_BRIEF_KEY, value)
        } catch {
          // Storage unavailable; the query param still carries the brief.
        }
        router.push(`/dashboard?brief=${encodeURIComponent(value)}`)
        return
      }
      // Wait briefly for an in-flight first solve so a fast submit does
      // not race the widget and eat an avoidable 403.
      const token = await turnstile.waitForToken(2000)
      if (mode === "name") {
        const result = await directCheck({
          name: value,
          anon_session_id: getAnonSessionId(),
          cf_turnstile_token: token ?? undefined,
        })
        router.push(
          `/results/${result.search_id}?sid=${encodeURIComponent(getAnonSessionId())}`
        )
        return
      }
      const search = await generateFilledSearch({
        query: value,
        anon_session_id: getAnonSessionId(),
        cf_turnstile_token: token ?? undefined,
      })
      router.push(
        `/results/${search.id}?sid=${encodeURIComponent(getAnonSessionId())}`
      )
    } catch (error) {
      setPending(false)
      turnstile.reset()
      if (error instanceof ApiError && error.status === 403) {
        toast.error(
          "The human check didn't pass. Give it another go in a moment."
        )
        return
      }
      toastApiError(error, "Something went wrong. Try again.")
    }
  }

  return (
    <div className="space-y-3">
      <Prompter
        onSubmit={(value, mode) => void onSubmit(value, mode)}
        pending={pending}
        defaultValue={defaultValue}
      />
      {pending ? (
        <p role="status" className="text-center text-sm text-muted-foreground">
          {lastMode === "name"
            ? "Checking that name. Domains and handles stream in as they come back."
            : "Starting your search… you'll see names arrive live."}
        </p>
      ) : null}
      {turnstile.widget}
    </div>
  )
}
